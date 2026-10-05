// Иконки в стиле Lucide: 24px, обводка 2px.
type P = { className?: string };
const base = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const Plus = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const Share = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden="true">
    <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v13" />
  </svg>
);
export const Download = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </svg>
);
export const ArrowLeft = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden="true">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);
export const Feather = ({ className }: P) => (
  <svg {...base} className={className} aria-hidden="true">
    <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5zM16 8 2 22M17.5 15H9" />
  </svg>
);
