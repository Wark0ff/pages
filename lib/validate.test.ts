import { describe, expect, it } from "vitest";
import { validateDraft } from "./validate";

const HOST = "abc123.public.blob.vercel-storage.com";
const ok = {
  title: "  Байкал • остров Ольхон ",
  date: "17/09/26",
  notes: ["Ласковый Ольхон", "Горы в воде", "Солнце"],
  stamp: "Сибирь",
  poem: ["Я виды разные видал,", "Но удивляться не устану,"],
  bg: `https://${HOST}/bg/bg-xyz.jpg`,
};

describe("validateDraft", () => {
  it("пропускает нормальную открытку и обрезает пробелы", () => {
    const d = validateDraft(ok, HOST);
    expect(typeof d).toBe("object");
    expect(d).toMatchObject({ title: "Байкал • остров Ольхон", poem: ok.poem, bg: ok.bg });
  });

  it.each([
    ["чужое хранилище", "https://evil.public.blob.vercel-storage.com/bg/x.jpg"],
    ["хост-обманка в начале", `https://${HOST}.evil.com/bg/x.jpg`],
    ["не папка bg", `https://${HOST}/cards/x.json`],
    ["http вместо https", `http://${HOST}/bg/x.jpg`],
    ["javascript:", "javascript:alert(1)"],
    ["пусто", ""],
  ])("отклоняет фон: %s", (_, bg) => {
    expect(validateDraft({ ...ok, bg }, HOST)).toBe("Неизвестный фон");
  });

  it("без настроенного хранилища фон не принимается", () => {
    expect(validateDraft(ok, null)).toBe("Неизвестный фон");
  });

  it("отклоняет пустой стих", () => {
    expect(validateDraft({ ...ok, poem: ["", "  "] }, HOST)).toBe("Пустой стих");
    expect(validateDraft({ ...ok, poem: "не массив" }, HOST)).toBe("Пустой стих");
  });

  it("режет слишком длинные поля", () => {
    const d = validateDraft({ ...ok, title: "т".repeat(500), notes: ["з".repeat(500), "", "", "лишняя"], poem: Array(100).fill("строка") }, HOST);
    if (typeof d === "string") throw new Error(d);
    expect(d.title).toHaveLength(80);
    expect(d.notes).toHaveLength(3);
    expect(d.notes[0]).toHaveLength(60);
    expect(d.poem).toHaveLength(40);
  });

  it("не падает на мусоре вместо тела", () => {
    expect(validateDraft(null, HOST)).toBe("Неизвестный фон");
    expect(validateDraft("строка", HOST)).toBe("Неизвестный фон");
  });
});
