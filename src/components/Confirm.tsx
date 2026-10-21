import { useEffect, useState } from "react";

// 브라우저 기본 confirm() 대신 쓰는 화면 안 확인 창 (임베드된 화면에서는 confirm()이 막혀 있음)
type Request = { message: string; danger: boolean; resolve: (ok: boolean) => void };

let show: ((r: Request) => void) | null = null;

export function ask(message: string, { danger = false } = {}): Promise<boolean> {
  return new Promise((resolve) => (show ? show({ message, danger, resolve }) : resolve(false)));
}

export function ConfirmHost() {
  const [req, setReq] = useState<Request | null>(null);

  useEffect(() => {
    show = setReq;
    return () => {
      show = null;
    };
  }, []);

  if (!req) return null;
  const close = (ok: boolean) => {
    req.resolve(ok);
    setReq(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6" onClick={() => close(false)}>
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-2xl bg-white p-6 text-stone-800 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="whitespace-pre-line font-medium">{req.message}</p>
        <div className="mt-5 flex gap-2">
          <button onClick={() => close(false)} className="flex-1 rounded-xl py-2.5 font-semibold ring-1 ring-stone-200">
            취소
          </button>
          <button
            autoFocus
            onClick={() => close(true)}
            className={`flex-1 rounded-xl py-2.5 font-semibold text-white ${req.danger ? "bg-red-500" : "bg-stone-800"}`}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
