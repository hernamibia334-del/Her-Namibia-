import { cn } from "@/lib/utils";

type ReadMoreLinkProps = {
  href?: string;
  onClick?: () => void;
  className?: string;
};

export function ReadMoreLink({ href, onClick, className }: ReadMoreLinkProps) {
  const styles = cn(
    "text-sm font-semibold text-accent transition-colors hover:text-primary hover:underline",
    className,
  );

  if (href) {
    return (
      <a href={href} className={styles}>
        Read more
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={styles}>
      Read more
    </button>
  );
}
