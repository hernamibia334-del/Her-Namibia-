import { CalendarDays, Download, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ReadMoreLink } from "./ReadMoreLink";
import { truncateWords } from "@/lib/excerpt";

export type Resource = {
  id: string;
  title: string;
  description: string;
  resource_type: string;
  sector?: string | null;
  file_url?: string | null;
  external_url?: string | null;
  author?: string | null;
  publication_date: string;
  created_at?: string | null;
  status: string;
};

type ResourceCardProps = {
  item: Resource;
  readMoreHref?: string;
  onReadMore?: () => void;
};

export function ResourceCard({ item, readMoreHref, onReadMore }: ResourceCardProps) {
  const { excerpt, truncated } = truncateWords(item.description);
  const showReadMore = Boolean(readMoreHref || (onReadMore && truncated));

  return (
    <article
      id={`item-${item.id}`}
      className="hover-lift flex h-full flex-col justify-between overflow-hidden rounded-xl border-2 border-primary bg-card p-6 shadow-card"
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-accent">
            <CalendarDays className="size-3.5" />
            {new Date(item.publication_date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="default" className="text-[11px] bg-accent text-accent-foreground">
              {item.resource_type}
            </Badge>
            {item.sector && (
              <Badge variant="outline" className="text-[11px]">
                {item.sector}
              </Badge>
            )}
          </div>
        </div>

        <h3 className="mt-3.5 text-lg font-bold text-foreground leading-snug">{item.title}</h3>

        <p className="mt-3 text-sm whitespace-pre-line text-muted-foreground leading-relaxed">
          {excerpt}
        </p>
      </div>

      {(item.file_url || item.external_url || showReadMore) && (
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-border/60 pt-4">
          <div className="flex flex-wrap items-center gap-4">
            {item.file_url && (
              <a
                href={item.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
              >
                <Download className="size-3.5" />
                Download Document
              </a>
            )}
            {item.external_url && (
              <a
                href={item.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
              >
                <ExternalLink className="size-3.5" />
                External Source
              </a>
            )}
          </div>
          {showReadMore && <ReadMoreLink href={readMoreHref} onClick={onReadMore} />}
        </div>
      )}
    </article>
  );
}
