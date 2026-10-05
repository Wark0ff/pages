import Link from "next/link";
import Postcard from "@/components/Postcard";
import type { Card } from "@/lib/types";

function PostcardPin({ card }: { card: Card }) {
  return (
    <Link href={`/p/${card.id}`} className="group mb-6 block break-inside-avoid [contain-intrinsic-size:auto_640px] [content-visibility:auto]">
      <div className="overflow-hidden rounded-[22px] bg-sand shadow-[0_1px_2px_rgba(43,36,32,.06),0_8px_24px_rgba(43,36,32,.08)]">
        <Postcard {...card} imageWidth={640} />
      </div>
      <div className="px-1.5 pt-3">
        <h2 className="font-display text-xl font-semibold leading-snug group-hover:text-accent">{card.title}</h2>
        <p className="mt-0.5 line-clamp-1 text-sm text-muted">{card.poem.find((l) => l.trim())}</p>
      </div>
    </Link>
  );
}

/** Лента как в Pinterest: открытки колонками. */
export default function Feed({ cards }: { cards: Card[] }) {
  return (
    <div className="columns-2 gap-4 sm:gap-6 md:columns-3 xl:columns-4">
      {cards.map((card) => (
        <PostcardPin key={card.id} card={card} />
      ))}
    </div>
  );
}
