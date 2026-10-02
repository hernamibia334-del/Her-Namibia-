import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Newspaper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "./Reveal";
import { takeLatestByDate } from "@/lib/latest";
import { NewsCard, type NewsArticle } from "./NewsCard";

export type { NewsArticle };

async function fetchPublishedNews(): Promise<NewsArticle[]> {
  const { data, error } = await supabase
    .from("news")
    .select("id,title,summary,content,news_date,sector,category,image_urls,external_link,status,created_at")
    .eq("status", "published")
    .order("news_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? [])
    .map((row) => ({
      ...row,
      image_urls: Array.isArray(row.image_urls) ? (row.image_urls as string[]) : [],
    }))
    .filter((row) => row.category !== "Podcast") as NewsArticle[];
}

export function RecentNews() {
  const { data, isLoading } = useQuery({
    queryKey: ["news", "published"],
    queryFn: fetchPublishedNews,
  });

  const allItems = data ?? [];
  const latestItems = takeLatestByDate(allItems, "news_date");

  return (
    <section id="news" className="scroll-mt-24 bg-surface py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold tracking-[0.2em] text-accent">MEDIA & ANNOUNCEMENTS</span>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">News & Updates</h2>
        </Reveal>

        {isLoading ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : latestItems.length === 0 ? (
          <Reveal className="mt-12 rounded-xl border-2 border-dashed border-primary bg-card p-12 text-center">
            <Newspaper className="mx-auto size-10 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">
              News and updates will be published here soon.
            </p>
          </Reveal>
        ) : (
          <>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {latestItems.map((article, i) => (
                <Reveal key={article.id} delay={i * 90}>
                  <NewsCard article={article} readMoreHref={`/news?open=${article.id}`} />
                </Reveal>
              ))}
            </div>

            {/* View All News Button */}
            <div className="mt-12 text-center">
              <a
                href="/news"
                className="inline-flex items-center gap-2 rounded-full bg-accent-gradient px-8 py-3.5 text-sm font-semibold text-accent-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
              >
                View all news ({allItems.length})
                <ArrowRight className="size-4" />
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
