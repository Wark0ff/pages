import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Postcard from "@/components/Postcard";
import ShareButtons from "@/components/ShareButtons";
import { getCard } from "@/lib/store";

export async function generateMetadata({ params }: PageProps<"/p/[id]">): Promise<Metadata> {
  const card = await getCard((await params).id);
  if (!card) return {};
  return {
    title: card.title,
    description: card.poem.slice(0, 2).join(" "),
    openGraph: { title: card.title, description: card.poem.slice(0, 2).join(" "), images: [card.bg] },
  };
}

export default async function CardPage({ params }: PageProps<"/p/[id]">) {
  const card = await getCard((await params).id);
  if (!card) notFound();

  return (
    <div className="mx-auto flex max-w-[460px] flex-col items-center">
      <div className="w-full overflow-hidden rounded-lg shadow-[0_18px_50px_rgba(40,25,10,.28)]">
        <Postcard {...card} />
      </div>
      <ShareButtons title={card.title} />
      <Link href="/" className="mt-6 text-sm text-ink/70 underline-offset-4 hover:underline">
        ← Все открытки
      </Link>
    </div>
  );
}
