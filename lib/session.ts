// 客户端会话存储：跨页面传递参与者 ID、作答与计分结果（不落数据库）。
// 仅在浏览器中调用；SSR 环境下安全返回 null，避免服务端访问 sessionStorage 报错。

const PARTICIPANT_KEY = "participantId";
const ANSWERS_KEY = "answers";
const SCORES_KEY = "scores";

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}

export function setParticipantId(id: string): void {
  storage()?.setItem(PARTICIPANT_KEY, id);
}

export function getParticipantId(): string | null {
  return storage()?.getItem(PARTICIPANT_KEY) ?? null;
}

// 作答：questionId -> 分值(1-5)
export function setAnswers(answers: Record<string, number>): void {
  storage()?.setItem(ANSWERS_KEY, JSON.stringify(answers));
}

export function getAnswers<T = Record<string, number>>(): T | null {
  const raw = storage()?.getItem(ANSWERS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// 计分结果的具体结构（维度 → 分数）待第 4 步 lib/scoring.ts 定义后，再收紧此处的类型。
export function setScores(scores: unknown): void {
  storage()?.setItem(SCORES_KEY, JSON.stringify(scores));
}

export function getScores<T = unknown>(): T | null {
  const raw = storage()?.getItem(SCORES_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function clearAll(): void {
  storage()?.removeItem(PARTICIPANT_KEY);
  storage()?.removeItem(ANSWERS_KEY);
  storage()?.removeItem(SCORES_KEY);
}
