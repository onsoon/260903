import { useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, Eye, EyeOff, Lock, Pencil, Plus, Trash2 } from "lucide-react";
import {
  ALL_DAYS,
  AppState,
  CATEGORIES,
  Category,
  Child,
  HabitItem,
  Stage,
  STAGES,
  TEMPLATES,
  Theme,
  WEEKDAYS,
  createDefaultState,
  itemsFromTemplate,
  uid,
} from "../data";
import { addDays, canLevelUp, daysLabel, mondayOf, todayKey, weekRate } from "../logic";
import { downloadJson, isAppState, readJsonFile } from "../store";
import { ask } from "./Confirm";
import { SheetCard } from "./SheetSync";
import type { SyncController } from "../sync";

type Props = {
  sync: SyncController;
  unlocked: boolean;
  onUnlock: () => void;
  onGuide: () => void;
  state: AppState;
  setState: Dispatch<SetStateAction<AppState>>;
  onBack: () => void;
};

export default function ParentMode({ state, setState, onBack, sync, unlocked, onUnlock, onGuide }: Props) {
  const [childId, setChildId] = useState(state.children[0]?.id);
  const child = state.children.find((c) => c.id === childId) ?? state.children[0];

  if (!unlocked) return <PinGate pin={state.pin} onUnlock={onUnlock} onBack={onBack} />;

  const updateChild = (patch: Partial<Child>) =>
    setState((s) => ({ ...s, children: s.children.map((c) => (c.id === child.id ? { ...c, ...patch } : c)) }));

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      <div className="mx-auto max-w-2xl px-4 pb-20 pt-4">
        <header className="flex items-center gap-3">
          <button onClick={onBack} className="rounded-full bg-white p-2 shadow-sm" aria-label="처음으로">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">🔒 부모 모드</h1>
        </header>

        <div className="mt-4 flex gap-2 overflow-x-auto">
          {state.children.map((c) => (
            <button
              key={c.id}
              onClick={() => setChildId(c.id)}
              className={`shrink-0 rounded-full px-4 py-2 font-semibold ${
                c.id === child.id ? "bg-stone-800 text-white" : "bg-white ring-1 ring-stone-200"
              }`}
            >
              {c.avatar} {c.nickname}
            </button>
          ))}
          <button
            onClick={() => {
              const c: Child = { id: uid(), nickname: "새 아이", grade: "", theme: "kids", avatar: "🌟", stage: 1 };
              setState((s) => ({ ...s, children: [...s.children, c] }));
              setChildId(c.id);
            }}
            className="shrink-0 rounded-full bg-white px-4 py-2 text-stone-500 ring-1 ring-dashed ring-stone-300"
          >
            <Plus size={16} className="inline" /> 아이 추가
          </button>
        </div>

        {child && (
          <>
            <ChildSettings state={state} child={child} update={updateChild} />
            <ItemsEditor state={state} setState={setState} child={child} />
            <TemplateApply setState={setState} child={child} />
            <Card title="아이 삭제">
              <button
                disabled={state.children.length <= 1}
                onClick={async () => {
                  if (!(await ask(`${child.nickname}의 항목과 기록을 모두 지울까요?\n되돌릴 수 없어요.`, { danger: true }))) return;
                  setState((s) => {
                    const { [child.id]: _, ...checks } = s.checks;
                    return {
                      ...s,
                      children: s.children.filter((c) => c.id !== child.id),
                      items: s.items.filter((it) => it.childId !== child.id),
                      checks,
                    };
                  });
                  setChildId(state.children.find((c) => c.id !== child.id)?.id);
                }}
                className="rounded-lg px-3 py-2 text-sm text-red-600 ring-1 ring-red-200 disabled:opacity-40"
              >
                {child.nickname} 삭제
              </button>
            </Card>
          </>
        )}

        <SheetCard sync={sync} onGuide={onGuide} />
        <AppSettings state={state} setState={setState} />
      </div>
    </div>
  );
}

function Card({ title, children, desc }: { title: string; desc?: string; children: ReactNode }) {
  return (
    <section className="mt-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-100">
      <h2 className="font-bold">{title}</h2>
      {desc && <p className="mt-1 text-sm text-stone-500">{desc}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

const input = "w-full rounded-lg border border-stone-200 bg-white px-3 py-2 outline-none focus:border-stone-500";

function PinGate({ pin, onUnlock, onBack }: { pin: string; onUnlock: () => void; onBack: () => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const submit = () => (value === pin ? onUnlock() : (setError(true), setValue("")));

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 p-4">
      <div className="w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-sm">
        <Lock className="mx-auto text-stone-400" />
        <h1 className="mt-2 text-lg font-bold">부모 모드</h1>
        <p className="mt-1 text-sm text-stone-500">비밀번호 4자리를 입력하세요</p>
        <input
          autoFocus
          inputMode="numeric"
          type="password"
          maxLength={8}
          value={value}
          onChange={(e) => (setValue(e.target.value.replace(/\D/g, "")), setError(false))}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className={`${input} mt-4 text-center text-2xl tracking-[0.5em]`}
        />
        {error && <p className="mt-2 text-sm text-red-500">비밀번호가 달라요</p>}
        {pin === "0000" && <p className="mt-2 text-xs text-stone-400">처음 비밀번호는 0000 이에요</p>}
        <button onClick={submit} className="mt-4 w-full rounded-xl bg-stone-800 py-3 font-bold text-white">
          열기
        </button>
        <button onClick={onBack} className="mt-2 text-sm text-stone-500">
          돌아가기
        </button>
      </div>
    </div>
  );
}

const AVATARS = ["🐣", "🚀", "🌟", "🦊", "🐯", "🐰", "🐼", "🦄", "⚽", "🎨", "🎧", "🌱"];

function ChildSettings({ state, child, update }: { state: AppState; child: Child; update: (p: Partial<Child>) => void }) {
  const today = todayKey();
  const lastWeek = weekRate(state, child, addDays(mondayOf(today), -7));
  const thisWeek = weekRate(state, child, mondayOf(today));
  const pct = (r: number | null) => (r === null ? "-" : `${Math.round(r * 100)}%`);

  return (
    <Card title="아이 정보" desc="실명 대신 별명을 쓰는 것을 권장해요">
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          별명
          <input className={input} value={child.nickname} onChange={(e) => update({ nickname: e.target.value })} />
        </label>
        <label className="text-sm">
          학년
          <input
            className={input}
            value={child.grade}
            placeholder="예: 초4"
            onChange={(e) => update({ grade: e.target.value })}
          />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {AVATARS.map((a) => (
          <button
            key={a}
            onClick={() => update({ avatar: a })}
            className={`rounded-lg p-1.5 text-2xl ${child.avatar === a ? "bg-amber-100 ring-2 ring-amber-400" : ""}`}
          >
            {a}
          </button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {(["kids", "teen"] as Theme[]).map((t) => (
          <button
            key={t}
            onClick={() => update({ theme: t })}
            className={`rounded-xl py-2 text-sm font-semibold ${
              child.theme === t ? "bg-stone-800 text-white" : "ring-1 ring-stone-200"
            }`}
          >
            {t === "kids" ? "🐣 초등 화면 (밝고 크게)" : "🚀 중등 화면 (어둡고 깔끔)"}
          </button>
        ))}
      </div>

      <div className="mt-5">
        <div className="text-sm font-semibold">습관 단계</div>
        <p className="text-xs text-stone-500">현재 단계 이하의 항목만 아이 화면에 보여요. 앞 단계 항목은 계속 유지돼요.</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {([1, 2, 3] as Stage[]).map((s) => (
            <button
              key={s}
              onClick={() => update({ stage: s })}
              className={`rounded-xl p-2 text-left text-sm ${
                child.stage === s ? "bg-lime-100 ring-2 ring-lime-500" : "ring-1 ring-stone-200"
              }`}
            >
              <div className="font-bold">{s}단계</div>
              <div className="text-xs text-stone-500">{STAGES[s].name}</div>
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-stone-600">
          지난주 달성률 <b>{pct(lastWeek)}</b> · 이번 주 <b>{pct(thisWeek)}</b>
        </p>
        {canLevelUp(state, child, today) && (
          <div className="mt-2 rounded-xl bg-amber-50 p-3 text-sm ring-1 ring-amber-200">
            🎉 2주 연속 80% 이상 달성! {child.stage + 1}단계({STAGES[(child.stage + 1) as Stage].name})로 올려 볼까요?
            <button
              onClick={() => update({ stage: (child.stage + 1) as Stage })}
              className="ml-2 rounded-lg bg-amber-400 px-2 py-1 font-bold text-white"
            >
              단계 올리기
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}

const emptyDraft = (): Omit<HabitItem, "id" | "childId"> => ({
  category: "생활",
  emoji: "✅",
  title: "",
  stage: 1,
  days: [...ALL_DAYS],
  active: true,
});

function ItemsEditor({
  state,
  setState,
  child,
}: {
  state: AppState;
  setState: Dispatch<SetStateAction<AppState>>;
  child: Child;
}) {
  const items = state.items.filter((it) => it.childId === child.id);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);

  const patchItem = (id: string, patch: Partial<HabitItem>) =>
    setState((s) => ({ ...s, items: s.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) }));

  const move = (id: string, dir: -1 | 1) =>
    setState((s) => {
      const list = [...s.items];
      const mine = list.map((it, i) => [it, i] as const).filter(([it]) => it.childId === child.id);
      const pos = mine.findIndex(([it]) => it.id === id);
      const other = mine[pos + dir];
      if (!other) return s;
      const a = mine[pos][1];
      const b = other[1];
      [list[a], list[b]] = [list[b], list[a]];
      return { ...s, items: list };
    });

  const save = () => {
    if (!draft.title.trim()) return;
    if (editing === "new") {
      setState((s) => ({ ...s, items: [...s.items, { ...draft, title: draft.title.trim(), id: uid(), childId: child.id }] }));
    } else if (editing) {
      patchItem(editing, { ...draft, title: draft.title.trim() });
    }
    setEditing(null);
  };

  return (
    <Card title="체크리스트 항목" desc="하루 항목은 5~7개 정도가 좋아요. 눈 아이콘으로 잠시 숨길 수 있어요.">
      {CATEGORIES.map((cat) => {
        const list = items.filter((it) => it.category === cat);
        if (list.length === 0) return null;
        return (
          <div key={cat} className="mb-4">
            <div className="mb-1 text-xs font-bold text-stone-400">{cat}</div>
            <ul className="space-y-1">
              {list.map((it) => (
                <li
                  key={it.id}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1.5 ring-1 ring-stone-100 ${
                    it.active ? "" : "opacity-40"
                  }`}
                >
                  <span className="mr-1 text-xl">{it.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-2 text-sm font-medium">{it.title}</div>
                    <div className="text-xs text-stone-400">
                      {it.stage}단계 · {daysLabel(it.days)}
                      {it.stage > child.stage && " · 아직 숨김"}
                    </div>
                  </div>
                  <IconBtn label="위로" onClick={() => move(it.id, -1)}>
                    <ArrowUp size={16} />
                  </IconBtn>
                  <IconBtn label="아래로" onClick={() => move(it.id, 1)}>
                    <ArrowDown size={16} />
                  </IconBtn>
                  <IconBtn label={it.active ? "숨기기" : "보이기"} onClick={() => patchItem(it.id, { active: !it.active })}>
                    {it.active ? <Eye size={16} /> : <EyeOff size={16} />}
                  </IconBtn>
                  <IconBtn
                    label="수정"
                    onClick={() => {
                      const { id: _id, childId: _c, ...rest } = it;
                      setDraft(rest);
                      setEditing(it.id);
                    }}
                  >
                    <Pencil size={16} />
                  </IconBtn>
                  <IconBtn
                    label="삭제"
                    onClick={async () =>
                      (await ask(`'${it.title}' 항목을 삭제할까요?`, { danger: true })) &&
                      setState((s) => ({ ...s, items: s.items.filter((x) => x.id !== it.id) }))
                    }
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </IconBtn>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      {editing ? (
        <div className="rounded-xl bg-stone-50 p-3 ring-1 ring-stone-200">
          <div className="flex gap-2">
            <input
              className={`${input} w-16 text-center text-xl`}
              value={draft.emoji}
              onChange={(e) => setDraft({ ...draft, emoji: e.target.value })}
              aria-label="이모지"
            />
            <input
              autoFocus
              className={input}
              placeholder="예: 책 20분 읽기"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && save()}
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {CATEGORIES.map((c: Category) => (
              <Chip key={c} on={draft.category === c} onClick={() => setDraft({ ...draft, category: c })}>
                {c}
              </Chip>
            ))}
            <span className="mx-1" />
            {([1, 2, 3] as Stage[]).map((s) => (
              <Chip key={s} on={draft.stage === s} onClick={() => setDraft({ ...draft, stage: s })}>
                {s}단계
              </Chip>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {WEEKDAYS.map((w, d) => (
              <Chip
                key={w}
                on={draft.days.includes(d)}
                onClick={() =>
                  setDraft({
                    ...draft,
                    days: draft.days.includes(d) ? draft.days.filter((x) => x !== d) : [...draft.days, d].sort(),
                  })
                }
              >
                {w}
              </Chip>
            ))}
            <Chip on={false} onClick={() => setDraft({ ...draft, days: [1, 2, 3, 4, 5] })}>
              평일
            </Chip>
            <Chip on={false} onClick={() => setDraft({ ...draft, days: [...ALL_DAYS] })}>
              매일
            </Chip>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={save}
              disabled={!draft.title.trim() || draft.days.length === 0}
              className="flex-1 rounded-lg bg-stone-800 py-2 font-bold text-white disabled:opacity-40"
            >
              저장
            </button>
            <button onClick={() => setEditing(null)} className="rounded-lg px-4 py-2 ring-1 ring-stone-200">
              취소
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => {
            setDraft(emptyDraft());
            setEditing("new");
          }}
          className="w-full rounded-xl py-2.5 font-semibold text-stone-600 ring-1 ring-dashed ring-stone-300"
        >
          <Plus size={16} className="inline" /> 항목 추가
        </button>
      )}
    </Card>
  );
}

function TemplateApply({ setState, child }: { setState: Dispatch<SetStateAction<AppState>>; child: Child }) {
  const [idx, setIdx] = useState(0);
  const apply = async (replace: boolean) => {
    const tpl = TEMPLATES[idx];
    if (replace && !(await ask(`${child.nickname}의 현재 항목을 '${tpl.title}'로 바꿀까요?\n(체크 기록은 남아요)`))) return;
    setState((s) => ({
      ...s,
      items: [...(replace ? s.items.filter((it) => it.childId !== child.id) : s.items), ...itemsFromTemplate(tpl, child.id)],
    }));
  };
  return (
    <Card title="기본 템플릿 불러오기" desc="시험 기간, 방학 등 상황에 맞게 바꿔 쓸 수 있어요">
      <select className={input} value={idx} onChange={(e) => setIdx(Number(e.target.value))}>
        {TEMPLATES.map((t, i) => (
          <option key={t.title} value={i}>
            {t.title} ({t.items.length}개)
          </option>
        ))}
      </select>
      <div className="mt-2 flex gap-2">
        <button onClick={() => apply(false)} className="flex-1 rounded-lg py-2 text-sm font-semibold ring-1 ring-stone-200">
          지금 항목에 추가
        </button>
        <button onClick={() => apply(true)} className="flex-1 rounded-lg bg-stone-800 py-2 text-sm font-semibold text-white">
          통째로 바꾸기
        </button>
      </div>
    </Card>
  );
}

function AppSettings({ state, setState }: { state: AppState; setState: Dispatch<SetStateAction<AppState>> }) {
  const [newPin, setNewPin] = useState("");
  const [notice, setNotice] = useState("");
  const [restoreText, setRestoreText] = useState("");
  const [showRestore, setShowRestore] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const restore = async (data: unknown) => {
    if (!isAppState(data)) {
      setNotice("⚠️ 백업 내용을 읽을 수 없어요. 복사한 백업 코드 전체를 붙여 넣었는지 확인해 주세요.");
      return;
    }
    if (await ask("지금 데이터를 백업 내용으로 바꿀까요?")) {
      setState(data);
      setRestoreText("");
      setShowRestore(false);
      setNotice("✅ 백업에서 복원했어요.");
    }
  };

  return (
    <Card title="설정 · 백업" desc="기록은 이 기기의 브라우저에만 저장돼요. 기기를 바꾸기 전에 백업해 주세요.">
      <div className="flex gap-2">
        <input
          id="new-pin"
          className={input}
          inputMode="numeric"
          placeholder="새 비밀번호 (숫자 4자리 이상)"
          value={newPin}
          onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
        />
        <button
          disabled={newPin.length < 4}
          onClick={() => {
            setState((s) => ({ ...s, pin: newPin }));
            setNewPin("");
            setNotice("✅ 비밀번호를 바꿨어요.");
          }}
          className="shrink-0 rounded-lg bg-stone-800 px-4 text-sm font-semibold text-white disabled:opacity-40"
        >
          변경
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(JSON.stringify(state));
              setNotice("✅ 백업 코드를 복사했어요. 메모 앱이나 카톡 '나에게 보내기'에 붙여 넣어 보관하세요.");
            } catch {
              setNotice("⚠️ 복사가 막혀 있어요. '백업 파일 받기'를 이용해 주세요.");
            }
          }}
          className="rounded-lg py-2 text-sm font-semibold ring-1 ring-stone-200"
        >
          📋 백업 코드 복사
        </button>
        <button onClick={() => setShowRestore(!showRestore)} className="rounded-lg py-2 text-sm font-semibold ring-1 ring-stone-200">
          📥 백업 코드로 복원
        </button>
        <button
          onClick={() => downloadJson(`습관체크-백업-${todayKey()}.json`, state)}
          className="rounded-lg py-2 text-sm font-semibold ring-1 ring-stone-200"
        >
          💾 백업 파일 받기
        </button>
        <button onClick={() => fileRef.current?.click()} className="rounded-lg py-2 text-sm font-semibold ring-1 ring-stone-200">
          📂 백업 파일로 복원
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            try {
              await restore(await readJsonFile(file));
            } catch {
              setNotice("⚠️ 백업 파일을 읽을 수 없어요.");
            }
          }}
        />
      </div>
      {showRestore && (
        <div className="mt-3">
          <textarea
            id="restore-code"
            className={`${input} h-24 font-mono text-xs`}
            placeholder="복사해 둔 백업 코드를 붙여 넣으세요"
            value={restoreText}
            onChange={(e) => setRestoreText(e.target.value)}
          />
          <button
            disabled={!restoreText.trim()}
            onClick={() => {
              try {
                restore(JSON.parse(restoreText));
              } catch {
                restore(null);
              }
            }}
            className="mt-2 w-full rounded-lg bg-stone-800 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            이 코드로 복원
          </button>
        </div>
      )}
      {notice && <p className="mt-3 text-sm text-stone-600">{notice}</p>}
      <button
        onClick={async () =>
          (await ask("모든 아이·항목·기록을 지우고 처음 상태로 돌릴까요?\n되돌릴 수 없어요.", { danger: true })) &&
          setState(createDefaultState())
        }
        className="mt-3 text-sm text-red-600 underline"
      >
        전체 초기화
      </button>
    </Card>
  );
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className="rounded-md p-1 text-stone-500 hover:bg-stone-100">
      {children}
    </button>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-semibold ${on ? "bg-stone-800 text-white" : "bg-white ring-1 ring-stone-200"}`}
    >
      {children}
    </button>
  );
}
