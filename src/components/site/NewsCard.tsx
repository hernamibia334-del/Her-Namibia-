import { useState } from "react";
import { CalendarDays, ExternalLink, Images } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ImageLightbox } from "./ImageLightbox";
import { ReadMoreLink } from "./ReadMoreLink";
import { truncateWords } from "@/lib/excerpt";

export type NewsArticle = {
  id: string;
  title: string;
  summary?: string | null;
  content: string;
  news_date: string;
  sector?: string | null;
  category?: string | null;
  image_urls: string[];
  external_link?: string | null;
  status: string;
  created_at?: string | null;
};

type NewsCardProps = {
  article: NewsArticle;
  readMoreHref?: string;
  onReadMore?: () => void;
};

export function NewsCard({ article, readMoreHref, onReadMore }: NewsCardProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const body = article.summary || article.content;
  const { excerpt, truncated } = truncateWords(body);
  const showReadMore = Boolean(readMoreHref || (onReadMore && truncated));

  const images = article.image_urls;
  const currentImage = images[activeImageIndex] || images[0];

  const handleOpenLightbox = (index: number) => {
    setActiveImageIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <article
        id={`item-${article.id}`}
        className="hover-lift flex h-full flex-col overflow-hidden rounded-xl border-2 border-primary bg-card shadow-card"
      >
        {currentImage && (
          <div
            className="relative aspect-[16/10] w-full overflow-hidden bg-muted group cursor-pointer"
            onClick={() => handleOpenLightbox(activeImageIndex)}
          >
            <img
              src={currentImage}
              alt={article.title}
              loading="lazy"
              className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="inline-flex items-center gap-2 rounded-full bg-black/75 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md">
                View Fullscreen
              </span>
            </div>
            {article.category && (
              <div className="absolute left-3 top-3 z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-card/90 px-3 py-1 text-xs font-bold text-primary shadow-sm backdrop-blur-md">
                  {article.category}
                </span>
              </div>
            )}
            {images.length > 1 && (
              <div className="absolute right-3 bottom-3 z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                  <Images className="size-3.5 text-accent" />
                  {activeImageIndex + 1} / {images.length}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-center justify-between gap-2 text-xs font-semibold text-accent">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4" />
              {new Date(article.news_date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            {article.sector && (
              <Badge variant="outline" className="text-[11px]">
                {article.sector}
              </Badge>
            )}
          </div>

          <h3 className="mt-2.5 text-lg font-bold text-foreground leading-snug">{article.title}</h3>

          <p className="mt-2.5 text-sm whitespace-pre-line text-muted-foreground leading-relaxed">
            {excerpt}
          </p>

          {article.external_link && (
            <a
              href={article.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
            >
              <ExternalLink className="size-3.5" />
              External source
            </a>
          )}

          {showReadMore && (
            <div className="mt-auto flex justify-end pt-4">
              <ReadMoreLink href={readMoreHref} onClick={onReadMore} />
            </div>
          )}
        </div>
      </article>

      <ImageLightbox
        images={images}
        currentIndex={activeImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setActiveImageIndex}
        title={article.title}
      />
    </>
  );
}
