import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { takeLatestByDate } from "@/lib/latest";
import { Reveal } from "./Reveal";
import { ProjectCard } from "./ProjectCard";

export type WorkUpdate = {
  id: string;
  title: string;
  description: string;
  image_urls: string[];
  work_date: string;
  status: string;
  sector?: string | null;
  created_at?: string | null;
};

async function fetchPublishedWork(): Promise<WorkUpdate[]> {
  const { data, error } = await supabase
    .from("work_updates")
    .select("id,title,description,image_urls,work_date,status,sector,created_at")
    .eq("status", "published")
    .order("work_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    ...row,
    image_urls: Array.isArray(row.image_urls) ? (row.image_urls as string[]) : [],
  }));
}

export function RecentWork() {
  const { data, isLoading } = useQuery({
    queryKey: ["work_updates", "published"],
    queryFn: fetchPublishedWork,
  });

  const allItems = data ?? [];
  const latestThreeItems = takeLatestByDate(allItems, "work_date");

  return (
    <section id="work" className="bg-surface py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold tracking-[0.2em] text-accent">FROM THE DESK</span>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Articles</h2>
          <p className="mt-4 text-muted-foreground">
            Reported stories and features on the women shaping Namibia.
          </p>
        </Reveal>

        {isLoading ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : latestThreeItems.length === 0 ? (
          <Reveal className="mt-12 rounded-xl border-2 border-dashed border-primary bg-card p-12 text-center">
            <p className="text-muted-foreground">
              New articles will be published here soon.
            </p>
          </Reveal>
        ) : (
          <>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {latestThreeItems.map((item, i) => (
                <Reveal key={item.id} delay={i * 90}>
                  <ProjectCard project={item} readMoreHref={`/projects?open=${item.id}`} />
                </Reveal>
              ))}
            </div>

            {/* View All Projects Button */}
            <div className="mt-12 text-center">
              <a
                href="/projects"
                className="inline-flex items-center gap-2 rounded-full bg-accent-gradient px-8 py-3.5 text-sm font-semibold text-accent-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
              >
                View all articles ({allItems.length})
                <ArrowRight className="size-4" />
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
