import { cronbachAlpha as psychometricCronbachAlpha } from "psychometric";
import { QUESTIONS, type Question } from "@/lib/questions";
import type { Dimension } from "@/lib/supabase";

// 7 个计分维度（与 dimension_scores 表的 CHECK 约束一致）
export const DIMENSIONS: readonly Dimension[] = [
  "O",
  "C",
  "E",
  "A",
  "N",
  "AI_POS",
  "AI_NEG",
];

// 反向计分：5 点 Likert 上 6 - value
export function reverseScore(value: number): number {
  return 6 - value;
}

// 单题计分：反向题先反向，正向题原样返回
export function scoreItem(q: Pick<Question, "reverse">, raw: number): number {
  return q.reverse ? reverseScore(raw) : raw;
}

// 各维度均值：只统计已作答的题目；某维度一题未答时该维度为 NaN
export function computeDimensionScores(
  answers: Record<string, number>,
): Record<Dimension, number> {
  const scores = {} as Record<Dimension, number>;
  for (const dim of DIMENSIONS) {
    const values = QUESTIONS.filter((q) => q.dimension === dim)
      .filter((q) => answers[q.id] !== undefined)
      .map((q) => scoreItem(q, answers[q.id]));
    scores[dim] = values.length > 0 ? mean(values) : Number.NaN;
  }
  return scores;
}

// 适配 psychometric 的 cronbachAlpha：输入 subjects×items 矩阵（行=被试，列=题目）。
// 注意：本函数只透传矩阵，不做反向题方向对齐——反向题须由调用方先经 scoreItem()
// 对齐后再拼入矩阵（见 lib/admin.ts 的 getAdminStats）。
export function cronbachAlpha(matrix: number[][]): number {
  return psychometricCronbachAlpha(matrix);
}

function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}
