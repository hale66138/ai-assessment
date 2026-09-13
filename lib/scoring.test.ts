import { describe, expect, it } from "vitest";
import { cronbachAlpha as psychometricCronbachAlpha } from "psychometric";
import {
  computeDimensionScores,
  cronbachAlpha,
  DIMENSIONS,
  reverseScore,
  scoreItem,
} from "@/lib/scoring";
import { QUESTIONS } from "@/lib/questions";

function allAnswers(value: number): Record<string, number> {
  const answers: Record<string, number> = {};
  for (const q of QUESTIONS) answers[q.id] = value;
  return answers;
}

describe("reverseScore", () => {
  it("1→5, 2→4, 3→3, 4→2, 5→1", () => {
    expect(reverseScore(1)).toBe(5);
    expect(reverseScore(2)).toBe(4);
    expect(reverseScore(3)).toBe(3);
    expect(reverseScore(4)).toBe(2);
    expect(reverseScore(5)).toBe(1);
  });
});

describe("scoreItem", () => {
  it("反向题返回 6-value，正向题原样返回", () => {
    expect(scoreItem({ reverse: false }, 4)).toBe(4);
    expect(scoreItem({ reverse: true }, 4)).toBe(2);
  });
});

describe("computeDimensionScores", () => {
  it("全选 3 时所有维度分 = 3", () => {
    const scores = computeDimensionScores(allAnswers(3));
    for (const dim of DIMENSIONS) {
      expect(scores[dim]).toBeCloseTo(3, 10);
    }
  });

  it("全选 5 时含反向题的维度分 < 5", () => {
    const scores = computeDimensionScores(allAnswers(5));
    for (const dim of DIMENSIONS) {
      if (dim === "AI_POS") continue;
      expect(scores[dim]).toBeLessThan(5);
    }
    expect(scores.AI_POS).toBeCloseTo(5, 10);
  });

  it("缺失答案时只计算已答题目", () => {
    // 只答 E 维度 2 道正向题，各 = 4；均值应按 2 题算 = 4，而非按 8 题算 = 1
    const eItems = QUESTIONS.filter((q) => q.dimension === "E" && !q.reverse).slice(0, 2);
    const answers: Record<string, number> = {};
    for (const q of eItems) answers[q.id] = 4;
    expect(computeDimensionScores(answers).E).toBeCloseTo(4, 10);
  });

  it("手算：2 正向 + 2 反向全选 5 → (5+5+1+1)/4 = 3", () => {
    // O 维度：BFI_05、BFI_10 正向，BFI_35、BFI_41 反向
    const answers = { BFI_05: 5, BFI_10: 5, BFI_35: 5, BFI_41: 5 };
    expect(computeDimensionScores(answers).O).toBeCloseTo(3, 10);
  });
});

describe("cronbachAlpha", () => {
  it("与 psychometric 包输出一致", () => {
    const matrix = [
      [3, 4, 5, 4],
      [2, 3, 4, 3],
      [4, 4, 5, 5],
      [1, 2, 2, 3],
      [3, 3, 4, 4],
    ];
    expect(cronbachAlpha(matrix)).toBe(psychometricCronbachAlpha(matrix));
  });
});
