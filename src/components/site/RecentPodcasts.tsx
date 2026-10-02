import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Mic, PlayCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PODCAST_CATEGORY } from "@/lib/sectors";
import { unpackEpisodeMeta } from "@/lib/podcast";
import { truncateWords } from "@/lib/excerpt";
import { takeLatestByDate } from "@/lib/latest";
import { Reveal } from "./Reveal";
import { ReadMoreLink } from "./ReadMoreLink";

export type PodcastEpisode = {
  id: string;
  title: string;
  summary?: string | null;
  content: string;
  news_date: string;
  sector?: string | null;
  image_urls: string[];
  external_link?: string | null;
  status: string;
  created_at?: string | null;
};

export async function fetchPublishedEpisodes(): Promise<PodcastEpisode[]> {
  const { data, error } = await supabase
    .from("news")
    .select("id,title,summary,content,news_date,sector,category,image_urls,external_link,status,created_at")
    .eq("status", "published")
    .eq("category", PODCAST_CATEGORY)
    .order("news_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => ({
    ...row,
    image_urls: Array.isArray(row.image_urls) ? (row.image_urls as string[]) : [],
  }));
}

export function EpisodeCard({
  episode,
  readMoreHref,
  onReadMore,
}: {
  episode: PodcastEpisode;
  readMoreHref?: string;
  onReadMore?: () => void;
}) {
  const { guest, duration } = unpackEpisodeMeta(episode.summary);
  const { excerpt, truncated } = truncateWords(episode.content);
  const showReadMore = Boolean(readMoreHref || (onReadMore && truncated));
  const image = episode.image_urls[0];

  return (
    <article
      id={`item-${episode.id}`}
      className="hover-lift group flex h-full flex-col overflow-hidden rounded-xl border-2 border-primary bg-card shadow-card"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-primary/10">
        {image ? (
          <img src={image} alt="" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="grid size-full place-items-center bg-primary">
            <Mic className="size-10 text-primary-foreground/70" />
          </div>
        )}
        {episode.external_link && (
          <a
            href={episode.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 flex items-center justify-center bg-primary/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            aria-label="Play episode"
          >
            <PlayCircle className="size-12 text-background" />
          </a>
        )}
        {episode.sector && (
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-bold text-primary backdrop-blur-md">
            {episode.sector}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-bold text-primary transition-colors group-hover:text-accent">{episode.title}</h3>
        {guest && <p className="mt-1 text-sm font-semibold text-muted-foreground">with {guest}</p>}
        <p className="mt-2 text-sm whitespace-pre-line text-muted-foreground">{excerpt}</p>
        {duration && (
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Mic className="size-4 text-accent" />
            {duration}
          </p>
        )}
        {showReadMore && (
          <div className="mt-auto flex justify-end pt-4">
            <ReadMoreLink href={readMoreHref} onClick={onReadMore} />
          </div>
        )}
      </div>
    </article>
  );
}

export function RecentPodcasts() {
  const { data, isLoading } = useQuery({
    queryKey: ["podcast", "published"],
    queryFn: fetchPublishedEpisodes,
  });

  const allItems = data ?? [];
  const latest = takeLatestByDate(allItems, "news_date");

  return (
    <section id="podcast" className="scroll-mt-24 bg-surface py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold tracking-[0.2em] text-accent">THE PODCAST</span>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Listen & Watch</h2>
          <p className="mt-4 text-muted-foreground">
            Conversations with women across Namibia, in their own words.
          </p>
        </Reveal>

        {isLoading ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : latest.length === 0 ? (
          <Reveal className="mt-12 rounded-xl border-2 border-dashed border-primary bg-card p-12 text-center">
            <Mic className="mx-auto mb-3 size-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">New episodes will be published here soon.</p>
          </Reveal>
        ) : (
          <>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {latest.map((episode, i) => (
                <Reveal key={episode.id} delay={i * 90}>
                  <EpisodeCard episode={episode} readMoreHref={`/podcast?open=${episode.id}`} />
                </Reveal>
              ))}
            </div>
            <div className="mt-12 text-center">
              <a
                href="/podcast"
                className="inline-flex items-center gap-2 rounded-full bg-accent-gradient px-8 py-3.5 text-sm font-semibold text-accent-foreground shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
              >
                All episodes ({allItems.length})
                <ArrowRight className="size-4" />
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
