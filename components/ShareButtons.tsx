"use client";

import { toPng } from "html-to-image";
import { useState } from "react";
import { Download, Share } from "@/components/Icons";

/** Поделиться ссылкой и скачать открытку картинкой (собирается из той же вёрстки). */
export default function ShareButtons({ title }: { title: string }) {
  const [state, setState] = useState<"" | "saving" | "copied" | "error">("");

  async function download() {
    const node = document.querySelector<HTMLElement>("article .pc");
    if (!node) return;
    setState("saving");
    try {
      // рендерим в 768 px ширины — исходный размер макета
      const url = await toPng(node, { pixelRatio: 768 / node.offsetWidth, cacheBust: true });
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
        /* окно закрыли — просто копируем ссылку */
      }
    }
    await navigator.clipboard.writeText(url);
    setState("copied");
    setTimeout(() => setState(""), 2500);
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-3">
        <button className="btn" onClick={share}>
          <Share />
          {state === "copied" ? "Ссылка скопирована" : "Поделиться"}
        </button>
        <button className="btn btn-soft" onClick={download} disabled={state === "saving"}>
          <Download />
          {state === "saving" ? "Сохраняю…" : "Скачать картинку"}
        </button>
      </div>
      <p aria-live="polite" className="mt-2 min-h-5 text-sm text-red-800">
        {state === "error" ? "Не получилось сохранить картинку, попробуйте ещё раз" : ""}
      </p>
    </div>
  );
}
