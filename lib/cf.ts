import "server-only";
import { parseBrief } from "./text";
import type { Brief } from "./types";

// Cloudflare Workers AI: 10 000 нейронов в сутки бесплатно. Одна открытка (бриф + 2 фона) ≈ 360 нейронов.
const TEXT_MODEL = "@cf/mistralai/mistral-small-3.1-24b-instruct";
const IMAGE_MODEL = "@cf/black-forest-labs/flux-2-klein-4b";
export const W = 768;
export const H = 1344;

const STYLE =
  "Style: vibrant illustrated travel postcard, semi-realistic digital painting with a light storybook feel, " +
  "warm golden-hour light, rich saturated colours, crisp painterly details, soft clouds. ";
const LAYOUT =
  "Composition: wide open bright sky in the top fifth; the main landmark in the middle third; " +
  "the bottom 45% is simple foreground (it will be covered). Absolutely no text, no lettering, no signs.";
const CHARACTER = (who: string) =>
  ` Include one character as part of the story: ${who}, small, in the middle third of the frame next to the landmark, admiring the view, cosy illustrated look.`;

const SYSTEM = `You design an illustrated vertical postcard for a Russian poem. The poet may add a comment with place and date.
Scene rules:
- If the poem or comment names a real place, show THAT place so a local recognises it: name its signature landmarks, terrain, vegetation and rock colour (e.g. Olkhon on Baikal = Shaman Rock (Cape Burkhan) twin white-grey rock in deep blue water, bare steppe hills, wind-bent larches and pines, orange lichen on rocks, sandy bays).
- If there is no geography, build ONE concrete, beautiful OUTDOOR scene with an open view and a big sky (field, coast, hills, lake, road; never a room, never a dense forest) that carries the feeling of the WHOLE poem. Do NOT depict any object, drink or item named in the poem; translate the feeling, not the words.
Russian texts, warm and friendly, written fresh for THIS poem (do not copy words or lines from the poem, no clichés):
- title: the place, like "Байкал • остров Ольхон"; without geography, 1-3 words naming the feeling.
- notes: three different handwritten margin notes, 2-5 words each, about this place or feeling.
- stamp: a 2-word postage stamp caption about the place or feeling (not "Почта России", not about any object from the poem).
- who: in English, a small character that fits the poem.
Answer ONLY with JSON: {"title": "", "notes": ["", "", ""], "stamp": "", "who": "", "scene": "<English scene description, 50-70 words, landmarks and light only, NO people>"}`;

function endpoint(model: string) {
  const id = process.env.CF_ACCOUNT_ID;
  const token = process.env.CF_API_TOKEN;
  if (!id || !token) throw new Error("Не заданы CF_ACCOUNT_ID / CF_API_TOKEN");
  return { url: `https://api.cloudflare.com/client/v4/accounts/${id}/ai/run/${model}`, auth: { Authorization: `Bearer ${token}` } };
}

/** Стих (и комментарий поэта) -> заголовок, заметки, подпись марки и описание сцены. */
export async function brief(poem: string, comment: string): Promise<Brief> {
  const { url, auth } = endpoint(TEXT_MODEL);
  const user = comment ? `Комментарий поэта: ${comment}\n\n${poem}` : poem;
  const r = await fetch(url, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "system", content: SYSTEM }, { role: "user", content: user }], max_tokens: 1500 }),
  });
  if (!r.ok) throw new Error(`Текстовая модель: ${r.status} ${(await r.text()).slice(0, 300)}`);
  const res = (await r.json()).result;
  const out = res.response ?? res.choices?.[0]?.message?.content;
  return parseBrief(out);
}

/** Рисует фон 768x1344. withCharacter — вариант с маленьким персонажем. Возвращает PNG. */
export async function paint(b: Pick<Brief, "scene" | "who">, withCharacter: boolean): Promise<Buffer> {
  const { url, auth } = endpoint(IMAGE_MODEL);
  const prompt = `${b.scene} ${STYLE}${LAYOUT}${withCharacter ? CHARACTER(b.who) : ""}`;
  let r: Response | undefined;
  // фильтр Cloudflare иногда ложно срабатывает на безобидные сцены (код 3030) — повторяем
  for (let i = 0; i < 3; i++) {
    const form = new FormData();
    form.set("prompt", prompt);
    form.set("width", String(W));
    form.set("height", String(H));
    r = await fetch(url, { method: "POST", headers: auth, body: form });
    if (r.ok) break;
    const text = await r.text();
    if (!text.includes("3030")) throw new Error(`Модель картинок: ${r.status} ${text.slice(0, 300)}`);
  }
  if (!r?.ok) throw new Error("Модель картинок трижды отклонила сцену, попробуйте ещё раз");
  return Buffer.from((await r.json()).result.image, "base64");
}
