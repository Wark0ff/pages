import Link from "next/link";
import Feed from "@/components/Feed";
import { Plus } from "@/components/Icons";
import { listCards } from "@/lib/store";
import { pluralCards } from "@/lib/text";

export const dynamic = "force-dynamic";

export default async function Home() {
  const cards = await listCards();

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl font-display text-[2.4rem] font-semibold leading-[1.05] sm:text-6xl">
          Стихи, которые стали <span className="italic text-accent">открытками</span>
        </h1>
        <p className="mt-4 max-w-xl text-base text-muted sm:text-lg">
          Каждое стихотворение получает свою картинку, свой штемпель и свой адрес. Листайте, читайте, делитесь ссылкой.
        </p>
        {cards.length > 0 && (
          <p className="mt-5 text-sm font-semibold text-muted">
            {cards.length} {pluralCards(cards.length)}
          </p>
        )}
      </section>

      {cards.length ? (
        <Feed cards={cards} />
      ) : (
        <div className="rounded-[28px] bg-sand px-6 py-16 text-center">
          <p className="font-display text-3xl font-semibold">Здесь пока пусто</p>
          <p className="mt-2 text-muted">Первая открытка появится, как только будет готов первый стих.</p>
          <Link href="/new" className="btn mt-6">
            <Plus />
            Сделать открытку
          </Link>
        </div>
      )}
    </>
  );
}
