/** Открытка, как она хранится в Blob (cards/<id>.json). */
export type Card = {
  id: string;
  createdAt: string;
  title: string;
  /** Дата из комментария поэта, как он её написал (17/09/26), или пустая строка. */
  date: string;
  /** Три рукописные заметки: две в небе, одна на листе письма. */
  notes: string[];
  stamp: string;
  poem: string[];
  /** Публичный URL фона в Blob. */
  bg: string;
};

/** Что текстовая модель придумывает по стиху. */
export type Brief = {
  title: string;
  notes: string[];
  stamp: string;
  who: string;
  scene: string;
};
