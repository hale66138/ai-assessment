import type { Dimension } from "@/lib/supabase";

export interface DimensionMeta {
  label: string;
  description: string;
}

// 每个维度的展示名 + 一句话说明（只描述该维度在测什么，不做个人推断）
export const DIMENSION_META: Record<Dimension, DimensionMeta> = {
  O: { label: "开放性", description: "对新经验、想法与审美的开放程度" },
  C: { label: "尽责性", description: "自律、有条理、目标导向的程度" },
  E: { label: "外向性", description: "健谈、精力充沛与社交活跃的程度" },
  A: { label: "宜人性", description: "合作、信任与体谅他人的程度" },
  N: { label: "神经质", description: "情绪起伏、容易紧张的倾向" },
  AI_POS: { label: "AI 积极态度", description: "对人工智能持积极、乐观评价的程度" },
  AI_NEG: { label: "AI 负面担忧", description: "对人工智能感到担忧、害怕的程度" },
};

export type RelativeLevel = "偏低" | "接近中间" | "偏高";

// 只描述相对位置：1–5 量尺上 <2.5 偏低，2.5–3.5 接近中间，>3.5 偏高
export function relativeLevel(score: number): RelativeLevel {
  if (score < 2.5) return "偏低";
  if (score > 3.5) return "偏高";
  return "接近中间";
}

// 每个维度 × 相对水平的第二句解释（中性描述，无价值判断、无临床推断）。
// 组件里拼成「你的分数{level}，表示{explainDimension(d, level)}」。
const DIMENSION_EXPLANATIONS: Record<Dimension, Record<RelativeLevel, string>> = {
  O: {
    偏高: "你更愿意接纳新经验、新想法，对抽象与审美内容较开放。",
    接近中间: "你在探索新事物与保持熟悉之间比较平衡。",
    偏低: "你更偏好熟悉、务实的事物，对新奇或抽象体验的开放度较低。",
  },
  C: {
    偏高: "你更倾向于自律、有条理、按计划行事。",
    接近中间: "你在计划安排与随性灵活之间比较平衡。",
    偏低: "你更倾向于随性、灵活，较少依赖严格计划。",
  },
  E: {
    偏高: "你更倾向于健谈、活跃、喜欢社交。",
    接近中间: "你在独处与社交之间比较平衡。",
    偏低: "你更倾向于安静、内敛，偏好独处或小范围交往。",
  },
  A: {
    偏高: "你更倾向于合作、信任并体谅他人。",
    接近中间: "你在照顾他人与坚持己见之间比较平衡。",
    偏低: "你更倾向于直接、独立，也更愿意直接表达不同意见。",
  },
  N: {
    偏高: "你更容易体验到紧张、忧虑等情绪起伏。",
    接近中间: "你的情绪起伏处于中等水平。",
    偏低: "你较少感到紧张、忧虑，情绪相对稳定。",
  },
  AI_POS: {
    偏高: "你对人工智能持较为积极、乐观的评价。",
    接近中间: "你对人工智能的评价较为中性或混合。",
    偏低: "你对人工智能的积极评价较少。",
  },
  AI_NEG: {
    偏高: "你对人工智能的担忧、害怕程度较低，态度相对积极。（本维度已反向计分，高分代表对 AI 的担忧较低）",
    接近中间: "你对人工智能的担忧程度处于中等水平。",
    偏低: "你对人工智能的担忧、害怕程度较高，态度相对谨慎。",
  },
};

export function explainDimension(dim: Dimension, level: RelativeLevel): string {
  return DIMENSION_EXPLANATIONS[dim][level];
}

export function formatScore(score: number): string {
  return score.toFixed(1);
}
