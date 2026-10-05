import "server-only";
import { list, put } from "@vercel/blob";
import { cache } from "react";
import type { Card } from "./types";

// Всё лежит в Vercel Blob: фоны в bg/, открытки в cards/<id>.json. Отдельная база не нужна.

export async function saveBackground(jpeg: Buffer): Promise<string> {
  const blob = await put("bg/bg.jpg", jpeg, { access: "public", contentType: "image/jpeg", addRandomSuffix: true });
  return blob.url;
}

export async function saveCard(card: Card): Promise<void> {
  await put(`cards/${card.id}.json`, JSON.stringify(card), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    cacheControlMaxAge: 60 * 60 * 24 * 365,
  });
}

// Открытка после публикации не меняется (у каждой свой id), поэтому её JSON можно кэшировать навсегда.
async function readCard(url: string): Promise<Card | null> {
  const r = await fetch(url, { cache: "force-cache" });
  return r.ok ? ((await r.json()) as Card) : null;
}

/** cache() — чтобы generateMetadata и страница не ходили в хранилище дважды за один запрос. */
export const getCard = cache(async (id: string): Promise<Card | null> => {
  if (!/^[a-z0-9]{6,16}$/.test(id)) return null;
  const { blobs } = await list({ prefix: `cards/${id}.json`, limit: 1 });
  return blobs[0] ? readCard(blobs[0].url) : null;
});

/** Все открытки, новые сверху. */
export const listCards = cache(async (): Promise<Card[]> => {
  const { blobs } = await list({ prefix: "cards/", limit: 1000 });
  const cards = await Promise.all(blobs.map((b) => readCard(b.url)));
  return cards.filter((c): c is Card => !!c).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
});
