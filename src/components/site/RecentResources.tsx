import { useQuery } from "@tanstack/react-query";
import { ArrowRight, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "./Reveal";
import { takeLatestByDate } from "@/lib/latest";
import { ResourceCard, type Resource } from "./ResourceCard";

export type { Resource };

async function fetchPublishedResources(): Promise<Resource[]> {
  const { data, error } = await supabase
    .from("resources")
    .select("id,title,description,resource_type,sector,file_url,external_url,author,publication_date,status,created_at")
    .eq("status", "published")
    .order("publication_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Resource[];
}

export function RecentResources() {
  const { data, isLoading } = useQuery({
    queryKey: ["resources", "published"],
    queryFn: fetchPublishedResources,
  });

  const allItems = data ?? [];
  const latestItems = takeLatestByDate(allItems, "publication_date");

  return (
    <section id="resources" className="scroll-mt-24 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold tracking-[0.2em] text-accent">KNOWLEDGE & ADVISORY</span>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Resources & Publications</h2>
        </Reveal>

        {isLoading ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : latestItems.length === 0 ? (
          <Reveal className="mt-12 rounded-xl border-2 border-dashed border-primary bg-card p-12 text-center">
            <FileText className="mx-auto size-10 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">
              New policy briefs, toolkits, and research reports will be published here soon.
            </p>
          </Reveal>
        ) : (
          <>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {latestItems.map((item, i) => (
                <Reveal key={item.id} delay={i * 90}>
                  <ResourceCard item={item} readMoreHref={`/resources?open=${item.id}`} />
                </Reveal>
              ))}
            </div>

            {/* View All Resources Button */}
            <div className="mt-12 text-center">
              <a
                href="/resources"
                className="inline-flex items-center gap-2 rounded-full bg-accent-gradient px-8 py-3.5 text-sm font-semibold text-accent-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
              >
                View all resources ({allItems.length})
                <ArrowRight className="size-4" />
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
