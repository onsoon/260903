import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { AppState, CATEGORIES, Category, Child, STAGES } from "../data";
import {
  addDays,
  dayRate,
  doneOn,
  formatDate,
  fromKey,
  itemStreak,
  itemsForDay,
  mondayOf,
  overallStreak,
  todayKey,
  weekRate,
} from "../logic";
import { THEMES } from "../theme";
import Celebration from "./Celebration";

type Props = {
  state: AppState;
  setState: Dispatch<SetStateAction<AppState>>;
  child: Child;
  onBack: () => void;
};

export default function ChildView({ state, setState, child, onBack }: Props) {
  const th = THEMES[child.theme];
  const today = todayKey();
  const [date, setDate] = useState(today);
  const [view, setView] = useState<"today" | "week">("today");
  const [celebrate, setCelebrate] = useState(false);

  const items = itemsForDay(state, child, date);
  const done = doneOn(state, child.id, date);
  const doneCount = items.filter((it) => done.includes(it.id)).length;
  const categories = CATEGORIES.filter((c) => items.some((it) => it.category === c));
  const [selectedTab, setTab] = useState<Category | "전체">("전체");
  const tab = selectedTab !== "전체" && categories.includes(selectedTab) ? selectedTab : "전체";
  const shown = tab === "전체" ? items : items.filter((it) => it.category === tab);
  const streak = overallStreak(state, child, today);

  const toggle = (itemId: string) => {
    const wasDone = done.includes(itemId);
    const next = wasDone ? done.filter((id) => id !== itemId) : [...done, itemId];
    setState((s) => ({
      ...s,
      checks: { ...s.checks, [child.id]: { ...(s.checks[child.id] ?? {}), [date]: next } },
    }));
    if (!wasDone && items.every((it) => next.includes(it.id))) setCelebrate(true);
  };

  return (
    <div className={`min-h-screen ${th.page}`}>
      <div className="mx-auto max-w-xl px-4 pb-16 pt-4">
        <header className="flex items-center gap-3">
          <button onClick={onBack} className={`rounded-full p-2 ${th.card}`} aria-label="처음으로">
            <ArrowLeft size={20} />
          </button>
          <div className="text-4xl">{child.avatar}</div>
          <div className="flex-1">
            <h1 className={`font-bold ${child.theme === "kids" ? "text-2xl" : "text-xl"}`}>{child.nickname}의 습관</h1>
            <p className={`text-sm ${th.sub}`}>
              {child.grade} · {child.stage}단계 {STAGES[child.stage].name}
            </p>
          </div>
          <div className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-bold ${th.card}`}>
            <Flame size={18} className="text-orange-500" />
            {streak}일
          </div>
        </header>

        <div className="mt-5 grid grid-cols-2 gap-2">
          {(["today", "week"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-xl py-2 font-semibold ${view === v ? th.tabOn : th.tabOff}`}
            >
              {v === "today" ? "오늘의 체크" : "이번 주 기록"}
            </button>
          ))}
        </div>

        {view === "today" ? (
          <>
            <section className={`mt-4 rounded-2xl p-4 ${th.card}`}>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setDate(addDays(date, -1))}
                  className="rounded-full p-1.5 hover:bg-black/5"
                  aria-label="전날"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="text-center">
                  <div className="font-semibold">{formatDate(date)}</div>
                  {date !== today && (
                    <button onClick={() => setDate(today)} className={`text-xs underline ${th.accentText}`}>
                      오늘로 가기
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setDate(addDays(date, 1))}
                  disabled={date >= today}
                  className="rounded-full p-1.5 hover:bg-black/5 disabled:opacity-20"
                  aria-label="다음날"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className={`h-3 flex-1 overflow-hidden rounded-full ${th.track}`}>
                  <motion.div
                    className={`h-full rounded-full ${th.accentBg}`}
                    animate={{ width: `${items.length ? (doneCount / items.length) * 100 : 0}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  />
                </div>
                <span className="text-sm font-bold tabular-nums">
                  {doneCount} / {items.length}
                </span>
              </div>
            </section>

            {categories.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto">
                {(["전체", ...categories] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setTab(c)}
                    className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold ${tab === c ? th.tabOn : th.tabOff}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            <ul className="mt-3 space-y-2">
              {shown.map((it) => {
                const isDone = done.includes(it.id);
                const s = itemStreak(state, it, today);
                return (
                  <li key={it.id}>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => toggle(it.id)}
                      className={`flex min-h-14 w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                        isDone ? th.rowDone : th.row
                      }`}
                    >
                      <span className={child.theme === "kids" ? "text-3xl" : "text-2xl"}>{it.emoji}</span>
                      <span className={`flex-1 font-medium ${th.itemText} ${isDone ? "opacity-60" : ""}`}>
                        {it.title}
                      </span>
                      {s >= 2 && (
                        <span className="flex items-center text-xs font-bold text-orange-500">
                          <Flame size={14} />
                          {s}
                        </span>
                      )}
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                          isDone ? `${th.accentBg} border-transparent text-white` : "border-current opacity-30"
                        }`}
                      >
                        <AnimatePresence>
                          {isDone && (
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                              <Check size={18} strokeWidth={3} />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </span>
                    </motion.button>
                  </li>
                );
              })}
              {items.length === 0 && (
                <li className={`rounded-2xl p-8 text-center ${th.card} ${th.sub}`}>
                  오늘은 체크할 항목이 없어요. 푹 쉬어요! 😊
                </li>
              )}
            </ul>

            {items.length > 0 && doneCount === items.length && (
              <p className={`mt-4 text-center font-bold ${th.accentText}`}>
                {child.theme === "kids" ? "🎉 오늘 할 일을 모두 해냈어요! 최고예요!" : "✔ 오늘 목표 완료. 잘했어!"}
              </p>
            )}
          </>
        ) : (
          <WeekView state={state} child={child} />
        )}
      </div>

      <AnimatePresence>
        {celebrate && <Celebration theme={child.theme} name={child.nickname} onClose={() => setCelebrate(false)} />}
      </AnimatePresence>
    </div>
  );
}

function WeekView({ state, child }: { state: AppState; child: Child }) {
  const th = THEMES[child.theme];
  const today = todayKey();
  const [monday, setMonday] = useState(mondayOf(today));
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const rate = weekRate(state, child, monday);

  // 이번 주에 한 번이라도 나오는 항목
  const rows = useMemo(() => {
    const ids = new Set(days.flatMap((d) => itemsForDay(state, child, d).map((it) => it.id)));
    return state.items.filter((it) => ids.has(it.id));
  }, [state, child, monday]);

  return (
    <section className={`mt-4 rounded-2xl p-4 ${th.card}`}>
      <div className="flex items-center justify-between">
        <button onClick={() => setMonday(addDays(monday, -7))} className="rounded-full p-1.5" aria-label="지난주">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <div className="font-semibold">
            {fromKey(monday).getMonth() + 1}/{fromKey(monday).getDate()} ~ {fromKey(days[6]).getMonth() + 1}/
            {fromKey(days[6]).getDate()}
          </div>
          <div className={`text-sm ${th.sub}`}>
            주간 달성률 <b className={th.accentText}>{rate === null ? "-" : `${Math.round(rate * 100)}%`}</b>
          </div>
        </div>
        <button
          onClick={() => setMonday(addDays(monday, 7))}
          disabled={monday >= mondayOf(today)}
          className="rounded-full p-1.5 disabled:opacity-20"
          aria-label="다음주"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full table-fixed border-separate border-spacing-0.5 text-sm">
          <thead>
            <tr>
              <th className="w-[38%]" />
              {days.map((d) => {
                const r = dayRate(state, child, d);
                return (
                  <th key={d} className={`font-medium ${d === today ? th.accentText : th.sub}`}>
                    <div>{"일월화수목금토"[fromKey(d).getDay()]}</div>
                    <div className="text-[10px]">{r === null || d > today ? "" : `${Math.round(r * 100)}%`}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((it) => (
              <tr key={it.id}>
                <td className="truncate pr-1" title={it.title}>
                  {it.emoji} {it.title}
                </td>
                {days.map((d) => {
                  const scheduled = itemsForDay(state, child, d).some((x) => x.id === it.id);
                  const isDone = doneOn(state, child.id, d).includes(it.id);
                  const cls = !scheduled || d > today ? th.heat[0] : isDone ? th.heat[2] : th.heat[1];
                  return (
                    <td key={d}>
                      <div className={`mx-auto aspect-square w-full max-w-7 rounded-md ${cls}`} title={isDone ? "완료" : ""} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className={`py-6 text-center ${th.sub}`}>이번 주 항목이 없어요.</p>}
      </div>
    </section>
  );
}
