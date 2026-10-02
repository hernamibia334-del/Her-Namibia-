import { useId } from "react";
import { Search, X } from "lucide-react";

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label?: string;
};

export function SearchField({ value, onChange, placeholder, label = "Search" }: SearchFieldProps) {
  const inputId = useId();

  return (
    <div className="relative w-full sm:max-w-md">
      <label className="sr-only" htmlFor={inputId}>
        {label}
      </label>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.preventDefault();
        }}
        placeholder={placeholder}
        autoComplete="off"
        enterKeyHint="search"
        className="w-full rounded-full border border-input bg-card py-2.5 pl-10 pr-10 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
