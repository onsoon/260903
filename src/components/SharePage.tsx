import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import { ArrowLeft, Copy, Download, Upload } from "lucide-react";
import { AppState, STAGES, TEMPLATES, Template, itemsFromTemplate } from "../data";
import { daysLabel, parseTemplate, templateFromChild, templateFromHash, templateToLink } from "../logic";
import { downloadJson, readJsonFile } from "../store";

type Props = {
  state: AppState;
  setState: Dispatch<SetStateAction<AppState>>;
  incoming: Template | null;
  onBack: () => void;
};

export default function SharePage({ state, setState, incoming, onBack }: Props) {
  const [preview, setPreview] = useState<Template | null>(incoming);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white text-stone-800">
      <div className="mx-auto max-w-2xl px-4 pb-20 pt-4">
        <header className="flex items-center gap-3">
          <button onClick={onBack} className="rounded-full bg-white p-2 shadow-sm" aria-label="처음으로">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold">🌐 체크리스트 나눔</h1>
            <p className="text-sm text-stone-500">다른 집 체크리스트를 담아 오고, 우리 집 것을 나눠요</p>
          </div>
        </header>

        {preview && (
          <TemplatePreview
            tpl={preview}
            state={state}
            setState={setState}
            highlight={preview === incoming}
            onClose={() => setPreview(null)}
          />
        )}

        <h2 className="mt-6 font-bold">추천 템플릿</h2>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.title}
              onClick={() => {
                setPreview(t);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-stone-100 hover:ring-sky-300"
            >
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700">{t.targetGrade}</span>
              <div className="mt-2 font-bold">{t.title}</div>
              <div className="mt-1 text-sm text-stone-500">{t.description}</div>
              <div className="mt-2 text-lg">{t.items.slice(0, 7).map((it) => it.emoji).join(" ")}</div>
            </button>
          ))}
        </div>

        <ShareMine state={state} />
        <ImportBox onLoad={setPreview} />

        <p className="mt-8 text-center text-xs text-stone-400">
          공유 링크·파일에는 체크 항목만 담겨요. 아이 별명이나 체크 기록은 포함되지 않아요.
        </p>
      </div>
    </div>
  );
}

function TemplatePreview({
  tpl,
  state,
  setState,
  highlight,
  onClose,
}: {
  tpl: Template;
  state: AppState;
  setState: Dispatch<SetStateAction<AppState>>;
  highlight: boolean;
  onClose: () => void;
}) {
  const [childId, setChildId] = useState(state.children[0]?.id);
  const [done, setDone] = useState(false);
  const child = state.children.find((c) => c.id === childId);

  const apply = (replace: boolean) => {
    if (!child) return;
    if (replace && !confirm(`${child.nickname}의 현재 항목을 모두 이 템플릿으로 바꿀까요? (체크 기록은 남아요)`)) return;
    setState((s) => ({
      ...s,
      items: [...(replace ? s.items.filter((it) => it.childId !== child.id) : s.items), ...itemsFromTemplate(tpl, child.id)],
    }));
    setDone(true);
  };

  return (
    <section className={`mt-5 rounded-2xl bg-white p-5 shadow-sm ${highlight ? "ring-2 ring-sky-400" : "ring-1 ring-stone-100"}`}>
      {highlight && <div className="mb-2 text-sm font-semibold text-sky-600">📨 공유받은 체크리스트예요</div>}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold">{tpl.title}</h2>
          <p className="text-sm text-stone-500">
            {tpl.targetGrade}
            {tpl.author && ` · ${tpl.author} 님`}
            {tpl.description && ` · ${tpl.description}`}
          </p>
        </div>
        <button onClick={onClose} className="text-sm text-stone-400">
          닫기
        </button>
      </div>
      <ul className="mt-3 space-y-1">
        {tpl.items.map((it, i) => (
          <li key={i} className="flex items-center gap-2 rounded-lg bg-stone-50 px-3 py-2 text-sm">
            <span className="text-lg">{it.emoji}</span>
            <div className="flex-1">
              <div>{it.title}</div>
              <div className="text-xs text-stone-400">
                {it.category} · {it.stage}단계({STAGES[it.stage].name}) · {daysLabel(it.days)}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {done ? (
        <p className="mt-4 rounded-xl bg-lime-50 p-3 text-center font-semibold text-lime-700">
          ✅ {child?.nickname}의 체크리스트에 담았어요! 부모 모드에서 다듬을 수 있어요.
        </p>
      ) : (
        <div className="mt-4">
          <div className="text-sm font-semibold">누구에게 담을까요?</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {state.children.map((c) => (
              <button
                key={c.id}
                onClick={() => setChildId(c.id)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  c.id === childId ? "bg-sky-600 text-white" : "ring-1 ring-stone-200"
                }`}
              >
                {c.avatar} {c.nickname}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => apply(false)} className="flex-1 rounded-xl py-2.5 text-sm font-semibold ring-1 ring-stone-200">
              지금 항목에 추가
            </button>
            <button onClick={() => apply(true)} className="flex-1 rounded-xl bg-sky-600 py-2.5 text-sm font-semibold text-white">
              통째로 바꾸기
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function ShareMine({ state }: { state: AppState }) {
  const [childId, setChildId] = useState(state.children[0]?.id);
  const child = state.children.find((c) => c.id === childId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [copied, setCopied] = useState(false);

  if (!child) return null;
  const tpl = templateFromChild(state, child, {
    title: title.trim() || `${child.grade || "우리 아이"} 습관 체크리스트`,
    description: description.trim(),
    author: author.trim() || undefined,
  });
  const link = templateToLink(tpl);
  const field = "w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-sky-500";

  return (
    <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-100">
      <h2 className="font-bold">우리 집 체크리스트 나누기</h2>
      <p className="mt-1 text-sm text-stone-500">링크를 카톡·문자로 보내면, 받은 사람이 열어서 바로 담을 수 있어요.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {state.children.map((c) => (
          <button
            key={c.id}
            onClick={() => setChildId(c.id)}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
              c.id === childId ? "bg-sky-600 text-white" : "ring-1 ring-stone-200"
            }`}
          >
            {c.avatar} {c.nickname}의 항목
          </button>
        ))}
      </div>
      <div className="mt-3 space-y-2">
        <input className={field} placeholder={tpl.title} value={title} onChange={(e) => setTitle(e.target.value)} />
        <input
          className={field}
          placeholder="한 줄 소개 (예: 4주 써 보니 아침이 편해졌어요)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input className={field} placeholder="작성자 닉네임 (선택)" value={author} onChange={(e) => setAuthor(e.target.value)} />
      </div>
      <p className="mt-2 text-xs text-stone-400">숨긴 항목은 빼고 {tpl.items.length}개 항목이 공유돼요.</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          disabled={tpl.items.length === 0}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(link);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              prompt("아래 링크를 복사하세요", link);
            }
          }}
          className="flex items-center justify-center gap-1 rounded-xl bg-sky-600 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
        >
          <Copy size={16} /> {copied ? "복사했어요!" : "공유 링크 복사"}
        </button>
        <button
          disabled={tpl.items.length === 0}
          onClick={() => downloadJson(`${tpl.title}.json`, tpl)}
          className="flex items-center justify-center gap-1 rounded-xl py-2.5 text-sm font-semibold ring-1 ring-stone-200 disabled:opacity-40"
        >
          <Download size={16} /> 파일로 받기
        </button>
      </div>
    </section>
  );
}

function ImportBox({ onLoad }: { onLoad: (t: Template) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const loadLink = () => {
    const link = text.trim();
    const tpl = templateFromHash(link.slice(link.indexOf("#")));
    if (tpl) {
      onLoad(tpl);
      setText("");
      setError("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else setError("올바른 공유 링크가 아니에요.");
  };

  return (
    <section className="mt-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-100">
      <h2 className="font-bold">공유받은 체크리스트 열기</h2>
      <div className="mt-3 flex gap-2">
        <input
          className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-sky-500"
          placeholder="공유 링크 붙여넣기"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && loadLink()}
        />
        <button onClick={loadLink} className="shrink-0 rounded-lg bg-stone-800 px-4 text-sm font-semibold text-white">
          열기
        </button>
      </div>
      <button
        onClick={() => fileRef.current?.click()}
        className="mt-2 flex items-center gap-1 text-sm text-stone-600 underline"
      >
        <Upload size={14} /> 파일에서 불러오기
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
            const tpl = parseTemplate(await readJsonFile(file));
            if (!tpl) throw new Error();
            onLoad(tpl);
            setError("");
            window.scrollTo({ top: 0, behavior: "smooth" });
          } catch {
            setError("체크리스트 파일을 읽을 수 없어요.");
          }
        }}
      />
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </section>
  );
}
