export const HOME_LATEST_COUNT = 3;

export function takeLatestByDate<T extends { created_at?: string | null }>(
  items: T[],
  dateKey: keyof T,
  count = HOME_LATEST_COUNT,
): T[] {
  return [...items]
    .sort((a, b) => {
      const dateA = new Date(String(a[dateKey] ?? "")).getTime();
      const dateB = new Date(String(b[dateKey] ?? "")).getTime();
      const safeA = Number.isFinite(dateA) ? dateA : 0;
      const safeB = Number.isFinite(dateB) ? dateB : 0;
      if (safeB !== safeA) return safeB - safeA;

      const createdA = new Date(a.created_at ?? "").getTime();
      const createdB = new Date(b.created_at ?? "").getTime();
      return (Number.isFinite(createdB) ? createdB : 0) - (Number.isFinite(createdA) ? createdA : 0);
    })
    .slice(0, count);
}
