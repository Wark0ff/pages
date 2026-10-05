import { describe, expect, it } from "vitest";
import { blobHost, cardLayout, dateFrom, newId, parseBrief, pluralCards, poemLines } from "./text";

describe("poemLines", () => {
  it("убирает \\r, хвостовые пробелы и пустые строки по краям", () => {
    expect(poemLines("\r\n  \nПервая строка  \r\nВторая\n\n")).toEqual(["Первая строка", "Вторая"]);
  });
  it("сохраняет пустую строку между строфами", () => {
    expect(poemLines("а\nб\n\nв")).toEqual(["а", "б", "", "в"]);
  });
  it("пустой ввод — пустой стих, а не [\"\"]", () => {
    expect(poemLines("   \n ")).toEqual([]);
  });
});

describe("dateFrom", () => {
  it("достаёт дату из комментария поэта", () => {
    expect(dateFrom("Байкал 17/09/26 остров Ольхон")).toBe("17/09/26");
  });
  it("точки превращает в косые", () => {
    expect(dateFrom("Ольхон, 7.9.2026")).toBe("7/9/2026");
  });
  it("без даты — пусто (дату не выдумываем)", () => {
    expect(dateFrom("Байкал, остров Ольхон")).toBe("");
  });
});

describe("pluralCards", () => {
  it.each([
    [1, "открытка"],
    [2, "открытки"],
    [4, "открытки"],
    [5, "открыток"],
    [11, "открыток"],
    [12, "открыток"],
    [21, "открытка"],
    [22, "открытки"],
    [111, "открыток"],
  ])("%i %s", (n, word) => expect(pluralCards(n)).toBe(word));
});

describe("cardLayout", () => {
  const short = Array(8).fill("Короткая строка стиха");
  it("короткий стих — крупный кегль", () => {
    expect(cardLayout("Байкал", short).fs).toBe(27);
  });
  it("12 строк — кегль 25, как в прототипе", () => {
    expect(cardLayout("Байкал", Array(12).fill("Я виды разные видал,")).fs).toBe(25);
  });
  it("длинная первая строка уменьшает кегль, чтобы не залезть под штемпель", () => {
    const poem = ["Очень длинная первая строка стихотворения, которая тянется", ...short];
    expect(cardLayout("Байкал", poem).fs).toBeLessThan(27);
    expect(cardLayout("Байкал", poem).fs).toBeGreaterThanOrEqual(14);
  });
  it("лист письма не выше 1100 даже у очень длинного стиха", () => {
    expect(cardLayout("Т", Array(40).fill("строка")).lh).toBeLessThanOrEqual(1100);
  });
  it("длинный заголовок получает меньший кегль", () => {
    expect(cardLayout("Байкал • остров Ольхон и его берега", short).ts).toBeLessThan(cardLayout("Байкал", short).ts);
  });
});

describe("parseBrief", () => {
  it("достаёт JSON из текста с обёрткой ```json", () => {
    const b = parseBrief('Вот ответ:\n```json\n{"title":"Байкал","notes":["а","б","в"],"stamp":"Сибирь","who":"a hiker","scene":"lake"}\n```');
    expect(b).toEqual({ title: "Байкал", notes: ["а", "б", "в"], stamp: "Сибирь", who: "a hiker", scene: "lake" });
  });
  it("принимает уже разобранный объект", () => {
    expect(parseBrief({ title: "Поле", notes: ["x"], scene: "field" }).title).toBe("Поле");
  });
  it("всегда отдаёт ровно три заметки", () => {
    expect(parseBrief({ notes: ["одна"] }).notes).toEqual(["одна", "", ""]);
    expect(parseBrief({ notes: ["1", "2", "3", "4"] }).notes).toHaveLength(3);
  });
  it("битый JSON — ошибка, а не тихий пустой бриф", () => {
    expect(() => parseBrief("модель ответила без JSON")).toThrow();
  });
});

describe("newId", () => {
  it("8 символов [a-z0-9]", () => {
    expect(newId(new Uint8Array([0, 25, 26, 35, 36, 255, 100, 7, 9]))).toMatch(/^[a-z0-9]{8}$/);
  });
});

describe("blobHost", () => {
  it("хост хранилища из токена", () => {
    expect(blobHost("vercel_blob_rw_AbC123_secret")).toBe("abc123.public.blob.vercel-storage.com");
  });
  it("без токена — null", () => {
    expect(blobHost(undefined)).toBeNull();
  });
});
