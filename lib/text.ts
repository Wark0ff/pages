// Чистые функции без зависимостей от Next: их удобно покрывать тестами (lib/*.test.ts).
import type { Brief } from "./types";

/** Стих из textarea -> строки: без \r, без хвостовых пробелов, без пустых строк по краям. Пустые строки внутри (строфы) сохраняются. */
export function poemLines(text: string): string[] {
  const trimmed = text.replace(/\r/g, "").split("\n").map((l) => l.trimEnd()).join("\n").trim();
  return trimmed ? trimmed.split("\n") : [];
}

/** Дата из комментария поэта: «Байкал 17.09.26» -> «17/09/26». Только из комментария: модели даты не доверяем. */
export function dateFrom(comment: string): string {
  return comment.match(/\d{1,2}[./]\d{1,2}[./]\d{2,4}/)?.[0]?.replaceAll(".", "/") ?? "";
}

/** 1 открытка, 2 открытки, 5 открыток. */
export function pluralCards(n: number): string {
  const d = n % 10;
  const h = n % 100;
  if (d === 1 && h !== 11) return "открытка";
  if (d >= 2 && d <= 4 && (h < 10 || h >= 20)) return "открытки";
  return "открыток";
}

/**
 * Раскладка открытки в единицах макета 768x1344 (как в прототипе pages-test/layout.py).
 * fs — кегль стиха, lh — высота листа письма, ts — кегль заголовка.
 */
export function cardLayout(title: string, poem: string[]) {
  const n = Math.max(poem.length, 1);
  const base = n <= 8 ? 27 : n <= 12 ? 25 : Math.max(17, Math.floor(300 / n));
  const longest = Math.max(1, ...poem.map((l) => l.length));
  // первые три строки не должны залезать под штемпель и марку (они справа вверху листа, ~410px свободно)
  const longestTop = Math.max(1, ...poem.slice(0, 3).map((l) => l.length));
  const fs = Math.max(14, Math.min(base, Math.floor(560 / (longest * 0.5)), Math.floor(410 / (longestTop * 0.5))));
  const pt = 52;
  const lh = Math.min(Math.round(n * fs * 1.42) + pt + 70, 1100);
  const ts = Math.min(66, Math.floor(1250 / Math.max(title.length, 1)));
  return { fs, pt, lh, ts };
}

/** Ответ текстовой модели -> бриф. Модель иногда оборачивает JSON в текст или ```, вырезаем фигурные скобки. */
export function parseBrief(out: unknown): Brief {
  const b =
    typeof out === "string" ? JSON.parse(out.slice(out.indexOf("{"), out.lastIndexOf("}") + 1)) : ((out ?? {}) as Record<string, unknown>);
  const notes = (Array.isArray(b.notes) ? b.notes : []).map(String).slice(0, 3);
  while (notes.length < 3) notes.push("");
  return {
    title: String(b.title ?? ""),
    notes,
    stamp: String(b.stamp ?? ""),
    who: String(b.who ?? "a traveller"),
    scene: String(b.scene ?? ""),
  };
}

/** Короткий адрес открытки: 8 символов [a-z0-9]. */
export function newId(bytes: Uint8Array): string {
  const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(bytes.slice(0, 8), (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/** Хост нашего Blob-хранилища из токена vercel_blob_rw_<storeId>_<secret>. */
export function blobHost(token: string | undefined): string | null {
  const storeId = token?.split("_")[3];
  return storeId ? `${storeId.toLowerCase()}.public.blob.vercel-storage.com` : null;
}
