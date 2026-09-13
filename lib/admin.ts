import { QUESTIONS } from "@/lib/questions";
import { DIMENSIONS, cronbachAlpha, scoreItem } from "@/lib/scoring";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { Dimension } from "@/lib/supabase";

export interface QuestionStat {
  n: number;
  mean: number | null;
  counts: number[]; // 长度 5，索引 0..4 对应选项 1..5
}

export interface AdminStats {
  completedCount: number;
  dimensionAverages: Record<Dimension, number | null>;
  questionStats: Record<string, QuestionStat>;
  cronbachAlphas: Record<Dimension, number | null>;
}

// 管理端聚合统计：service_role 绕过 RLS，读取所有匿名数据
export async function getAdminStats(): Promise<AdminStats> {
  const admin = getSupabaseAdmin();

  // 1. 完成人数
  const { count: completedCount, error: countError } = await admin
    .from("participants")
    .select("id", { count: "exact", head: true });
  if (countError) throw countError;
  const n = completedCount ?? 0;

  // 2. 维度均分
  const { data: dimRows, error: dimError } = await admin
    .from("dimension_scores")
    .select("dimension, score");
  if (dimError) throw dimError;

  // 3. 每题作答（同时用于分布统计与 Cronbach α 的矩阵）
  const { data: answerRows, error: answerError } = await admin
    .from("answers")
    .select("participant_id, question_id, value");
  if (answerError) throw answerError;

  // 维度均分聚合
  const dimAgg: Record<string, { sum: number; count: number }> = {};
  for (const row of dimRows ?? []) {
    const dim = row.dimension;
    const score = Number(row.score);
    if (!Number.isFinite(score)) continue;
    if (!dimAgg[dim]) dimAgg[dim] = { sum: 0, count: 0 };
    dimAgg[dim].sum += score;
    dimAgg[dim].count += 1;
  }
  const dimensionAverages = {} as Record<Dimension, number | null>;
  for (const dim of DIMENSIONS) {
    const agg = dimAgg[dim];
    dimensionAverages[dim] = agg && agg.count > 0 ? agg.sum / agg.count : null;
  }

  // 每题分布 + 按参与者分组
  const qAgg: Record<string, { n: number; sum: number; counts: number[] }> = {};
  const byParticipant = new Map<string, Map<string, number>>();
  for (const row of answerRows ?? []) {
    const value = Number(row.value);
    if (!Number.isInteger(value) || value < 1 || value > 5) continue;

    const qid = row.question_id;
    if (!qAgg[qid]) qAgg[qid] = { n: 0, sum: 0, counts: [0, 0, 0, 0, 0] };
    qAgg[qid].n += 1;
    qAgg[qid].sum += value;
    qAgg[qid].counts[value - 1] += 1;

    let qmap = byParticipant.get(row.participant_id);
    if (!qmap) {
      qmap = new Map();
      byParticipant.set(row.participant_id, qmap);
    }
    qmap.set(qid, value);
  }

  const questionStats: Record<string, QuestionStat> = {};
  for (const q of QUESTIONS) {
    const agg = qAgg[q.id];
    questionStats[q.id] = agg
      ? { n: agg.n, mean: agg.sum / agg.n, counts: agg.counts }
      : { n: 0, mean: null, counts: [0, 0, 0, 0, 0] };
  }

  // Cronbach α：每个维度各算一个，矩阵行=参与者、列=该维度题目（反向题已对齐方向）
  const participants = [...byParticipant.keys()];
  const cronbachAlphas = {} as Record<Dimension, number | null>;
  for (const dim of DIMENSIONS) {
    const items = QUESTIONS.filter((q) => q.dimension === dim);
    // 样本量 < 10 或题目数 < 3 时 α 不稳定，直接置空不计算
    if (n < 10 || items.length < 3) {
      cronbachAlphas[dim] = null;
      continue;
    }
    const matrix: number[][] = [];
    for (const pid of participants) {
      const qmap = byParticipant.get(pid)!;
      const row = items.map((q) => {
        const raw = qmap.get(q.id);
        return raw === undefined ? Number.NaN : scoreItem(q, raw);
      });
      if (row.every((v) => Number.isFinite(v))) matrix.push(row);
    }
    if (matrix.length < 2) {
      cronbachAlphas[dim] = null;
      continue;
    }
    const alpha = cronbachAlpha(matrix);
    cronbachAlphas[dim] = Number.isFinite(alpha) ? alpha : null;
  }

  return { completedCount: n, dimensionAverages, questionStats, cronbachAlphas };
}
