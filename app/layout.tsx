import type { Metadata } from "next";
import { Bad_Script, Marck_Script, PT_Serif } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import "./postcard.css";

const marck = Marck_Script({ variable: "--font-marck", subsets: ["latin", "cyrillic"], weight: "400" });
const bad = Bad_Script({ variable: "--font-bad", subsets: ["latin", "cyrillic"], weight: "400" });
const ptSerif = PT_Serif({ variable: "--font-ptserif", subsets: ["latin", "cyrillic"], weight: ["400", "700"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: "Открытки со стихами",
  description: "Каждый стих становится открыткой",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${marck.variable} ${bad.variable} ${ptSerif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="mx-auto flex w-full max-w-6xl items-baseline justify-between gap-4 px-5 pt-7 pb-4">
          <Link href="/" className="font-script text-[1.65rem] leading-none text-ink sm:text-4xl">
            Открытки со стихами
          </Link>
          <Link href="/new" className="shrink-0 text-sm tracking-wide text-ink/70 underline-offset-4 hover:underline">
            Новая открытка
          </Link>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-16">{children}</main>
      </body>
    </html>
  );
}
