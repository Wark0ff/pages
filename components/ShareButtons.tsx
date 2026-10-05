"use client";

import { toPng } from "html-to-image";
import { useState } from "react";

/** Скачать открытку картинкой (собирается из той же вёрстки) и поделиться ссылкой. */
export default function ShareButtons({ title }: { title: string }) {
  const [state, setState] = useState<"" | "saving" | "copied" | "error">("");

  async function download() {
    const node = document.querySelector<HTMLElement>(".pc");
    if (!node) return;
    setState("saving");
    try {
      // рендерим в 768 px ширины — исходный размер макета
      const ratio = 768 / node.offsetWidth;
      const url = await toPng(node, { pixelRatio: ratio, cacheBust: true });
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}.png`;
      a.click();
      setState("");
    } catch {
      setState("error");
    }
  }

  async function share() {
    const url = location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* пользователь закрыл окно — просто копируем */
      }
    }
    await navigator.clipboard.writeText(url);
    setState("copied");
    setTimeout(() => setState(""), 2000);
  }

  return (
    <div className="mt-6 flex flex-col items-center gap-2">
      <div className="flex gap-3">
        <button className="btn" onClick={share}>
          {state === "copied" ? "Ссылка скопирована" : "Поделиться"}
        </button>
        <button className="btn btn-ghost" onClick={download} disabled={state === "saving"}>
          {state === "saving" ? "Сохраняю…" : "Скачать"}
        </button>
      </div>
      {state === "error" && <p className="text-sm text-red-800">Не получилось сохранить картинку, попробуйте ещё раз</p>}
    </div>
  );
}
