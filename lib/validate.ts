import type { Card } from "./types";

const str = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

export type Draft = Omit<Card, "id" | "createdAt">;

/**
 * Проверка тела запроса на публикацию. Фон принимаем только из нашего хранилища (host),
 * чтобы на сайт нельзя было подсунуть чужую картинку. Возвращает открытку или текст ошибки.
 */
export function validateDraft(body: unknown, host: string | null): Draft | string {
  const b = (body ?? {}) as Record<string, unknown>;
  const bg = str(b.bg, 500);
  let url: URL | null = null;
  try {
    url = new URL(bg);
  } catch {
    /* не URL */
  }
  if (!url || url.protocol !== "https:" || !host || url.host !== host || !url.pathname.startsWith("/bg/")) return "Неизвестный фон";

  const poem = (Array.isArray(b.poem) ? b.poem : []).map((l: unknown) => str(l, 200)).slice(0, 40);
  if (!poem.some(Boolean)) return "Пустой стих";

  return {
    title: str(b.title, 80),
    date: str(b.date, 20),
    notes: (Array.isArray(b.notes) ? b.notes : []).map((n: unknown) => str(n, 60)).slice(0, 3),
    stamp: str(b.stamp, 40),
    poem,
    bg: url.toString(),
  };
}
