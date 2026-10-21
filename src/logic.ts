import { AppState, Child, HabitItem, SUCCESS_RATE, Template, TemplateItem } from "./data";

// ---------- 날짜 ----------

export const toKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const fromKey = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (key: string, n: number) => {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
};

export const todayKey = () => toKey(new Date());

// 해당 날짜가 속한 주의 월요일
export const mondayOf = (key: string) => {
  const day = fromKey(key).getDay();
  return addDays(key, day === 0 ? -6 : 1 - day);
};

export const formatDate = (key: string) => {
  const d = fromKey(key);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${"일월화수목금토"[d.getDay()]})`;
};

// ---------- 체크리스트 계산 ----------

export const itemsForDay = (state: AppState, child: Child, key: string): HabitItem[] => {
  const weekday = fromKey(key).getDay();
  return state.items.filter(
    (it) => it.childId === child.id && it.active && it.stage <= child.stage && it.days.includes(weekday),
  );
};

export const daysLabel = (days: number[]) => {
  const key = [...days].sort().join("");
  if (key === "0123456") return "매일";
  if (key === "12345") return "평일";
  if (key === "06") return "주말";
  return [...days].sort().map((d) => "일월화수목금토"[d]).join("");
};

export const doneOn = (state: AppState, childId: string, key: string) => state.checks[childId]?.[key] ?? [];

export const dayRate = (state: AppState, child: Child, key: string): number | null => {
  const items = itemsForDay(state, child, key);
  if (items.length === 0) return null;
  const done = doneOn(state, child.id, key);
  return items.filter((it) => done.includes(it.id)).length / items.length;
};

// 달성률 80% 이상인 날의 연속 일수 (오늘이 아직 진행 중이면 어제부터 센다)
export const overallStreak = (state: AppState, child: Child, today = todayKey()) => {
  let key = today;
  const r = dayRate(state, child, key);
  if (r === null || r < SUCCESS_RATE) key = addDays(key, -1);
  let streak = 0;
  for (let i = 0; i < 400; i++) {
    const rate = dayRate(state, child, key);
    if (rate === null) {
      // 할 일이 없는 날은 건너뛴다
    } else if (rate >= SUCCESS_RATE) streak++;
    else break;
    key = addDays(key, -1);
  }
  return streak;
};

// 항목별 연속 달성 (해당 항목이 없는 요일은 건너뜀)
export const itemStreak = (state: AppState, item: HabitItem, today = todayKey()) => {
  const checks = state.checks[item.childId] ?? {};
  let key = today;
  if (!(checks[key] ?? []).includes(item.id)) key = addDays(key, -1);
  let streak = 0;
  for (let i = 0; i < 400; i++) {
    if (item.days.includes(fromKey(key).getDay())) {
      if ((checks[key] ?? []).includes(item.id)) streak++;
      else break;
    }
    key = addDays(key, -1);
  }
  return streak;
};

// 아직 오지 않은 날은 빼고 계산
export const weekRate = (state: AppState, child: Child, monday: string, today = todayKey()) => {
  let total = 0;
  let done = 0;
  for (let i = 0; i < 7; i++) {
    const key = addDays(monday, i);
    if (key > today) break;
    const items = itemsForDay(state, child, key);
    const checked = doneOn(state, child.id, key);
    total += items.length;
    done += items.filter((it) => checked.includes(it.id)).length;
  }
  return total === 0 ? null : done / total;
};

// 지난 2주(완료된 주) 연속 80% 이상이면 다음 단계 도전 가능
export const canLevelUp = (state: AppState, child: Child, today = todayKey()) => {
  if (child.stage >= 3) return false;
  const thisMonday = mondayOf(today);
  return [1, 2].every((w) => {
    const r = weekRate(state, child, addDays(thisMonday, -7 * w));
    return r !== null && r >= SUCCESS_RATE;
  });
};

// ---------- 템플릿 공유 (URL에 담기) ----------

const toBase64Url = (s: string) => {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const fromBase64Url = (s: string) => {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
};

export const templateFromChild = (
  state: AppState,
  child: Child,
  meta: Pick<Template, "title" | "description" | "author">,
): Template => ({
  ...meta,
  targetGrade: child.grade,
  // 체크 기록이나 아이 정보는 넣지 않고 항목만 담는다
  items: state.items
    .filter((it) => it.childId === child.id && it.active)
    .map(({ category, emoji, title, stage, days }): TemplateItem => ({ category, emoji, title, stage, days })),
});

const CODE_PREFIX = "HABIT-";

export const templateToCode = (tpl: Template) => CODE_PREFIX + toBase64Url(JSON.stringify(tpl));

// 카톡 등으로 보낼 공유 메시지. 받은 사람은 메시지 전체를 붙여 넣어도 된다.
export const templateToMessage = (tpl: Template) =>
  `🌱 우리집 습관 체크 · "${tpl.title}" (${tpl.items.length}개 항목)\n` +
  `'체크리스트 나눔 → 공유받은 체크리스트 열기'에 아래 코드를 붙여 넣으세요.\n\n${templateToCode(tpl)}`;

const decode = (code: string): Template | null => {
  try {
    return parseTemplate(JSON.parse(fromBase64Url(code)));
  } catch {
    return null;
  }
};

// 공유 메시지, 공유 코드, #t= 링크 모두 받아 준다
export const templateFromText = (text: string): Template | null => {
  const m = text.match(/HABIT-([A-Za-z0-9_-]+)/) ?? text.match(/#t=([A-Za-z0-9_-]+)/);
  return m ? decode(m[1]) : null;
};

export const parseTemplate = (raw: unknown): Template | null => {
  if (!raw || typeof raw !== "object") return null;
  const t = raw as Template;
  if (typeof t.title !== "string" || !Array.isArray(t.items)) return null;
  const items = t.items
    .filter((it) => it && typeof it.title === "string")
    .map((it) => ({
      category: (["생활", "공부", "가족"].includes(it.category) ? it.category : "생활") as TemplateItem["category"],
      emoji: String(it.emoji ?? "✅").slice(0, 8),
      title: it.title.slice(0, 60),
      stage: ([1, 2, 3].includes(it.stage) ? it.stage : 1) as TemplateItem["stage"],
      days: Array.isArray(it.days) ? it.days.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6) : [0, 1, 2, 3, 4, 5, 6],
    }));
  if (items.length === 0) return null;
  return {
    title: t.title.slice(0, 60),
    targetGrade: String(t.targetGrade ?? "").slice(0, 20),
    description: String(t.description ?? "").slice(0, 200),
    author: t.author ? String(t.author).slice(0, 20) : undefined,
    items,
  };
};

export const templateFromHash = (hash: string): Template | null => {
  const m = hash.match(/^#t=([A-Za-z0-9_-]+)$/);
  return m ? decode(m[1]) : null;
};
