import { randomBytes } from "node:crypto";
import { saveCard } from "@/lib/store";
import { blobHost, newId } from "@/lib/text";
import { validateDraft } from "@/lib/validate";

export async function POST(req: Request) {
  const draft = validateDraft(await req.json().catch(() => null), blobHost(process.env.BLOB_READ_WRITE_TOKEN));
  if (typeof draft === "string") return Response.json({ error: draft }, { status: 400 });

  const card = { id: newId(randomBytes(8)), createdAt: new Date().toISOString(), ...draft };
  await saveCard(card);
  return Response.json({ id: card.id });
}
