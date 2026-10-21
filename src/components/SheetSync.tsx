import { useState, type ReactNode } from "react";
import { ArrowLeft, Cloud, CloudOff, Copy, ExternalLink, RefreshCw } from "lucide-react";
import scriptCode from "../../apps-script/Code.gs?raw";
import { SyncController, SyncStatus } from "../sync";
import { ask } from "./Confirm";

const ago = (t?: number) => {
  if (!t) return "";
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 60) return "방금";
  if (s < 3600) return `${Math.floor(s / 60)}분 전`;
  return `${Math.floor(s / 3600)}시간 전`;
};

// 첫 화면에 보이는 작은 동기화 상태 표시
export function SyncBadge({ status, onRetry }: { status: SyncStatus; onRetry: () => void }) {
  if (!status.connected) return null;
  const error = status.state === "error";
  return (
    <button
      onClick={onRetry}
      title={status.error}
      className={`mx-auto mt-3 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        error ? "bg-red-50 text-red-600 ring-1 ring-red-200" : "bg-white text-stone-500 ring-1 ring-stone-200"
      }`}
    >
      {error ? <CloudOff size={14} /> : <Cloud size={14} className={status.state === "syncing" ? "animate-pulse" : ""} />}
      {error
        ? `시트 연결 오류 · 기기에 먼저 저장 중${status.pending ? ` (${status.pending}건)` : ""}`
        : status.state === "syncing"
          ? "구글 시트에 저장 중…"
          : status.pending
            ? `저장 대기 ${status.pending}건`
            : `구글 시트와 연결됨${status.lastSyncAt ? ` · ${ago(status.lastSyncAt)} 맞춤` : ""}`}
    </button>
  );
}

const input = "w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500";

// 부모 모드 안의 '구글 시트 연결' 카드
export function SheetCard({ sync, onGuide }: { sync: SyncController; onGuide: () => void }) {
  const [url, setUrl] = useState(sync.settings?.url ?? "");
  const [key, setKey] = useState(sync.settings?.key ?? "");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const { status } = sync;

  const connect = async () => {
    const conn = { url: url.trim(), key: key.trim() };
    if (!/^https:\/\/script\.google(usercontent)?\.com\//.test(conn.url)) {
      setNotice("⚠️ 웹 앱 주소는 https://script.google.com/macros/s/… 로 시작해요.");
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      const probe = await sync.peek(conn);
      if (probe.config && !(await ask("시트에 이미 기록이 있어요.\n이 기기의 항목과 기록을 시트 내용으로 맞출까요?"))) return;
      const result = await sync.connect(conn);
      setNotice(
        result === "uploaded"
          ? "✅ 연결했어요. 이 기기의 항목과 기록을 시트로 올리고 있어요."
          : "✅ 연결했어요. 시트의 항목과 기록을 가져왔어요.",
      );
    } catch (e) {
      setNotice(`⚠️ ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-100">
      <h2 className="flex items-center gap-2 font-bold">
        <Cloud size={18} /> 구글 시트 연결
      </h2>
      <p className="mt-1 text-sm text-stone-500">
        아이 기기와 부모님 폰이 같은 구글 시트에 기록해서 함께 볼 수 있어요. 기록은 우리 집 구글 드라이브에만 저장돼요.
      </p>

      {status.connected ? (
        <div className="mt-3">
          <div
            className={`rounded-xl p-3 text-sm ${
              status.state === "error" ? "bg-red-50 text-red-700" : "bg-lime-50 text-lime-800"
            }`}
          >
            {status.state === "error" ? (
              <>⚠️ {status.error} 체크한 내용은 기기에 저장해 두었다가 연결되면 보내요.</>
            ) : (
              <>
                ✅ 연결됨{status.lastSyncAt && ` · ${ago(status.lastSyncAt)} 맞춤`}
                {status.pending > 0 && ` · 보낼 기록 ${status.pending}건`}
              </>
            )}
          </div>
          <p className="mt-2 break-all text-xs text-stone-400">{sync.settings?.url}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={sync.sync}
              className="flex items-center justify-center gap-1 rounded-lg py-2 text-sm font-semibold ring-1 ring-stone-200"
            >
              <RefreshCw size={14} className={status.state === "syncing" ? "animate-spin" : ""} /> 지금 맞추기
            </button>
            <button
              onClick={async () =>
                (await ask("이 기기에서 시트 연결을 끊을까요?\n기록은 시트와 이 기기에 그대로 남아요.")) && sync.disconnect()
              }
              className="rounded-lg py-2 text-sm font-semibold text-red-600 ring-1 ring-red-200"
            >
              연결 끊기
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <button
            onClick={onGuide}
            className="w-full rounded-xl bg-amber-50 py-2.5 text-sm font-semibold text-amber-800 ring-1 ring-amber-200"
          >
            📖 처음이라면: 구글 시트 준비 방법 보기 (5분)
          </button>
          <input
            id="sheet-url"
            className={input}
            placeholder="웹 앱 주소 (https://script.google.com/macros/s/…/exec)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <input
            id="sheet-key"
            className={input}
            placeholder="가족 비밀키 (시트 '설정' 탭 B1 칸)"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
          <button
            onClick={connect}
            disabled={busy || !url.trim() || !key.trim()}
            className="w-full rounded-lg bg-stone-800 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            {busy ? "연결하는 중…" : "연결하기"}
          </button>
          <p className="text-xs text-stone-400">
            가족의 다른 기기에서도 같은 주소와 비밀키를 넣으면 함께 연동돼요.
          </p>
        </div>
      )}
      {notice && <p className="mt-3 text-sm text-stone-600">{notice}</p>}
    </section>
  );
}

// 구글 시트 준비 안내 페이지
export function SheetGuide({ onBack }: { onBack: () => void }) {
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(scriptCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setShowCode(true);
    }
  };

  const steps: { title: string; body: ReactNode }[] = [
    {
      title: "새 구글 시트 만들기",
      body: (
        <>
          부모님 구글 계정으로{" "}
          <a href="https://sheets.new" target="_blank" rel="noreferrer" className="font-semibold text-sky-700 underline">
            sheets.new <ExternalLink size={12} className="inline" />
          </a>
          를 열어 빈 시트를 만들고, 이름을 "우리집 습관 체크"로 바꿔요.
        </>
      ),
    },
    {
      title: "Apps Script 열고 코드 붙여 넣기",
      body: (
        <>
          시트 메뉴 <b>확장 프로그램 → Apps Script</b>를 눌러요. 처음 있던 코드를 모두 지우고, 아래 버튼으로 복사한 코드를
          붙여 넣은 뒤 💾 저장해요.
          <div className="mt-2 flex flex-wrap gap-2">
            <button onClick={copy} className="flex items-center gap-1 rounded-lg bg-stone-800 px-3 py-2 text-sm font-semibold text-white">
              <Copy size={14} /> {copied ? "복사했어요!" : "연결 코드 복사"}
            </button>
            <button onClick={() => setShowCode(!showCode)} className="rounded-lg px-3 py-2 text-sm ring-1 ring-stone-200">
              {showCode ? "코드 접기" : "코드 보기"}
            </button>
          </div>
          {showCode && (
            <textarea
              id="script-code"
              readOnly
              value={scriptCode}
              onFocus={(e) => e.target.select()}
              className="mt-2 h-56 w-full rounded-lg border border-stone-200 p-2 font-mono text-[11px] leading-snug"
            />
          )}
        </>
      ),
    },
    {
      title: "setup 실행하고 권한 허용",
      body: (
        <>
          위쪽 함수 선택 칸에서 <b>setup</b>을 고르고 <b>▶ 실행</b>을 눌러요. "권한 검토" 창이 뜨면 내 계정을 고르고{" "}
          <b>고급 → (안전하지 않음)으로 이동 → 허용</b>을 눌러요. 내가 만든 스크립트라서 나오는 안내예요. 시트에 <b>체크기록 · 항목 · 설정</b>{" "}
          탭이 생기면 성공이에요.
        </>
      ),
    },
    {
      title: "웹 앱으로 배포",
      body: (
        <>
          오른쪽 위 <b>배포 → 새 배포</b> → 톱니바퀴에서 <b>웹 앱</b>을 골라요. <b>다음 사용자 인증 정보로 실행: 나</b>,{" "}
          <b>액세스 권한이 있는 사용자: 모든 사용자</b>로 두고 배포해요. 나온 <b>웹 앱 URL</b>(…/exec로 끝나요)을 복사해요.
        </>
      ),
    },
    {
      title: "사이트에 연결",
      body: (
        <>
          부모 모드 → 구글 시트 연결에 <b>웹 앱 URL</b>과 시트 <b>설정 탭 B1 칸의 가족 비밀키</b>를 넣고 연결해요. 아이 기기와 부모님
          폰에서 각각 한 번씩 연결하면 끝이에요.
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      <div className="mx-auto max-w-2xl px-4 pb-20 pt-4">
        <header className="flex items-center gap-3">
          <button onClick={onBack} className="rounded-full bg-white p-2 shadow-sm" aria-label="돌아가기">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold">구글 시트 준비하기</h1>
            <p className="text-sm text-stone-500">컴퓨터에서 하면 편해요 · 약 5분</p>
          </div>
        </header>

        <ol className="mt-5 space-y-3">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-100">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-white">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold">{s.title}</h2>
                <div className="mt-1 text-sm leading-relaxed text-stone-600">{s.body}</div>
              </div>
            </li>
          ))}
        </ol>

        <section className="mt-5 rounded-2xl bg-white p-4 text-sm text-stone-600 shadow-sm ring-1 ring-stone-100">
          <h2 className="font-bold text-stone-800">알아 두세요</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <b>체크기록</b> 탭에서 날짜별로 누가 무엇을 했는지 볼 수 있어요. 시트에서 직접 고치기보다 사이트에서 체크해 주세요.
            </li>
            <li>가족 비밀키를 바꾸고 싶으면 설정 탭 B1 칸을 고친 뒤, 기기마다 다시 연결하면 돼요.</li>
            <li>웹 앱 주소와 비밀키는 가족끼리만 알고 계세요. 다른 가정에는 '체크리스트 나눔'의 공유 코드를 보내 주세요.</li>
            <li>코드를 고쳐 다시 배포할 때는 '배포 관리 → 수정 → 새 버전'으로 하면 주소가 바뀌지 않아요.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
