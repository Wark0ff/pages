import type { Metadata } from "next";
import { Bad_Script, Cormorant_Garamond, Manrope, Marck_Script, PT_Serif } from "next/font/google";
import Link from "next/link";
import { Feather, Plus } from "@/components/Icons";
import "./globals.css";
import "./postcard.css";

// шрифты открытки
const marck = Marck_Script({ variable: "--font-marck", subsets: ["latin", "cyrillic"], weight: "400" });
const bad = Bad_Script({ variable: "--font-bad", subsets: ["latin", "cyrillic"], weight: "400" });
const ptSerif = PT_Serif({ variable: "--font-ptserif", subsets: ["latin", "cyrillic"], weight: ["400", "700"], style: ["normal", "italic"] });
// шрифты сайта
const cormorant = Cormorant_Garamond({ variable: "--font-cormorant", subsets: ["latin", "cyrillic"], weight: ["500", "600"], style: ["normal", "italic"] });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin", "cyrillic"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: { default: "Открытки со стихами", template: "%s · Открытки со стихами" },
  description: "Каждый стих становится открыткой",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const fonts = [marck, bad, ptSerif, cormorant, manrope].map((f) => f.variable).join(" ");
  return (
    <html lang="ru" className={`${fonts} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-20 border-b border-line/70 bg-bg/90 backdrop-blur">
          <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-accent-ink">
                <Feather className="h-[18px] w-[18px]" />
              </span>
              <span className="font-display text-[1.45rem] font-semibold italic leading-none">Открытки со стихами</span>
            </Link>
            <Link href="/new" className="btn" aria-label="Новая открытка">
              <Plus />
              <span className="hidden sm:inline">Новая открытка</span>
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-20 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
