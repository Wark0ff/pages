import Link from "next/link";
import Postcard from "@/components/Postcard";
import type { Card } from "@/lib/types";

const TINTS = ["bg-rose", "bg-sage", "bg-sand"];

/** Строфы стиха: по пустым строкам, а если их нет — по четыре строки. */
function stanzas(poem: string[]): string[][] {
  const out: string[][] = [];
  let cur: string[] = [];
  for (const l of poem) {
    if (!l.trim()) {
      if (cur.length) out.push(cur);
      cur = [];
    } else cur.push(l);
  }
  if (cur.length) out.push(cur);
  return out.length > 1 ? out : Array.from({ length: Math.ceil(poem.length / 4) }, (_, i) => poem.slice(i * 4, i * 4 + 4));
}

function PostcardPin({ card }: { card: Card }) {
  return (
    <Link href={`/p/${card.id}`} className="group mb-6 block break-inside-avoid">
      <div className="overflow-hidden rounded-[22px] bg-sand shadow-[0_1px_2px_rgba(43,36,32,.06),0_8px_24px_rgba(43,36,32,.08)]">
        <Postcard {...card} />
      </div>
      <div className="px-1.5 pt-3">
        <h2 className="font-display text-xl font-semibold leading-snug group-hover:text-accent">{card.title}</h2>
        <p className="mt-0.5 line-clamp-1 text-sm text-muted">{card.poem.find((l) => l.trim())}</p>
      </div>
    </Link>
  );
}

function QuotePin({ card, tint }: { card: Card; tint: string }) {
  const all = stanzas(card.poem);
  const stanza = all[all.length > 1 ? 1 : 0];
  return (
    <Link href={`/p/${card.id}`} className={`group mb-6 block break-inside-avoid rounded-[22px] ${tint} px-5 py-6 sm:px-6`}>
      <span className="font-display text-5xl leading-none text-accent/70" aria-hidden="true">
        “
      </span>
      <blockquote className="-mt-3 font-display text-[1.08rem] italic leading-[1.5] sm:text-[1.18rem]">
        {stanza.map((l, i) => (
          <span key={i} className="block pl-4 -indent-4">
            {l}
          </span>
        ))}
      </blockquote>
      <p className="mt-4 text-sm font-semibold text-muted group-hover:text-accent">{card.title}</p>
    </Link>
  );
}

/** Лента как в Pinterest: колонки разной высоты, между открытками — строфы стихов. */
export default function Feed({ cards }: { cards: Card[] }) {
  const pins = cards.flatMap((card, i) => [
    <PostcardPin key={card.id} card={card} />,
    // цитата после каждой открытки, кроме каждой третьей — чтобы ритм не был монотонным
    ...(i % 3 !== 2 ? [<QuotePin key={card.id + "-q"} card={card} tint={TINTS[i % TINTS.length]} />] : []),
  ]);
  return <div className="columns-2 gap-4 sm:gap-6 md:columns-3 xl:columns-4">{pins}</div>;
}
