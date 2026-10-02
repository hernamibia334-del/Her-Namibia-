import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Filter, Mic } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import { ArticleReader } from "@/components/site/ArticleReader";
import { EpisodeCard, fetchPublishedEpisodes } from "@/components/site/RecentPodcasts";
import { SearchField } from "@/components/site/SearchField";
import { KEY_SECTORS } from "@/lib/sectors";
import { unpackEpisodeMeta } from "@/lib/podcast";
import { matchesSearch } from "@/lib/search";

const TITLE = "Podcast | Her Namibia";
const DESCRIPTION =
  "Listen to Her Namibia conversations with women across business, leadership, health, motherhood, culture, and the next generation.";

export const Route = createFileRoute("/podcast")({
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
  component: PodcastPage,
});

function PodcastPage() {
  const { open } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("ALL");

  const { data = [], isLoading } = useQuery({
    queryKey: ["podcast", "all_published"],
    queryFn: fetchPublishedEpisodes,
  });
  const selectedEpisode = data.find((item) => item.id === open) ?? null;
  const selectedMeta = selectedEpisode ? unpackEpisodeMeta(selectedEpisode.summary) : null;

  const filtered = useMemo(() => {
    return data.filter((item) => {
      if (selectedSector !== "ALL") {
        if ((item.sector ?? "").trim().toLowerCase() !== selectedSector.trim().toLowerCase()) return false;
      }
      const { guest, duration } = unpackEpisodeMeta(item.summary);
      if (!matchesSearch(searchTerm, [item.title, item.content, guest, duration, item.sector])) return false;
      return true;
    });
  }, [data, selectedSector, searchTerm]);

  const isFiltered = searchTerm !== "" || selectedSector !== "ALL";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24">
        <section className="bg-primary py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-5 text-center lg:px-8">
            <Reveal className="mx-auto max-w-3xl">
              <p className="text-xs font-bold tracking-[0.2em] text-accent">HER NAMIBIA</p>
              <h1 className="mt-2 text-3xl font-extrabold text-primary-foreground sm:text-4xl lg:text-5xl">Podcast</h1>
              <p className="mt-4 text-lg text-primary-foreground/90">{DESCRIPTION}</p>
            </Reveal>
          </div>
        </section>

        <section className="border-b border-border bg-surface py-8">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <SearchField
                label="Search episodes"
                value={searchTerm}
                placeholder="Search episodes..."
                onChange={(value) => {
                  setSearchTerm(value);
                  if (open) void navigate({ search: { open: undefined }, replace: true });
                }}
              />
              <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Mic className="size-4 text-accent" />
                {filtered.length} {filtered.length === 1 ? "Episode" : "Episodes"}
              </span>
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center gap-2">
                <Filter className="size-3.5 text-accent" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Filter by Category</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <FilterChip active={selectedSector === "ALL"} onClick={() => setSelectedSector("ALL")}>
                  All Categories
                </FilterChip>
                {KEY_SECTORS.map((sector) => (
                  <FilterChip key={sector} active={selectedSector === sector} onClick={() => setSelectedSector(sector)}>
                    {sector}
                  </FilterChip>
                ))}
              </div>
              {isFiltered && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedSector("ALL");
                  }}
                  className="mt-4 text-xs font-semibold text-accent hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-80 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-primary bg-card p-8 text-center sm:p-12">
                <Mic className="mx-auto mb-3 size-10 text-muted-foreground/50" />
                <h2 className="text-lg font-bold">No episodes found</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {isFiltered ? "Try another category or search." : "Episodes will appear here once they are published."}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((episode) => (
                  <EpisodeCard
                    key={episode.id}
                    episode={episode}
                    onReadMore={() => void navigate({ search: { open: episode.id }, replace: true })}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />

      <ArticleReader
        open={Boolean(selectedEpisode)}
        onClose={() => void navigate({ search: { open: undefined }, replace: true })}
        title={selectedEpisode?.title ?? ""}
        body={selectedEpisode?.content ?? ""}
        date={
          selectedEpisode
            ? new Date(selectedEpisode.news_date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : undefined
        }
        images={selectedEpisode?.image_urls ?? []}
        meta={
          selectedEpisode ? (
            <>
              {selectedEpisode.sector && <span>{selectedEpisode.sector}</span>}
              {selectedMeta?.guest && <span>with {selectedMeta.guest}</span>}
              {selectedMeta?.duration && <span>{selectedMeta.duration}</span>}
            </>
          ) : null
        }
        footer={
          selectedEpisode?.external_link ? (
            <a
              href={selectedEpisode.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
            >
              <ExternalLink className="size-4" />
              Listen to episode
            </a>
          ) : null
        }
      />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 ${
        active
          ? "bg-accent text-accent-foreground shadow-sm"
          : "border border-border bg-card text-muted-foreground hover:border-accent hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
