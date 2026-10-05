import type { CSSProperties } from "react";
import type { Card } from "@/lib/types";

type Props = Pick<Card, "title" | "date" | "notes" | "stamp" | "poem" | "bg">;

/** Размер в единицах открытки: макет 768x1344, --u = 1/768 ширины. */
const u = (px: number) => `calc(${px} * var(--u))`;

function Heart() {
  return (
    <svg width="26" height="22" viewBox="0 0 26 22" style={{ width: u(26), height: u(22) }}>
      <path d="M13 20C4 13 2 9 4 5.5 6 2 10.5 2.5 13 6.5 15.5 2.5 20 2 22 5.5 24 9 22 13 13 20Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function Swash() {
  return (
    <svg width="120" height="16" viewBox="0 0 120 16" style={{ width: u(120), height: u(16) }}>
      <path d="M4 11C30 3 60 14 116 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function Postmark({ date }: { date: string }) {
  return (
    <svg className="mark" viewBox="0 0 150 110">
      <circle cx="45" cy="55" r="38" fill="none" stroke="#2c2c38" strokeWidth="2.2" />
      <circle cx="45" cy="55" r="29" fill="none" stroke="#2c2c38" strokeWidth="1" />
      <text x="45" y="60" textAnchor="middle" fontFamily="var(--font-ptserif), serif" fontSize="13" fontWeight="700" fill="#2c2c38">
        {date.replaceAll("/", ".") || "★"}
      </text>
      {[40, 50, 60, 70].map((y) => (
        <path key={y} d={`M58 ${y} q10 -6 20 0 t20 0 t20 0 t20 0 t20 0`} fill="none" stroke="#2c2c38" strokeWidth="2" />
      ))}
    </svg>
  );
}

/** Открытка в выбранном стиле: заголовок в небе, заметки, стих на листе письма с маркой и штемпелем. */
export default function Postcard({ title, date, notes, stamp, poem, bg }: Props) {
  // кегль и высота листа подстраиваются под длину стиха (как в прототипе)
  const fs = poem.length <= 8 ? 27 : poem.length <= 12 ? 25 : Math.max(17, Math.floor(300 / poem.length));
  const pt = 52;
  const lh = Math.round(poem.length * fs * 1.42) + pt + 70;
  const longest = Math.max(...poem.map((l) => l.length), 1);
  const poemFs = Math.min(fs, Math.floor(560 / (longest * 0.5)));
  const ts = Math.min(66, Math.floor(1250 / Math.max(title.length, 1)));
  const skyY = date ? 152 : 140;
  const bgUrl = `url("${bg}")`;

  return (
    <div className="pc-frame">
      <div
        className="pc"
        style={{ backgroundImage: bgUrl, "--ts": u(ts), "--fs": u(poemFs), "--pt": u(pt), "--lh": u(lh) } as CSSProperties}
      >
        <div className="title glow">{title}</div>
        {date && <div className="date glow">{date}</div>}
        {notes[0] && (
          <div className="note glow" style={{ right: u(26), top: u(skyY + 50), transform: "rotate(-7deg)" }}>
            {notes[0]}
            <Heart />
          </div>
        )}
        {notes[1] && (
          <div className="note glow" style={{ left: u(22), top: u(skyY + 230), transform: "rotate(-9deg)" }}>
            {notes[1]}
            <Swash />
          </div>
        )}
        <div className="letter">
          <div className="sketch" style={{ backgroundImage: bgUrl }} />
          <div className="air" />
          <div className="poem">
            {poem.map((line, i) => (
              <p key={i}>{line || " "}</p>
            ))}
          </div>
          {notes[2] && (
            <div className="note" style={{ right: u(40), bottom: u(46), width: u(150), transform: "rotate(-8deg)" }}>
              {notes[2]}
              <Heart />
            </div>
          )}
          <Postmark date={date} />
          <div className="stampbox">
            <div className="in" style={{ backgroundImage: bgUrl }}>
              <span>{stamp}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
