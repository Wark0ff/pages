import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Feed from "@/components/Feed";
import { ArrowLeft } from "@/components/Icons";
import Postcard from "@/components/Postcard";
import ShareButtons from "@/components/ShareButtons";
import { getCard, listCards } from "@/lib/store";

export async function generateMetadata({ params }: PageProps<"/p/[id]">): Promise<Metadata> {
  const card = await getCard((await params).id);
  if (!card) return {};
  const description = card.poem.filter(Boolean).slice(0, 2).join(" ");
  return { title: card.title, description, openGraph: { title: card.title, description, images: [card.bg] } };
}

export default async function CardPage({ params }: PageProps<"/p/[id]">) {
  const { id } = await params;
  const [card, all] = await Promise.all([getCard(id), listCards()]);
  if (!card) notFound();
  const more = all.filter((c) => c.id !== card.id).slice(0, 8);

  return (
    <>
      <Link href="/" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4" />
        Все открытки
      </Link>

      <article className="mt-4 grid gap-8 md:grid-cols-[minmax(0,420px)_minmax(0,1fr)] md:gap-14">
        <div className="mx-auto w-full max-w-[420px]">
          <div className="overflow-hidden rounded-[22px] shadow-[0_2px_4px_rgba(43,36,32,.06),0_20px_50px_rgba(43,36,32,.16)]">
            <Postcard {...card} />
          </div>
        </div>

        <div className="md:pt-4">
          {card.date && <p className="text-sm font-semibold tracking-wide text-accent">{card.date.replaceAll("/", ".")}</p>}
          <h1 className="mt-1 font-display text-4xl font-semibold leading-tight sm:text-5xl">{card.title}</h1>
          <div className="mt-6 font-display text-[1.35rem] leading-[1.6]">
            {card.poem.map((l, i) => (l.trim() ? <p key={i} className="pl-5 -indent-5">{l}</p> : <div key={i} className="h-4" />))}
          </div>
          <ShareButtons title={card.title} />
        </div>
      </article>

      {more.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 font-display text-3xl font-semibold">Ещё открытки</h2>
          <Feed cards={more} />
        </section>
      )}
    </>
  );
}
