import { randomBytes } from "node:crypto";
import { isPoet } from "@/lib/auth";
import { saveCard } from "@/lib/store";
import type { Card } from "@/lib/types";

// короткий адрес открытки: 8 символов из [a-z0-9]
const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const newId = () => Array.from(randomBytes(8), (b) => ALPHABET[b % ALPHABET.length]).join("");

const str = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

export async function POST(req: Request) {
  if (!(await isPoet())) return Response.json({ error: "Нужно войти" }, { status: 401 });
  const body = await req.json();
  const bg = str(body.bg, 500);
  // фон должен быть из нашего же хранилища, чужие ссылки не принимаем
  if (!/^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/bg\//.test(bg)) {
    return Response.json({ error: "Неизвестный фон" }, { status: 400 });
  }
  const poem = (Array.isArray(body.poem) ? body.poem : []).map((l: unknown) => str(l, 200)).slice(0, 40);
  if (!poem.some(Boolean)) return Response.json({ error: "Пустой стих" }, { status: 400 });

  const card: Card = {
    id: newId(),
    createdAt: new Date().toISOString(),
    title: str(body.title, 80),
    date: str(body.date, 20),
    notes: (Array.isArray(body.notes) ? body.notes : []).map((n: unknown) => str(n, 60)).slice(0, 3),
    stamp: str(body.stamp, 40),
    poem,
    bg,
  };
  await saveCard(card);
  return Response.json({ id: card.id });
}
