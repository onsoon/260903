import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { AppState, Checks } from "./data";

// 구글 시트(Apps Script 웹 앱)와 체크 기록·설정을 주고받는다.
// 화면은 바로 바뀌고, 바뀐 내용은 기기에 먼저 쌓았다가 시트로 보낸다.

export type SyncSettings = { url: string; key: string };

type Op = { date: string; childId: string; itemId: string; done: boolean; ts: number; child: string; item: string };
type Meta = { configUpdatedAt: number; configDirty: boolean };
type Config = Pick<AppState, "children" | "items" | "pin">;
type Reply = { ok: boolean; error?: string; config: Config | null; configUpdatedAt: number; checks: [string, string, string][] };

export type SyncStatus = {
  connected: boolean;
  state: "idle" | "syncing" | "ok" | "error";
  error?: string;
  lastSyncAt?: number;
  pending: number;
};

const SETTINGS_KEY = "habit-checklist:sync";
const PENDING_KEY = "habit-checklist:pending";
const META_KEY = "habit-checklist:sync-meta";

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key: string, value: unknown) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장할 수 없는 환경이면 메모리로만 동작
  }
};

const ERRORS: Record<string, string> = {
  wrong_key: "가족 비밀키가 시트의 '설정' 탭 B1 칸과 달라요.",
  not_setup: "시트에서 setup 함수를 먼저 실행해 주세요.",
  bad_request: "요청을 읽지 못했어요.",
};

async function call(settings: SyncSettings, body: object): Promise<Reply> {
  let res: Response;
  try {
    // text/plain 으로 보내야 Apps Script가 추가 확인 요청 없이 받아 준다
    res = await fetch(settings.url, { method: "POST", body: JSON.stringify({ ...body, key: settings.key }) });
  } catch {
    throw new Error("시트에 연결하지 못했어요. 인터넷 연결과 웹 앱 주소를 확인해 주세요.");
  }
  let data: Reply;
  try {
    data = await res.json();
  } catch {
    throw new Error("웹 앱 주소가 맞는지, 액세스 권한이 '모든 사용자'로 배포됐는지 확인해 주세요.");
  }
  if (!data.ok) throw new Error(ERRORS[data.error ?? ""] ?? `시트 오류: ${data.error}`);
  return data;
}

const configOf = (s: AppState): Config => ({ children: s.children, items: s.items, pin: s.pin });
const opKey = (o: Pick<Op, "date" | "childId" | "itemId">) => `${o.date}|${o.childId}|${o.itemId}`;

// 이전 상태와 비교해 바뀐 체크만 골라낸다
function diffChecks(prev: AppState, next: AppState): Op[] {
  if (prev.checks === next.checks) return [];
  const ops: Op[] = [];
  const ts = Date.now();
  const childName = (id: string) => next.children.find((c) => c.id === id)?.nickname ?? prev.children.find((c) => c.id === id)?.nickname ?? "";
  const itemName = (id: string) => next.items.find((i) => i.id === id)?.title ?? prev.items.find((i) => i.id === id)?.title ?? "";
  const childIds = new Set([...Object.keys(prev.checks), ...Object.keys(next.checks)]);
  for (const childId of childIds) {
    const a = prev.checks[childId] ?? {};
    const b = next.checks[childId] ?? {};
    if (a === b) continue;
    for (const date of new Set([...Object.keys(a), ...Object.keys(b)])) {
      const before = new Set(a[date] ?? []);
      const after = new Set(b[date] ?? []);
      for (const itemId of new Set([...before, ...after])) {
        if (before.has(itemId) !== after.has(itemId)) {
          ops.push({ date, childId, itemId, done: after.has(itemId), ts, child: childName(childId), item: itemName(itemId) });
        }
      }
    }
  }
  return ops;
}

function allChecksAsOps(s: AppState): Op[] {
  const empty: AppState = { ...s, checks: {} };
  return diffChecks(empty, s);
}

function checksFrom(rows: [string, string, string][], pending: Op[]): Checks {
  const sets: Record<string, Record<string, Set<string>>> = {};
  const get = (childId: string, date: string) => ((sets[childId] ??= {})[date] ??= new Set());
  for (const [date, childId, itemId] of rows) get(childId, date).add(itemId);
  // 아직 시트에 못 보낸 이 기기의 변경이 우선
  for (const op of pending) {
    const set = get(op.childId, op.date);
    if (op.done) set.add(op.itemId);
    else set.delete(op.itemId);
  }
  const checks: Checks = {};
  for (const [childId, dates] of Object.entries(sets)) {
    checks[childId] = {};
    for (const [date, set] of Object.entries(dates)) if (set.size) checks[childId][date] = [...set];
  }
  return checks;
}

// 화면 갱신이 필요 없는 경우를 걸러 내기 위한 비교 (순서 무관)
function sameChecks(a: Checks, b: Checks) {
  const norm = (c: Checks) =>
    JSON.stringify(
      Object.keys(c)
        .sort()
        .map((k) => [k, Object.keys(c[k]).filter((d) => c[k][d].length).sort().map((d) => [d, [...c[k][d]].sort()])]),
    );
  return norm(a) === norm(b);
}

export function useSync(state: AppState, setState: Dispatch<SetStateAction<AppState>>) {
  const [settings, setSettings] = useState<SyncSettings | null>(() => read(SETTINGS_KEY, null));
  const [status, setStatus] = useState<SyncStatus>(() => ({
    connected: !!read(SETTINGS_KEY, null),
    state: "idle",
    pending: read<Op[]>(PENDING_KEY, []).length,
  }));

  const pending = useRef<Op[]>(read(PENDING_KEY, []));
  const meta = useRef<Meta>(read(META_KEY, { configUpdatedAt: 0, configDirty: false }));
  const prev = useRef(state);
  const remote = useRef<AppState | null>(null);
  const running = useRef(false);
  const again = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const savePending = () => {
    write(PENDING_KEY, pending.current);
    write(META_KEY, meta.current);
    setStatus((s) => ({ ...s, pending: pending.current.length }));
  };

  const applyReply = useCallback(
    (reply: Reply) => {
      setState((s) => {
        let next = s;
        if (reply.config && reply.configUpdatedAt > meta.current.configUpdatedAt && !meta.current.configDirty) {
          next = { ...next, ...reply.config };
          meta.current.configUpdatedAt = reply.configUpdatedAt;
          write(META_KEY, meta.current);
        }
        const checks = checksFrom(reply.checks, pending.current);
        if (!sameChecks(checks, next.checks)) next = { ...next, checks };
        if (next !== s) remote.current = next;
        return next;
      });
    },
    [setState],
  );

  const sync = useCallback(async () => {
    const conn = settingsRef.current;
    if (!conn) return;
    if (running.current) {
      again.current = true;
      return;
    }
    running.current = true;
    setStatus((s) => ({ ...s, state: "syncing" }));
    try {
      const sent = pending.current.slice();
      const sendConfig = meta.current.configDirty;
      const reply = await call(conn, {
        action: "sync",
        checks: sent,
        ...(sendConfig ? { config: configOf(prev.current), configUpdatedAt: meta.current.configUpdatedAt } : {}),
      });
      const sentSet = new Set(sent);
      pending.current = pending.current.filter((op) => !sentSet.has(op));
      if (sendConfig && reply.configUpdatedAt >= meta.current.configUpdatedAt) meta.current.configDirty = false;
      savePending();
      applyReply(reply);
      setStatus((s) => ({ ...s, state: "ok", error: undefined, lastSyncAt: Date.now() }));
    } catch (e) {
      setStatus((s) => ({ ...s, state: "error", error: (e as Error).message }));
    } finally {
      running.current = false;
      if (again.current) {
        again.current = false;
        window.setTimeout(sync, 300);
      }
    }
  }, [applyReply]);

  // 화면에서 바뀐 내용을 보낼 목록에 쌓는다
  useEffect(() => {
    const before = prev.current;
    prev.current = state;
    if (state === remote.current || before === state) return;

    const ops = diffChecks(before, state);
    const configChanged = before.children !== state.children || before.items !== state.items || before.pin !== state.pin;
    if (!ops.length && !configChanged) return;

    if (ops.length) {
      const keys = new Set(ops.map(opKey));
      pending.current = [...pending.current.filter((o) => !keys.has(opKey(o))), ...ops];
    }
    if (configChanged) meta.current = { configUpdatedAt: Date.now(), configDirty: true };
    savePending();
    if (settingsRef.current) {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(sync, 800);
    }
  }, [state, sync]);

  // 연결돼 있으면 주기적으로, 화면에 돌아왔을 때, 인터넷이 다시 연결됐을 때 맞춘다
  useEffect(() => {
    if (!settings) return;
    sync();
    const id = window.setInterval(sync, 30_000);
    const onVisible = () => document.visibilityState === "visible" && sync();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", sync);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", sync);
    };
  }, [settings, sync]);

  // 처음 연결: 시트가 비어 있으면 이 기기 내용을 올리고, 시트에 내용이 있으면 시트 내용을 가져온다
  const connect = useCallback(
    async (conn: SyncSettings): Promise<"uploaded" | "downloaded"> => {
      const probe = await call(conn, { action: "sync", checks: [] });
      if (probe.config) {
        pending.current = [];
        meta.current = { configUpdatedAt: 0, configDirty: false };
        savePending();
        applyReply(probe);
      } else {
        pending.current = allChecksAsOps(prev.current);
        meta.current = { configUpdatedAt: Date.now(), configDirty: true };
        savePending();
      }
      write(SETTINGS_KEY, conn);
      setSettings(conn);
      setStatus((s) => ({ ...s, connected: true, state: "idle", error: undefined }));
      return probe.config ? "downloaded" : "uploaded";
    },
    [applyReply],
  );

  const disconnect = useCallback(() => {
    write(SETTINGS_KEY, null);
    setSettings(null);
    setStatus((s) => ({ ...s, connected: false, state: "idle", error: undefined }));
  }, []);

  return { settings, status, sync, connect, disconnect, peek: (conn: SyncSettings) => call(conn, { action: "sync", checks: [] }) };
}

export type SyncController = ReturnType<typeof useSync>;
