import { brief } from "@/lib/cf";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { poem, comment } = await req.json().catch(() => ({}));
  if (typeof poem !== "string" || !poem.trim()) return Response.json({ error: "Пустой стих" }, { status: 400 });
  try {
    return Response.json(await brief(poem.slice(0, 4000), String(comment ?? "").slice(0, 300)));
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 502 });
  }
}
