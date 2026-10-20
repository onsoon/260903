import { Theme } from "./data";

// 초4(kids)는 밝고 큼직하게, 중1(teen)은 어둡고 담백하게
export const THEMES: Record<
  Theme,
  {
    page: string;
    card: string;
    sub: string;
    accentBg: string;
    accentText: string;
    track: string;
    row: string;
    rowDone: string;
    tabOn: string;
    tabOff: string;
    itemText: string;
    heat: [string, string, string]; // 없음, 미완료, 완료
  }
> = {
  kids: {
    page: "bg-gradient-to-b from-amber-50 to-lime-50 text-stone-800",
    card: "bg-white/90 shadow-sm ring-1 ring-amber-100",
    sub: "text-stone-500",
    accentBg: "bg-lime-500",
    accentText: "text-lime-600",
    track: "bg-amber-100",
    row: "bg-white ring-2 ring-amber-100 hover:ring-lime-300",
    rowDone: "bg-lime-100 ring-2 ring-lime-400",
    tabOn: "bg-amber-400 text-white",
    tabOff: "bg-white text-stone-500 ring-1 ring-amber-200",
    itemText: "text-lg",
    heat: ["bg-stone-100", "bg-amber-100", "bg-lime-400"],
  },
  teen: {
    page: "bg-slate-950 text-slate-100",
    card: "bg-slate-900 ring-1 ring-slate-800",
    sub: "text-slate-400",
    accentBg: "bg-teal-400",
    accentText: "text-teal-300",
    track: "bg-slate-800",
    row: "bg-slate-900 ring-1 ring-slate-800 hover:ring-slate-600",
    rowDone: "bg-teal-950/60 ring-1 ring-teal-500/60",
    tabOn: "bg-teal-400 text-slate-950",
    tabOff: "bg-slate-900 text-slate-400 ring-1 ring-slate-800",
    itemText: "text-base",
    heat: ["bg-slate-900", "bg-slate-700", "bg-teal-400"],
  },
};
