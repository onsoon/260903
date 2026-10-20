import { motion } from "motion/react";
import { Theme } from "../data";

const COLORS = ["#facc15", "#84cc16", "#38bdf8", "#f472b6", "#fb923c", "#a78bfa"];

export default function Celebration({ theme, name, onClose }: { theme: Theme; name: string; onClose: () => void }) {
  const kids = theme === "kids";
  const pieces = Array.from({ length: kids ? 60 : 24 }, (_, i) => i);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/40 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {pieces.map((i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute top-0 block h-3 w-2 rounded-sm"
          style={{ left: `${(i * 37) % 100}%`, background: COLORS[i % COLORS.length] }}
          initial={{ y: -20, rotate: 0 }}
          animate={{ y: "105vh", rotate: 360 * (i % 2 ? 1 : -1) }}
          transition={{ duration: 1.8 + (i % 7) * 0.25, delay: (i % 10) * 0.08, ease: "easeIn" }}
        />
      ))}
      <motion.div
        className={`relative w-full max-w-sm rounded-3xl p-8 text-center shadow-xl ${
          kids ? "bg-white text-stone-800" : "bg-slate-900 text-slate-100 ring-1 ring-teal-500/40"
        }`}
        initial={{ scale: 0.6, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
      >
        <div className="text-6xl">{kids ? "🏆" : "🔥"}</div>
        <h2 className="mt-3 text-2xl font-bold">{kids ? "오늘 미션 완료!" : "Today, clear."}</h2>
        <p className={`mt-2 ${kids ? "text-stone-500" : "text-slate-400"}`}>
          {kids ? `${name}, 정말 멋져요! 내일도 같이 해 봐요 ⭐` : `${name}, 오늘 목표를 전부 해냈어. 꾸준함이 실력이야.`}
        </p>
        <button
          onClick={onClose}
          className={`mt-6 w-full rounded-xl py-3 font-bold ${kids ? "bg-lime-500 text-white" : "bg-teal-400 text-slate-950"}`}
        >
          {kids ? "야호!" : "확인"}
        </button>
      </motion.div>
    </motion.div>
  );
}
