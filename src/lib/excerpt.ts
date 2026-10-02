export const CARD_WORD_LIMIT = 50;

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function truncateWords(text: string, limit = CARD_WORD_LIMIT) {
  const trimmed = text.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length <= limit) {
    return { excerpt: trimmed, truncated: false, wordCount: words.length };
  }
  return {
    excerpt: `${words.slice(0, limit).join(" ")}…`,
    truncated: true,
    wordCount: words.length,
  };
}
