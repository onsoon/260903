// 타입 정의와 기본 체크리스트 템플릿

export type Category = "생활" | "공부" | "가족";
export type Stage = 1 | 2 | 3;
export type Theme = "kids" | "teen";

export type Child = {
  id: string;
  nickname: string;
  grade: string;
  theme: Theme;
  avatar: string;
  stage: Stage;
};

export type HabitItem = {
  id: string;
  childId: string;
  category: Category;
  title: string;
  emoji: string;
  stage: Stage;
  days: number[]; // 0=일 ~ 6=토
  active: boolean;
};

// checks[childId][YYYY-MM-DD] = 완료한 itemId 목록
export type Checks = Record<string, Record<string, string[]>>;

export type AppState = {
  version: 1;
  children: Child[];
  items: HabitItem[];
  checks: Checks;
  pin: string;
};

export type TemplateItem = Omit<HabitItem, "id" | "childId" | "active">;

export type Template = {
  title: string;
  targetGrade: string;
  description: string;
  author?: string;
  items: TemplateItem[];
};

export const CATEGORIES: Category[] = ["생활", "공부", "가족"];
export const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
export const WEEKDAYS_ONLY = [1, 2, 3, 4, 5];

export const STAGES: Record<Stage, { name: string; desc: string }> = {
  1: { name: "생활 기본기", desc: "기상·취침, 위생, 정리정돈, 스마트폰 약속" },
  2: { name: "공부 준비", desc: "숙제 먼저, 준비물, 독서, 집중 환경" },
  3: { name: "자기주도 공부", desc: "복습, 계획 세우기, 오답 정리, 시험 대비" },
};

// 하루 달성률이 이 값 이상이면 "성공한 날"로 본다
export const SUCCESS_RATE = 0.8;

const t = (
  category: Category,
  emoji: string,
  title: string,
  stage: Stage,
  days: number[] = ALL_DAYS,
): TemplateItem => ({ category, emoji, title, stage, days });

export const TEMPLATES: Template[] = [
  {
    title: "초등 4학년 기본 습관",
    targetGrade: "초4",
    description: "생활 기본기부터 시작해 숙제·독서 습관까지 차근차근",
    items: [
      t("생활", "☀️", "7시 30분 전에 일어나기", 1),
      t("생활", "🛏️", "이불 정리하기", 1),
      t("생활", "🪥", "아침·저녁 양치하기", 1),
      t("생활", "📱", "게임·영상은 약속한 1시간만", 1),
      t("생활", "🌙", "9시 30분에 잠자리 들기", 1),
      t("생활", "🎒", "내일 책가방 스스로 챙기기", 2, [0, 1, 2, 3, 4]),
      t("공부", "✏️", "학교 숙제 먼저 끝내기", 2, WEEKDAYS_ONLY),
      t("공부", "📖", "책 20분 읽기", 2),
      t("공부", "🔢", "수학 문제집 1장", 3, WEEKDAYS_ONLY),
      t("공부", "🔤", "영어 단어 5개 외우기", 3, WEEKDAYS_ONLY),
      t("공부", "📒", "오늘 배운 것 한 줄 쓰기", 3, WEEKDAYS_ONLY),
    ],
  },
  {
    title: "중학교 1학년 기본 습관",
    targetGrade: "중1",
    description: "스마트폰 약속과 수면 리듬을 잡고, 복습·계획 습관으로",
    items: [
      t("생활", "⏰", "알람 한 번에 일어나기", 1),
      t("생활", "🍚", "아침 먹기", 1),
      t("생활", "🧹", "책상·방 정리 10분", 1),
      t("생활", "📵", "공부할 때 폰은 거실에", 1),
      t("생활", "🌙", "11시 전 취침 (30분 전 폰 OFF)", 1),
      t("공부", "📅", "오늘 할 일 3가지 계획하기", 2, WEEKDAYS_ONLY),
      t("공부", "📚", "독서 30분", 2),
      t("공부", "🔁", "오늘 배운 과목 복습 30분", 3, WEEKDAYS_ONLY),
      t("공부", "❌", "오답노트 정리", 3, WEEKDAYS_ONLY),
      t("공부", "🔤", "영어 단어 20개", 3, WEEKDAYS_ONLY),
      t("공부", "🎯", "수행평가·시험 일정 확인", 3, [0]),
    ],
  },
  {
    title: "중학생 시험 기간 집중 모드",
    targetGrade: "중1",
    description: "시험 2주 전부터 쓰는 공부 강화 체크리스트",
    items: [
      t("생활", "🌙", "12시 전 취침 (밤샘 금지)", 1),
      t("생활", "📵", "공부 시간 폰 잠금", 1),
      t("공부", "🗓️", "과목별 오늘 공부 범위 정하기", 1),
      t("공부", "📝", "교과서·필기 1회독", 1),
      t("공부", "✍️", "기출·문제집 풀기", 1),
      t("공부", "❌", "틀린 문제 다시 풀기", 1),
      t("공부", "🗣️", "외운 내용 소리 내어 설명하기", 1),
    ],
  },
  {
    title: "방학 생활 리듬",
    targetGrade: "초등·중등",
    description: "방학에도 무너지지 않는 기상·취침과 하루 공부량",
    items: [
      t("생활", "☀️", "8시 전에 일어나기", 1),
      t("생활", "🏃", "30분 몸 움직이기", 1),
      t("생활", "🧹", "내 방 정리하기", 1),
      t("생활", "📱", "영상·게임 2시간 이내", 1),
      t("공부", "📖", "책 30분 읽기", 1),
      t("공부", "📘", "방학 숙제·문제집 정해진 분량", 1, WEEKDAYS_ONLY),
      t("가족", "🍳", "집안일 하나 돕기", 1),
    ],
  },
  {
    title: "가족 공통 습관",
    targetGrade: "온 가족",
    description: "아이 체크리스트에 함께 넣으면 좋은 가족 항목",
    items: [
      t("가족", "👨‍👩‍👧‍👦", "저녁 식사 함께하기", 1),
      t("가족", "💬", "오늘 좋았던 일 하나 나누기", 1),
      t("가족", "🙏", "고마운 일 한 가지 말하기", 1),
    ],
  },
];

export const uid = () => Math.random().toString(36).slice(2, 10);

export const itemsFromTemplate = (tpl: Template, childId: string): HabitItem[] =>
  tpl.items.map((it) => ({ ...it, id: uid(), childId, active: true }));

export function createDefaultState(): AppState {
  const teen: Child = { id: uid(), nickname: "첫째", grade: "중1", theme: "teen", avatar: "🚀", stage: 1 };
  const kid: Child = { id: uid(), nickname: "둘째", grade: "초4", theme: "kids", avatar: "🐣", stage: 1 };
  return {
    version: 1,
    children: [teen, kid],
    items: [...itemsFromTemplate(TEMPLATES[1], teen.id), ...itemsFromTemplate(TEMPLATES[0], kid.id)],
    checks: {},
    pin: "0000",
  };
}
