import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { QUESTIONS } from "@/lib/questions";
import { computeDimensionScores, DIMENSIONS } from "@/lib/scoring";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  // 1. 解析 JSON
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体不是合法的 JSON" }, { status: 400 });
  }

  const { participantId, answers } = (body ?? {}) as {
    participantId?: unknown;
    answers?: unknown;
  };

  // 2. 校验 participantId：合法 UUID
  if (typeof participantId !== "string" || !UUID_RE.test(participantId)) {
    return NextResponse.json(
      { error: "participantId 缺失或不是合法 UUID" },
      { status: 400 },
    );
  }

  // 3. 校验 answers：恰好 64 题、题号合法、取值 1–5 的整数
  if (typeof answers !== "object" || answers === null || Array.isArray(answers)) {
    return NextResponse.json({ error: "answers 必须是对象" }, { status: 400 });
  }
  const record = answers as Record<string, unknown>;
  const valuesValid = QUESTIONS.every((q) => {
    const v = record[q.id];
    return typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= 5;
  });
  if (Object.keys(record).length !== QUESTIONS.length || !valuesValid) {
    return NextResponse.json(
      { error: "answers 必须恰好包含全部 64 题，且每题为 1–5 的整数" },
      { status: 400 },
    );
  }
  const typed = record as Record<string, number>;

  // 4. 服务端计分（64 题齐备，不会出现 NaN）
  const scores = computeDimensionScores(typed);

  // 5. 用 anon 客户端写入（受 RLS「匿名只能 insert」约束）
  // 注意：Supabase JS 无跨表事务，若中途失败可能留下孤立的 participant 行；
  // 本步先按顺序写入，后续如需要可改用数据库函数保证原子性。
  try {
    const { error: participantError } = await supabase
      .from("participants")
      .insert({ id: participantId });
    if (participantError) throw participantError;

    const { error: answersError } = await supabase.from("answers").insert(
      QUESTIONS.map((q) => ({
        participant_id: participantId,
        question_id: q.id,
        value: typed[q.id],
      })),
    );
    if (answersError) throw answersError;

    const { error: scoresError } = await supabase.from("dimension_scores").insert(
      DIMENSIONS.map((dim) => ({
        participant_id: participantId,
        dimension: dim,
        score: scores[dim],
      })),
    );
    if (scoresError) throw scoresError;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "写入数据库失败" },
      { status: 500 },
    );
  }

  return NextResponse.json({ scores });
}
