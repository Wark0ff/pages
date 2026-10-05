"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Postcard from "@/components/Postcard";
import type { Brief } from "@/lib/types";

type Variant = { status: "painting" } | { status: "ready"; url: string } | { status: "error"; error: string };

async function post<T>(url: string, body: unknown): Promise<T> {
  const r = await fetch(url, { method: "POST", body: JSON.stringify(body) });
  const data = await r.json().catch(() => ({ error: `Ошибка ${r.status}` }));
  if (!r.ok) throw new Error(data.error ?? `Ошибка ${r.status}`);
  return data as T;
}

const poemLines = (text: string) => text.replace(/\r/g, "").split("\n").map((l) => l.trimEnd()).join("\n").trim().split("\n");
const dateFrom = (comment: string) => comment.match(/\d{1,2}[./]\d{1,2}[./]\d{2,4}/)?.[0]?.replaceAll(".", "/") ?? "";

/** Создание открытки: стих -> бриф -> два фона (без персонажа и с ним) -> правка подписей -> публикация. */
export default function Creator() {
  const router = useRouter();
  const [poem, setPoem] = useState("");
  const [comment, setComment] = useState("");
  const [step, setStep] = useState<"write" | "thinking" | "pick">("write");
  const [error, setError] = useState("");
  const [brief, setBrief] = useState<Brief | null>(null);
  const [fields, setFields] = useState({ title: "", date: "", notes: ["", "", ""], stamp: "" });
  const [variants, setVariants] = useState<Variant[]>([]);
  const [chosen, setChosen] = useState(0);
  const [publishing, setPublishing] = useState(false);


  function paintMore(b: Brief) {
    const start = variants.length;
    setVariants((v) => [...v, { status: "painting" }, { status: "painting" }]);
    [false, true].forEach((character, k) => {
      post<{ url: string }>("/api/paint", { scene: b.scene, who: b.who, character })
        .then(({ url }) => setVariants((v) => v.map((x, i) => (i === start + k ? { status: "ready", url } : x))))
        .catch((e: Error) => setVariants((v) => v.map((x, i) => (i === start + k ? { status: "error", error: e.message } : x))));
    });
  }

  async function start() {
    setError("");
    setStep("thinking");
    setVariants([]);
    try {
      const b = await post<Brief>("/api/brief", { poem, comment });
      setBrief(b);
      setFields({ title: b.title, date: dateFrom(comment), notes: [0, 1, 2].map((i) => b.notes[i] ?? ""), stamp: b.stamp });
      setChosen(0);
      setStep("pick");
      paintMore(b);
    } catch (e) {
      setError((e as Error).message);
      setStep("write");
    }
  }

  async function publish() {
    const firstReady = variants.findIndex((x) => x.status === "ready");
    const v = variants[chosen]?.status === "ready" ? variants[chosen] : variants[firstReady];
    if (v?.status !== "ready") return;
    setPublishing(true);
    try {
      const { id } = await post<{ id: string }>("/api/publish", { ...fields, poem: poemLines(poem), bg: v.url });
      router.push(`/p/${id}`);
    } catch (e) {
      setError((e as Error).message);
      setPublishing(false);
    }
  }

  if (step !== "pick") {
    return (
      <div className="mx-auto max-w-xl py-6">
        <p className="font-hand text-3xl">Новая открытка</p>
        <label className="label mt-6">Стих</label>
        <textarea
          className="field min-h-72 leading-relaxed"
          value={poem}
          onChange={(e) => setPoem(e.target.value)}
          placeholder="Вставьте стих целиком"
        />
        <label className="label mt-4">Место и дата, если хотите (например, «Байкал, остров Ольхон, 17/09/26»)</label>
        <input className="field" value={comment} onChange={(e) => setComment(e.target.value)} />
        {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
        <button className="btn mt-6" disabled={!poem.trim() || step === "thinking"} onClick={start}>
          {step === "thinking" ? "Читаю стих…" : "Сделать открытку"}
        </button>
        <p className="mt-3 text-sm text-ink/60">Картинка рисуется около полуминуты. Будет два варианта на выбор.</p>
      </div>
    );
  }

  // пока выбранный вариант ещё рисуется, показываем первый готовый
  const firstReady = variants.findIndex((v) => v.status === "ready");
  const shown = variants[chosen]?.status === "ready" || firstReady < 0 ? chosen : firstReady;
  const current = variants[shown];
  const setNote = (i: number, value: string) => setFields((f) => ({ ...f, notes: f.notes.map((n, k) => (k === i ? value : n)) }));

  return (
    <div className="grid gap-10 py-4 lg:grid-cols-[minmax(0,420px)_1fr]">
      <div className="mx-auto w-full max-w-[420px]">
        <div className="overflow-hidden rounded-lg shadow-[0_18px_50px_rgba(40,25,10,.28)]">
          {current?.status === "ready" ? (
            <Postcard {...fields} poem={poemLines(poem)} bg={current.url} />
          ) : (
            <div className="flex aspect-[768/1344] items-center justify-center bg-[#e4d9c3] p-8 text-center text-ink/70">
              {current?.status === "error" ? current.error : "Рисую… обычно это около полуминуты"}
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {variants.map((v, i) => (
            <button
              key={i}
              onClick={() => setChosen(i)}
              className={`h-24 w-14 overflow-hidden rounded bg-[#e4d9c3] ring-offset-2 ring-offset-paper ${i === shown ? "ring-2 ring-ink" : ""}`}
              aria-label={`Вариант ${i + 1}`}
            >
              {v.status === "ready" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.url} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs text-ink/50">{v.status === "error" ? "×" : "…"}</span>
              )}
            </button>
          ))}
          {brief && (
            <button className="btn btn-ghost h-24 px-4 text-sm" onClick={() => paintMore(brief)}>
              Ещё
              <br />
              варианты
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-md lg:mx-0">
        <p className="font-hand text-3xl">Подписи</p>
        <p className="mt-1 text-sm text-ink/60">Их придумала нейросеть по стиху. Поправьте, если хочется.</p>
        <label className="label mt-5">Заголовок</label>
        <input className="field" value={fields.title} onChange={(e) => setFields({ ...fields, title: e.target.value })} />
        <label className="label mt-4">Дата</label>
        <input className="field" value={fields.date} placeholder="без даты" onChange={(e) => setFields({ ...fields, date: e.target.value })} />
        <label className="label mt-4">Заметки от руки</label>
        <div className="grid gap-2">
          {fields.notes.map((n, i) => (
            <input key={i} className="field font-hand text-lg" value={n} onChange={(e) => setNote(i, e.target.value)} />
          ))}
        </div>
        <label className="label mt-4">Подпись на марке</label>
        <input className="field" value={fields.stamp} onChange={(e) => setFields({ ...fields, stamp: e.target.value })} />

        {error && <p className="mt-4 text-sm text-red-800">{error}</p>}
        <div className="mt-8 flex flex-wrap gap-3">
          <button className="btn" disabled={current?.status !== "ready" || publishing} onClick={publish}>
            {publishing ? "Публикую…" : "Опубликовать"}
          </button>
          <button className="btn btn-ghost" onClick={() => setStep("write")}>
            Изменить стих
          </button>
        </div>
      </div>
    </div>
  );
}
