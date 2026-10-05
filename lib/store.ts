import "server-only";
import { list, put } from "@vercel/blob";
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
    cacheControlMaxAge: 60,
  });
}

export async function getCard(id: string): Promise<Card | null> {
  if (!/^[a-z0-9]{6,16}$/.test(id)) return null;
  const { blobs } = await list({ prefix: `cards/${id}.json`, limit: 1 });
  if (!blobs[0]) return null;
  const r = await fetch(blobs[0].url, { cache: "no-store" });
  return r.ok ? ((await r.json()) as Card) : null;
}

/** Все открытки, новые сверху. */
export async function listCards(): Promise<Card[]> {
  const { blobs } = await list({ prefix: "cards/", limit: 1000 });
  const cards = await Promise.all(
    blobs.map(async (b) => {
      const r = await fetch(b.url, { cache: "no-store" });
      return r.ok ? ((await r.json()) as Card) : null;
    }),
  );
  return cards.filter((c): c is Card => !!c).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
