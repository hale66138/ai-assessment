import type { Dimension } from "@/lib/supabase";

export type Scale = "BFI" | "GAAIS";

export interface Question {
  id: string;
  scale: Scale;
  dimension: Dimension;
  reverse: boolean; // true = 反向计分题（第 4 步计分时按 6 - value 处理）
  text: string;
}

export const LIKERT_LABELS = [
  "非常不同意",
  "不同意",
  "中立",
  "同意",
  "非常同意",
] as const;

export const QUESTIONS: Question[] = [
  // ===== BFI-44（大五人格）=====
  // 维度：O 开放性 / C 尽责性 / E 外向性 / A 宜人性 / N 神经质
  { id: "BFI_01", scale: "BFI", dimension: "E", reverse: false, text: "我健谈、爱说话。" },
  { id: "BFI_02", scale: "BFI", dimension: "A", reverse: true, text: "我倾向于挑别人的毛病。" },
  { id: "BFI_03", scale: "BFI", dimension: "C", reverse: false, text: "我做事情认真、彻底。" },
  { id: "BFI_04", scale: "BFI", dimension: "N", reverse: false, text: "我常常情绪低落、忧郁。" },
  { id: "BFI_05", scale: "BFI", dimension: "O", reverse: false, text: "我很有原创性，常想出新点子。" },
  { id: "BFI_06", scale: "BFI", dimension: "E", reverse: true, text: "我比较拘谨、内敛。" },
  { id: "BFI_07", scale: "BFI", dimension: "A", reverse: false, text: "我乐于助人、不自私。" },
  { id: "BFI_08", scale: "BFI", dimension: "C", reverse: true, text: "我有时会粗心大意。" },
  { id: "BFI_09", scale: "BFI", dimension: "N", reverse: true, text: "我心态放松，能很好地应对压力。" },
  { id: "BFI_10", scale: "BFI", dimension: "O", reverse: false, text: "我对许多不同的事物都充满好奇。" },
  { id: "BFI_11", scale: "BFI", dimension: "E", reverse: false, text: "我精力充沛。" },
  { id: "BFI_12", scale: "BFI", dimension: "A", reverse: true, text: "我会和别人起争执。" },
  { id: "BFI_13", scale: "BFI", dimension: "C", reverse: false, text: "我是一个可靠的人，做事让人放心。" },
  { id: "BFI_14", scale: "BFI", dimension: "N", reverse: false, text: "我容易紧张。" },
  { id: "BFI_15", scale: "BFI", dimension: "O", reverse: false, text: "我思维敏捷，喜欢深入思考。" },
  { id: "BFI_16", scale: "BFI", dimension: "E", reverse: false, text: "我充满热情，能带动气氛。" },
  { id: "BFI_17", scale: "BFI", dimension: "A", reverse: false, text: "我天性宽容，容易原谅别人。" },
  { id: "BFI_18", scale: "BFI", dimension: "C", reverse: true, text: "我做事有点没条理。" },
  { id: "BFI_19", scale: "BFI", dimension: "N", reverse: false, text: "我经常担忧。" },
  { id: "BFI_20", scale: "BFI", dimension: "O", reverse: false, text: "我想象力丰富。" },
  { id: "BFI_21", scale: "BFI", dimension: "E", reverse: true, text: "我比较安静。" },
  { id: "BFI_22", scale: "BFI", dimension: "A", reverse: false, text: "我通常愿意相信别人。" },
  { id: "BFI_23", scale: "BFI", dimension: "C", reverse: true, text: "我有点懒散。" },
  { id: "BFI_24", scale: "BFI", dimension: "N", reverse: true, text: "我情绪稳定，不容易心烦。" },
  { id: "BFI_25", scale: "BFI", dimension: "O", reverse: false, text: "我很有发明创造力。" },
  { id: "BFI_26", scale: "BFI", dimension: "E", reverse: false, text: "我性格果断、有主见。" },
  { id: "BFI_27", scale: "BFI", dimension: "A", reverse: true, text: "我有时显得冷漠、疏远。" },
  { id: "BFI_28", scale: "BFI", dimension: "C", reverse: false, text: "我会坚持把任务做完。" },
  { id: "BFI_29", scale: "BFI", dimension: "N", reverse: false, text: "我情绪多变。" },
  { id: "BFI_30", scale: "BFI", dimension: "O", reverse: false, text: "我重视艺术和审美体验。" },
  { id: "BFI_31", scale: "BFI", dimension: "E", reverse: true, text: "我有时害羞、拘束。" },
  { id: "BFI_32", scale: "BFI", dimension: "A", reverse: false, text: "我对几乎所有人都体贴友善。" },
  { id: "BFI_33", scale: "BFI", dimension: "C", reverse: false, text: "我做事效率高。" },
  { id: "BFI_34", scale: "BFI", dimension: "N", reverse: true, text: "我在紧张的情况下也能保持冷静。" },
  { id: "BFI_35", scale: "BFI", dimension: "O", reverse: true, text: "我更喜欢常规、有规律的工作。" },
  { id: "BFI_36", scale: "BFI", dimension: "E", reverse: false, text: "我外向、爱社交。" },
  { id: "BFI_37", scale: "BFI", dimension: "A", reverse: true, text: "我有时对别人态度粗鲁。" },
  { id: "BFI_38", scale: "BFI", dimension: "C", reverse: false, text: "我会制定计划，并照着执行。" },
  { id: "BFI_39", scale: "BFI", dimension: "N", reverse: false, text: "我很容易紧张不安。" },
  { id: "BFI_40", scale: "BFI", dimension: "O", reverse: false, text: "我喜欢思考，乐于探索各种想法。" },
  { id: "BFI_41", scale: "BFI", dimension: "O", reverse: true, text: "我对艺术没什么兴趣。" },
  { id: "BFI_42", scale: "BFI", dimension: "A", reverse: false, text: "我喜欢与他人合作。" },
  { id: "BFI_43", scale: "BFI", dimension: "C", reverse: true, text: "我容易分心。" },
  { id: "BFI_44", scale: "BFI", dimension: "O", reverse: false, text: "我在艺术、音乐或文学方面很有素养。" },

  // ===== GAAIS-20（对 AI 的总体态度）=====
  // 积极 10 题（AI_POS）；消极 10 题（AI_NEG，reverse = true 反向计分）
  { id: "GAAIS_01", scale: "GAAIS", dimension: "AI_POS", reverse: false, text: "我觉得人工智能令人兴奋。" },
  { id: "GAAIS_02", scale: "GAAIS", dimension: "AI_POS", reverse: false, text: "我愿意信任人工智能为我提供建议。" },
  { id: "GAAIS_03", scale: "GAAIS", dimension: "AI_POS", reverse: false, text: "人工智能有很多好处。" },
  { id: "GAAIS_04", scale: "GAAIS", dimension: "AI_POS", reverse: false, text: "我对人工智能印象非常深刻。" },
  { id: "GAAIS_05", scale: "GAAIS", dimension: "AI_POS", reverse: false, text: "人工智能让世界变得更美好。" },
  { id: "GAAIS_06", scale: "GAAIS", dimension: "AI_POS", reverse: false, text: "我更愿意依靠人工智能来解决问题。" },
  { id: "GAAIS_07", scale: "GAAIS", dimension: "AI_POS", reverse: false, text: "我愿意信任人工智能照看我的家。" },
  { id: "GAAIS_08", scale: "GAAIS", dimension: "AI_POS", reverse: false, text: "人工智能能做到的事让我印象深刻。" },
  { id: "GAAIS_09", scale: "GAAIS", dimension: "AI_POS", reverse: false, text: "人工智能对我可能会有用。" },
  { id: "GAAIS_10", scale: "GAAIS", dimension: "AI_POS", reverse: false, text: "人工智能会改善我们的生活。" },
  { id: "GAAIS_11", scale: "GAAIS", dimension: "AI_NEG", reverse: true, text: "我对人工智能感到惊恐。" },
  { id: "GAAIS_12", scale: "GAAIS", dimension: "AI_NEG", reverse: true, text: "我对人工智能感到担忧。" },
  { id: "GAAIS_13", scale: "GAAIS", dimension: "AI_NEG", reverse: true, text: "人工智能可能会伤害人。" },
  { id: "GAAIS_14", scale: "GAAIS", dimension: "AI_NEG", reverse: true, text: "人工智能很可怕。" },
  { id: "GAAIS_15", scale: "GAAIS", dimension: "AI_NEG", reverse: true, text: "我害怕人工智能。" },
  { id: "GAAIS_16", scale: "GAAIS", dimension: "AI_NEG", reverse: true, text: "人工智能是危险的。" },
  { id: "GAAIS_17", scale: "GAAIS", dimension: "AI_NEG", reverse: true, text: "我担心人工智能会侵犯我的隐私。" },
  { id: "GAAIS_18", scale: "GAAIS", dimension: "AI_NEG", reverse: true, text: "人工智能可能危及人类。" },
  { id: "GAAIS_19", scale: "GAAIS", dimension: "AI_NEG", reverse: true, text: "人工智能让我紧张不安。" },
  { id: "GAAIS_20", scale: "GAAIS", dimension: "AI_NEG", reverse: true, text: "我担心人工智能会接管世界。" },
];
