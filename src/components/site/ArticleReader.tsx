import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, X } from "lucide-react";
import { ImageLightbox } from "./ImageLightbox";

type ArticleReaderProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  body: string;
  date?: string | null;
  images?: string[];
  meta?: ReactNode;
  footer?: ReactNode;
};

export function ArticleReader({
  open,
  onClose,
  title,
  body,
  date,
  images = [],
  meta,
  footer,
}: ArticleReaderProps) {
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !lightboxOpen) onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, lightboxOpen]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[90] flex flex-col bg-background"
        role="dialog"
        aria-modal="true"
        aria-labelledby="article-reader-title"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border bg-card px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:gap-4 sm:px-8 sm:py-4">
          <div className="min-w-0">
            <h2 id="article-reader-title" className="text-lg font-bold leading-snug text-foreground sm:text-2xl">
              {title}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-accent">
              {date && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" />
                  {date}
                </span>
              )}
              {meta}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted"
            aria-label="Close article"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-8 sm:px-8">
          <div className="mx-auto max-w-3xl">
            {images.length > 0 && (
              <div className={`mb-8 grid gap-4 ${images.length > 1 ? "sm:grid-cols-2" : ""}`}>
                {images.map((src, index) => (
                  <button
                    key={`${src}-${index}`}
                    type="button"
                    onClick={() => {
                      setLightboxIndex(index);
                      setLightboxOpen(true);
                    }}
                    className="group relative overflow-hidden rounded-xl border-2 border-primary bg-muted"
                  >
                    <img
                      src={src}
                      alt={`${title} image ${index + 1}`}
                      className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-black/65 px-3 py-2 text-left text-xs font-semibold text-white">
                      View image {index + 1}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <p className="whitespace-pre-line text-base leading-relaxed text-foreground">{body}</p>

            {footer && <div className="mt-10 border-t border-border pt-6">{footer}</div>}
          </div>
        </div>
      </div>

      <ImageLightbox
        images={images}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
        title={title}
      />
    </>,
    document.body,
  );
}
