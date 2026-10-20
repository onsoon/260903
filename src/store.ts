import { useEffect, useState } from "react";
import { AppState, createDefaultState } from "./data";

const STORAGE_KEY = "habit-checklist:v1";

export const isAppState = (v: unknown): v is AppState => {
  const s = v as AppState;
  return !!s && s.version === 1 && Array.isArray(s.children) && Array.isArray(s.items) && typeof s.checks === "object";
};

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isAppState(parsed)) return parsed;
    }
  } catch {
    // 저장소를 쓸 수 없으면 기본값으로 시작
  }
  return createDefaultState();
}

export function useAppState() {
  const [state, setState] = useState<AppState>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // 사생활 보호 모드 등에서는 저장하지 못할 수 있음
    }
  }, [state]);

  return [state, setState] as const;
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function readJsonFile(file: File): Promise<unknown> {
  return file.text().then((text) => JSON.parse(text));
}
