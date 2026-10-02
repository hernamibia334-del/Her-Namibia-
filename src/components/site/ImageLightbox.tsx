import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  title?: string;
}

export function ImageLightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  title,
}: ImageLightboxProps) {
  const currentImage = images[currentIndex];

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    const nextIndex = (currentIndex - 1 + images.length) % images.length;
    onNavigate(nextIndex);
  }, [currentIndex, images.length, onNavigate]);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    const nextIndex = (currentIndex + 1) % images.length;
    onNavigate(nextIndex);
  }, [currentIndex, images.length, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    // Prevent body scrolling when lightbox is open
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !currentImage || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/95 text-white backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image fullscreen viewer"
    >
      {/* Top Controls Bar */}
      <div
        className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:py-4 bg-gradient-to-b from-black/80 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        {title ? (
          <span className="min-w-0 flex-1 truncate text-sm font-semibold">{title}</span>
        ) : (
          <span className="flex-1" />
        )}

        <div className="flex shrink-0 items-center gap-2">
          {images.length > 1 && (
            <span
              className="inline-flex h-8 items-center whitespace-nowrap rounded-full bg-white/15 px-2.5 text-[11px] font-semibold tabular-nums leading-none tracking-wide backdrop-blur-sm sm:h-auto sm:px-3 sm:py-1 sm:text-xs sm:font-medium"
              aria-label={`Image ${currentIndex + 1} of ${images.length}`}
            >
              <span className="sm:hidden">
                {currentIndex + 1} / {images.length}
              </span>
              <span className="hidden sm:inline">
                {currentIndex + 1} of {images.length}
              </span>
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Close fullscreen view"
          >
            <X className="size-6" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div
        className="relative flex flex-1 items-center justify-center p-4 sm:p-8 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Previous Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 z-10 grid size-10 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:bg-black/80 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent sm:left-8 sm:size-12"
            aria-label="Previous image"
          >
            <ChevronLeft className="size-6 sm:size-7" />
          </button>
        )}

        {/* Fullscreen Displayed Image */}
        <img
          src={currentImage}
          alt={title ? `${title} - Image ${currentIndex + 1}` : `Fullscreen image ${currentIndex + 1}`}
          className="max-h-[min(78vh,calc(100dvh-12rem))] max-w-[min(92vw,100%)] object-contain rounded-lg shadow-2xl transition-all duration-300"
        />

        {/* Next Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 z-10 grid size-10 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:bg-black/80 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent sm:right-8 sm:size-12"
            aria-label="Next image"
          >
            <ChevronRight className="size-6 sm:size-7" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnails Strip */}
      {images.length > 1 && (
        <div
          className="flex shrink-0 items-center justify-start gap-2 overflow-x-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-black/80 to-transparent sm:justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onNavigate(idx)}
              className={cn(
                "relative h-14 w-20 overflow-hidden rounded-md border-2 transition-all shrink-0",
                idx === currentIndex
                  ? "border-accent scale-105 opacity-100 ring-2 ring-accent"
                  : "border-transparent opacity-50 hover:opacity-90",
              )}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
}
