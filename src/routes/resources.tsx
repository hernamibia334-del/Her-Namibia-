import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter, FileText, Download, ExternalLink, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { ArticleReader } from "@/components/site/ArticleReader";
import { ResourceCard, type Resource } from "@/components/site/ResourceCard";
import { SearchField } from "@/components/site/SearchField";
import { KEY_SECTORS, RESOURCE_TYPES } from "@/lib/sectors";
import { matchesSearch } from "@/lib/search";

const TITLE = "Resources & Insights | Her Namibia";
const DESCRIPTION = "Explore guides, toolkits, and resources for women's empowerment, leadership, and personal growth.";

export const Route = createFileRoute("/resources")({
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
  component: ResourcesPage,
});

async function fetchAllPublishedResources(): Promise<Resource[]> {
  const { data, error } = await supabase
    .from("resources")
    .select("id,title,description,resource_type,sector,file_url,external_url,author,publication_date,status")
    .eq("status", "published")
    .order("publication_date", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Resource[];
}

function ResourcesPage() {
  const { open } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  const { data = [], isLoading } = useQuery({
    queryKey: ["resources", "all_published"],
    queryFn: fetchAllPublishedResources,
  });
  const selectedResource = data.find((item) => item.id === open) ?? null;

  const filteredResources = useMemo(() => {
    return data.filter((item) => {
      // Sector filter
      if (selectedSector !== "ALL") {
        const itemSector = (item.sector ?? "Other").trim().toLowerCase();
        const targetSector = selectedSector.trim().toLowerCase();
        if (itemSector !== targetSector) return false;
      }

      // Type filter
      if (selectedType !== "ALL") {
        if (item.resource_type !== selectedType) return false;
      }

      if (!matchesSearch(searchTerm, [item.title, item.description, item.sector, item.resource_type])) {
        return false;
      }

      return true;
    });
  }, [data, selectedSector, selectedType, searchTerm]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSector("ALL");
    setSelectedType("ALL");
  };

  const isFiltered = searchTerm !== "" || selectedSector !== "ALL" || selectedType !== "ALL";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="bg-primary py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-5 text-center lg:px-8">
            <Reveal className="mx-auto max-w-3xl">
              <h1 className="text-3xl font-extrabold text-primary-foreground sm:text-4xl lg:text-5xl">
                Resources & Insights
              </h1>
              <p className="mt-4 text-lg text-primary-foreground/90">
                Explore guides, toolkits, and resources to support your journey in 
                leadership, business, motherhood, and personal growth.
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
                label="Search resources"
                value={searchTerm}
                placeholder="Search resources..."
                onChange={(value) => {
                  setSearchTerm(value);
                  if (open) void navigate({ search: { open: undefined }, replace: true });
                }}
              />

              {/* Counter and Clear Filters */}
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <FileText className="size-4 text-accent" />
                  {filteredResources.length} {filteredResources.length === 1 ? "Resource" : "Resources"} Found
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

            {/* Resource Type Filter Chips */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Filter by Type:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedType("ALL")}
                  className={`rounded-full px-3.5 py-1 text-xs font-medium transition-all duration-300 ${
                    selectedType === "ALL"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "border border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All Types
                </button>
                {RESOURCE_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`rounded-full px-3.5 py-1 text-xs font-medium transition-all duration-300 ${
                      selectedType === type
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "border border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Resources Grid Section */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-80 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center sm:p-12">
                <FileText className="mx-auto size-12 text-muted-foreground/40 mb-3" />
                <h3 className="text-lg font-bold text-foreground">No resources found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isFiltered
                    ? "Try adjusting your search keywords, category, or type filters."
                    : "No published resources are available at the moment."}
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
                {filteredResources.map((item, i) => (
                  <Reveal key={item.id} delay={i * 60}>
                    <ResourceCard
                      item={item}
                      onReadMore={() => void navigate({ search: { open: item.id }, replace: true })}
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
        open={Boolean(selectedResource)}
        onClose={() => void navigate({ search: { open: undefined }, replace: true })}
        title={selectedResource?.title ?? ""}
        body={selectedResource?.description ?? ""}
        date={
          selectedResource
            ? new Date(selectedResource.publication_date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : undefined
        }
        meta={
          selectedResource ? (
            <>
              <span>{selectedResource.resource_type}</span>
              {selectedResource.sector && <span>{selectedResource.sector}</span>}
            </>
          ) : null
        }
        footer={
          selectedResource && (selectedResource.file_url || selectedResource.external_url) ? (
            <div className="flex flex-wrap gap-4">
              {selectedResource.file_url && (
                <a
                  href={selectedResource.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
                >
                  <Download className="size-4" />
                  Download Document
                </a>
              )}
              {selectedResource.external_url && (
                <a
                  href={selectedResource.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
                >
                  <ExternalLink className="size-4" />
                  External Source
                </a>
              )}
            </div>
          ) : null
        }
      />
    </div>
  );
}
