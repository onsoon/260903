import { useState } from "react";
import { Flame, Lock, Share2 } from "lucide-react";
import { motion } from "motion/react";
import { Template } from "./data";
import { formatDate, itemsForDay, doneOn, overallStreak, templateFromHash, todayKey } from "./logic";
import { useAppState } from "./store";
import ChildView from "./components/ChildView";
import ParentMode from "./components/ParentMode";
import SharePage from "./components/SharePage";

type Route = { name: "home" } | { name: "child"; id: string } | { name: "parent" } | { name: "share" };

function readIncoming(): Template | null {
  const tpl = templateFromHash(location.hash);
  // 링크로 들어온 템플릿은 한 번만 보여 주고 주소창은 깨끗하게
  if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  return tpl;
}

export default function App() {
  const [state, setState] = useAppState();
  const [incoming] = useState(readIncoming);
  const [route, setRoute] = useState<Route>(incoming ? { name: "share" } : { name: "home" });
  const home = () => {
    setRoute({ name: "home" });
    window.scrollTo(0, 0);
  };

  if (route.name === "child") {
    const child = state.children.find((c) => c.id === route.id);
    if (child) return <ChildView key={child.id} state={state} setState={setState} child={child} onBack={home} />;
  }
  if (route.name === "parent") return <ParentMode state={state} setState={setState} onBack={home} />;
  if (route.name === "share") return <SharePage state={state} setState={setState} incoming={incoming} onBack={home} />;

  const today = todayKey();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-sky-50 text-stone-800">
      <div className="mx-auto max-w-xl px-4 pb-16 pt-10">
        <header className="text-center">
          <div className="text-5xl">🌱</div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">우리집 습관 체크</h1>
          <p className="mt-1 text-stone-500">{formatDate(today)} · 오늘도 한 칸씩 채워 볼까요?</p>
        </header>

        <div className="mt-8 grid gap-4">
          {state.children.map((c, i) => {
            const items = itemsForDay(state, c, today);
            const done = doneOn(state, c.id, today);
            const count = items.filter((it) => done.includes(it.id)).length;
            const pct = items.length ? count / items.length : 0;
            const streak = overallStreak(state, c, today);
            const teen = c.theme === "teen";
            return (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setRoute({ name: "child", id: c.id });
                  window.scrollTo(0, 0);
                }}
                className={`flex items-center gap-4 rounded-3xl p-5 text-left shadow-sm ${
                  teen ? "bg-slate-900 text-slate-100" : "bg-white ring-2 ring-amber-100"
                }`}
              >
                <div className="text-5xl">{c.avatar}</div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold">{c.nickname}</span>
                    <span className={`text-sm ${teen ? "text-slate-400" : "text-stone-400"}`}>{c.grade}</span>
                  </div>
                  <div className={`mt-2 h-2.5 overflow-hidden rounded-full ${teen ? "bg-slate-800" : "bg-amber-100"}`}>
                    <div
                      className={`h-full rounded-full ${teen ? "bg-teal-400" : "bg-lime-500"}`}
                      style={{ width: `${pct * 100}%` }}
                    />
                  </div>
                  <div className={`mt-1.5 flex justify-between text-sm ${teen ? "text-slate-400" : "text-stone-500"}`}>
                    <span>
                      오늘 {count}/{items.length}
                      {items.length > 0 && count === items.length && " 🎉"}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Flame size={14} className="text-orange-500" /> {streak}일 연속
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <button
            onClick={() => setRoute({ name: "parent" })}
            className="flex items-center justify-center gap-2 rounded-2xl bg-white py-3 font-semibold shadow-sm ring-1 ring-stone-100"
          >
            <Lock size={18} /> 부모 모드
          </button>
          <button
            onClick={() => setRoute({ name: "share" })}
            className="flex items-center justify-center gap-2 rounded-2xl bg-white py-3 font-semibold shadow-sm ring-1 ring-stone-100"
          >
            <Share2 size={18} /> 체크리스트 나눔
          </button>
        </div>

        <section className="mt-8 rounded-2xl bg-white/70 p-5 text-sm text-stone-600 ring-1 ring-stone-100">
          <h2 className="font-bold text-stone-800">이렇게 써 보세요</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>아이가 직접 자기 카드를 눌러 체크해요. 부모님은 확인하고 칭찬만!</li>
            <li>하루 80% 이상 하면 🔥 연속 기록이 이어져요.</li>
            <li>2주 연속 80%를 넘기면 부모 모드에서 다음 단계로 올려 주세요.</li>
            <li>일요일 저녁에 '이번 주 기록'을 같이 보며 다음 주 항목을 정해요.</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
