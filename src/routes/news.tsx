import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter, Newspaper, ExternalLink, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { ArticleReader } from "@/components/site/ArticleReader";
import { NewsCard, type NewsArticle } from "@/components/site/NewsCard";
import { SearchField } from "@/components/site/SearchField";
import { KEY_SECTORS } from "@/lib/sectors";
import { matchesSearch } from "@/lib/search";

const TITLE = "News & Stories | Her Namibia";
const DESCRIPTION = "Stay updated with the latest conversations, features, and inspiring stories from women across Namibia.";

export const Route = createFileRoute("/news")({
  validateSearch: (search: Record<string, unknown>) => ({
    open: typeof search.open === "string" ? search.open : undefined,
  }),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: NewsPage,
});

async function fetchAllPublishedNews(): Promise<NewsArticle[]> {
  const { data, error } = await supabase
    .from("news")
    .select("id,title,summary,content,news_date,sector,category,image_urls,external_link,status")
    .eq("status", "published")
    .order("news_date", { ascending: false });

  if (error) throw error;
  return (data ?? [])
    .map((row) => ({
      ...row,
      image_urls: Array.isArray(row.image_urls) ? (row.image_urls as string[]) : [],
    }))
    .filter((row) => row.category !== "Podcast") as NewsArticle[];
}

function NewsPage() {
  const { open } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState<string>("ALL");

  const { data = [], isLoading } = useQuery({
    queryKey: ["news", "all_published"],
    queryFn: fetchAllPublishedNews,
  });
  const selectedArticle = data.find((item) => item.id === open) ?? null;

  const filteredNews = useMemo(() => {
    return data.filter((item) => {
      // Sector filter
      if (selectedSector !== "ALL") {
        const itemSector = (item.sector ?? "Other").trim().toLowerCase();
        const targetSector = selectedSector.trim().toLowerCase();
        if (itemSector !== targetSector) return false;
      }

      if (!matchesSearch(searchTerm, [item.title, item.summary, item.content, item.sector, item.category])) {
        return false;
      }

      return true;
    });
  }, [data, selectedSector, searchTerm]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSector("ALL");
  };

  const isFiltered = searchTerm !== "" || selectedSector !== "ALL";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="bg-primary py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-5 text-center lg:px-8">
            <Reveal className="mx-auto max-w-3xl">
              <h1 className="text-3xl font-extrabold text-primary-foreground sm:text-4xl lg:text-5xl">
                News & Stories
              </h1>
              <p className="mt-4 text-lg text-primary-foreground/90">
                Stay updated with the latest conversations, features, and inspiring stories 
                from women across Namibia.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Filter and Search Bar Section */}
        <section className="border-b border-border bg-surface py-8">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              {/* Search input */}
              <SearchField
                label="Search news"
                value={searchTerm}
                placeholder="Search stories..."
                onChange={(value) => {
                  setSearchTerm(value);
                  if (open) void navigate({ search: { open: undefined }, replace: true });
                }}
              />

              {/* Counter and Clear Filters */}
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Newspaper className="size-4 text-accent" />
                  {filteredNews.length} {filteredNews.length === 1 ? "Story" : "Stories"} Found
                </span>
                {isFiltered && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="size-3" /> Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* Sector Filter Chips */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="size-3.5 text-accent" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Filter by Category:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSector("ALL")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 ${
                    selectedSector === "ALL"
                      ? "bg-accent text-accent-foreground shadow-sm"
                      : "border border-border bg-card text-muted-foreground hover:border-accent hover:text-foreground"
                  }`}
                >
                  All Categories
                </button>
                {KEY_SECTORS.map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setSelectedSector(sec)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 ${
                      selectedSector === sec
                        ? "bg-accent text-accent-foreground shadow-sm"
                        : "border border-border bg-card text-muted-foreground hover:border-accent hover:text-foreground"
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* News Grid Section */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-80 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center sm:p-12">
                <Newspaper className="mx-auto size-12 text-muted-foreground/40 mb-3" />
                <h3 className="text-lg font-bold text-foreground">No stories found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isFiltered
                    ? "Try adjusting your search keywords or category filters."
                    : "No published stories are available at the moment."}
                </p>
                {isFiltered && (
                  <button
                    onClick={clearFilters}
                    className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-accent-gradient px-6 py-2.5 text-xs font-semibold text-accent-foreground shadow-card"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredNews.map((article, i) => (
                  <Reveal key={article.id} delay={i * 60}>
                    <NewsCard
                      article={article}
                      onReadMore={() => void navigate({ search: { open: article.id }, replace: true })}
                    />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      <ArticleReader
        open={Boolean(selectedArticle)}
        onClose={() => void navigate({ search: { open: undefined }, replace: true })}
        title={selectedArticle?.title ?? ""}
        body={selectedArticle?.content || selectedArticle?.summary || ""}
        date={
          selectedArticle
            ? new Date(selectedArticle.news_date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : undefined
        }
        images={selectedArticle?.image_urls ?? []}
        meta={
          selectedArticle ? (
            <>
              {selectedArticle.category && <span>{selectedArticle.category}</span>}
              {selectedArticle.sector && <span>{selectedArticle.sector}</span>}
            </>
          ) : null
        }
        footer={
          selectedArticle?.external_link ? (
            <a
              href={selectedArticle.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
            >
              <ExternalLink className="size-4" />
              External source
            </a>
          ) : null
        }
      />
    </div>
  );
}
