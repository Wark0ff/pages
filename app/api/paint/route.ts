import sharp from "sharp";
import { isPoet } from "@/lib/auth";
import { paint } from "@/lib/cf";
import { saveBackground } from "@/lib/store";

// одна картинка рисуется 15–40 секунд, с повторами при ложной блокировке — дольше
export const maxDuration = 180;

export async function POST(req: Request) {
  if (!(await isPoet())) return Response.json({ error: "Нужно войти" }, { status: 401 });
  const { scene, who, character } = await req.json().catch(() => ({}));
  if (typeof scene !== "string" || !scene.trim()) return Response.json({ error: "Нет описания сцены" }, { status: 400 });
  try {
    const png = await paint({ scene: scene.slice(0, 1500), who: String(who ?? "").slice(0, 200) }, !!character);
    // PNG ~800 КБ -> JPEG ~200 КБ: бесплатного места в Blob хватит на тысячи открыток
    const jpeg = await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toBuffer();
    return Response.json({ url: await saveBackground(jpeg) });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 502 });
  }
}
