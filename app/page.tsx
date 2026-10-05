import Link from "next/link";
import Postcard from "@/components/Postcard";
import { listCards } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Gallery() {
  const cards = await listCards();

  if (!cards.length) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <p className="font-hand text-3xl">Здесь пока пусто</p>
        <p className="mt-3 text-ink/70">Первая открытка появится, как только будет готов первый стих.</p>
        <Link href="/new" className="btn mt-8">
          Сделать открытку
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
      {cards.map((c) => (
        <Link key={c.id} href={`/p/${c.id}`} className="group block">
          <div className="overflow-hidden rounded-md shadow-[0_8px_24px_rgba(40,25,10,.18)] transition-transform duration-300 group-hover:-translate-y-1">
            <Postcard {...c} />
          </div>
          <p className="mt-3 truncate font-hand text-lg">{c.title}</p>
        </Link>
      ))}
    </div>
  );
}
