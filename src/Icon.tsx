/* Jeu d'icônes monochromes (trait, currentColor) — pas d'emoji multicolore. */

export type IconName =
  | "list" | "chart" | "box" | "gear" | "user" | "users" | "shirt" | "euro"
  | "receipt" | "bank" | "check" | "clock" | "alert" | "trash" | "search"
  | "inbox" | "undo" | "eye" | "plus" | "shield" | "cart" | "truck" | "tag"
  | "folder" | "card" | "calendar" | "save" | "bag" | "heart" | "x" | "cake"
  | "minus" | "sizes";

const P: Record<IconName, React.ReactNode> = {
  list: <><line x1="8" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="20" y2="12" /><line x1="8" y1="18" x2="20" y2="18" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></>,
  chart: <><line x1="4" y1="20" x2="20" y2="20" /><rect x="6" y="11" width="3" height="6" /><rect x="11" y="7" width="3" height="10" /><rect x="16" y="13" width="3" height="4" /></>,
  box: <><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" /><path d="M3 8l9 5 9-5" /><line x1="12" y1="13" x2="12" y2="21" /></>,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M3 21c0-3.5 3-5 6-5s6 1.5 6 5" /><path d="M16 5.2a3.5 3.5 0 0 1 0 6.6M18 15.5c2 .7 3 2 3 5" /></>,
  shirt: <><path d="M8 3l4 2 4-2 5 4-3 3v9H6v-9L3 7z" /></>,
  euro: <><circle cx="12" cy="12" r="9" /><path d="M15 9a4 4 0 1 0 0 6M7 11h6M7 13h5" /></>,
  receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="9" y1="12" x2="15" y2="12" /></>,
  bank: <><path d="M3 10l9-6 9 6" /><line x1="4" y1="10" x2="4" y2="19" /><line x1="9" y1="10" x2="9" y2="19" /><line x1="15" y1="10" x2="15" y2="19" /><line x1="20" y1="10" x2="20" y2="19" /><line x1="2" y1="21" x2="22" y2="21" /></>,
  check: <><path d="M5 12l5 5L20 6" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></>,
  alert: <><path d="M12 3l9 16H3z" /><line x1="12" y1="9" x2="12" y2="14" /><circle cx="12" cy="17" r=".6" /></>,
  trash: <><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></>,
  search: <><circle cx="11" cy="11" r="7" /><line x1="16" y1="16" x2="21" y2="21" /></>,
  inbox: <><path d="M3 13l3-9h12l3 9v6H3z" /><path d="M3 13h5l1 3h6l1-3h5" /></>,
  undo: <><path d="M9 14l-5-5 5-5" /><path d="M4 9h11a5 5 0 0 1 0 10H9" /></>,
  eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
  minus: <><line x1="5" y1="12" x2="19" y2="12" /></>,
  shield: <><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /></>,
  cart: <><circle cx="9" cy="20" r="1.4" /><circle cx="17" cy="20" r="1.4" /><path d="M3 4h2l2.5 12h10L21 8H6" /></>,
  truck: <><rect x="2" y="7" width="12" height="9" /><path d="M14 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" /></>,
  tag: <><path d="M3 12V4h8l9 9-8 8-9-9z" /><circle cx="7.5" cy="7.5" r="1.2" /></>,
  folder: <><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></>,
  card: <><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /><line x1="6" y1="15" x2="10" y2="15" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="16" y1="3" x2="16" y2="7" /></>,
  save: <><path d="M5 3h12l4 4v14H3V3z" /><path d="M7 3v6h8V3" /><rect x="8" y="13" width="8" height="6" /></>,
  bag: <><path d="M6 8h12v13H6z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /><line x1="6" y1="12" x2="18" y2="12" /></>,
  heart: <><path d="M12 21C6 16.5 3 13 3 9a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1c0 4-3 7.5-9 12z" fill="currentColor" stroke="none" /></>,
  x: <><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></>,
  cake: <><path d="M4 21h16v-7H4z" /><path d="M4 14c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2" /><line x1="12" y1="4" x2="12" y2="8" /></>,
  sizes: <><path d="M3 8h18v8H3z" /><path d="M7 8v4M11 8v6M15 8v4M19 8v6" /></>,
};

export default function Icon({ name, size = 18, className, style }: {
  name: IconName; size?: number; className?: string; style?: React.CSSProperties;
}) {
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {P[name]}
    </svg>
  );
}
