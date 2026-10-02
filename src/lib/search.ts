export function matchesSearch(query: string, fields: Array<string | null | undefined>) {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = fields
    .filter((field): field is string => Boolean(field && field.trim()))
    .join(" ")
    .toLowerCase();
  return words.every((word) => haystack.includes(word));
}
