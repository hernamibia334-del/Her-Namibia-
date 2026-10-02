import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter, FolderKanban, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { ProjectCard } from "@/components/site/ProjectCard";
import { ArticleReader } from "@/components/site/ArticleReader";
import { SearchField } from "@/components/site/SearchField";
import { WorkUpdate } from "@/components/site/RecentWork";
import { KEY_SECTORS } from "@/lib/sectors";
import { matchesSearch } from "@/lib/search";

const TITLE = "Articles | Her Namibia";
const DESCRIPTION =
  "Read articles and reported stories about remarkable women from across Namibia.";

export const Route = createFileRoute("/projects")({
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
  component: ProjectsPage,
});

async function fetchAllPublishedWork(): Promise<WorkUpdate[]> {
  const { data, error } = await supabase
    .from("work_updates")
    .select("id,title,description,image_urls,work_date,status,sector")
    .eq("status", "published")
    .order("work_date", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => ({
    ...row,
    image_urls: Array.isArray(row.image_urls) ? (row.image_urls as string[]) : [],
  }));
}

function ProjectsPage() {
  const { open } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState<string>("ALL");

  const { data = [], isLoading } = useQuery({
    queryKey: ["work_updates", "all_published"],
    queryFn: fetchAllPublishedWork,
  });
  const selectedArticle = data.find((item) => item.id === open) ?? null;

  // Filter projects by search term and sector
  const filteredProjects = useMemo(() => {
    return data.filter((item) => {
      // Sector filter
      if (selectedSector !== "ALL") {
        const itemSector = (item.sector ?? "Other").trim().toLowerCase();
        const targetSector = selectedSector.trim().toLowerCase();
        if (itemSector !== targetSector) return false;
      }

      if (!matchesSearch(searchTerm, [item.title, item.description, item.sector])) return false;

      return true;
    });
  }, [data, selectedSector, searchTerm]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSector("ALL");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="bg-primary py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-5 text-center lg:px-8">
            <Reveal className="mx-auto max-w-3xl">
              <h1 className="text-3xl font-extrabold text-primary-foreground sm:text-4xl lg:text-5xl">
                Articles
              </h1>
              <p className="mt-4 text-lg text-primary-foreground/90">
                Read articles and reported stories about remarkable women from across Namibia.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Filter and Search Bar Section */}
        <section className="border-b border-border bg-surface py-8">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              {/* Search Bar */}
              <SearchField
                label="Search articles"
                value={searchTerm}
                placeholder="Search articles..."
                onChange={(value) => {
                  setSearchTerm(value);
                  if (open) void navigate({ search: { open: undefined }, replace: true });
                }}
              />

              {/* Active Filter Counter */}
              <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5 font-bold text-foreground">
                  <FolderKanban className="size-4 text-accent" />
                  {filteredProjects.length} {filteredProjects.length === 1 ? "Article" : "Articles"} Found
                </span>
                {(selectedSector !== "ALL" || searchTerm) && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20"
                  >
                    <X className="size-3" /> Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* Key Operating Sectors Filter Chips */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="size-3.5 text-accent" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Filter by Category
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSector("ALL")}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                    selectedSector === "ALL"
                      ? "bg-accent text-accent-foreground shadow-sm"
                      : "border border-border bg-card text-muted-foreground hover:border-accent hover:text-foreground"
                  }`}
                >
                  All Categories
                </button>
                {KEY_SECTORS.map((sector) => (
                  <button
                    key={sector}
                    type="button"
                    onClick={() => setSelectedSector(sector)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                      selectedSector === sector
                        ? "bg-accent text-accent-foreground shadow-sm"
                        : "border border-border bg-card text-muted-foreground hover:border-accent hover:text-foreground"
                    }`}
                  >
                    {sector}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Projects Grid Section */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-80 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="mx-auto max-w-xl rounded-2xl border-2 border-dashed border-primary/30 bg-card p-8 text-center shadow-card sm:p-16">
                <FolderKanban className="mx-auto size-12 text-muted-foreground/60" />
                <h3 className="mt-4 text-lg font-bold text-foreground">No projects found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  No articles match your current search or category.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-full bg-accent-gradient px-6 py-2.5 text-xs font-semibold text-accent-foreground shadow-sm hover:shadow-card"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project, i) => (
                  <Reveal key={project.id} delay={i * 60}>
                    <ProjectCard
                      project={project}
                      onReadMore={() => void navigate({ search: { open: project.id }, replace: true })}
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
        body={selectedArticle?.description ?? ""}
        date={
          selectedArticle
            ? new Date(selectedArticle.work_date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : undefined
        }
        images={selectedArticle?.image_urls ?? []}
        meta={selectedArticle?.sector ? <span>{selectedArticle.sector}</span> : null}
      />
    </div>
  );
}
