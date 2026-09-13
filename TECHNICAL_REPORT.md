# 技术报告（TECHNICAL_REPORT）

> 本报告按挑战要求的 11 个问题组织。前 6 问为完整回答，后 5 问给出框架与要点（待试点数据补充）。

## 问题 1：构建了什么

一个 Web 评估平台，测量 Big Five 人格和对 AI 的态度，共 64 题，匿名答题，结果页有雷达图和维度解释，管理员后台有聚合统计。

## 问题 2：测量什么构念

- Big Five：BFI-44（44 题），O/C/E/A/N 五维
- 对 AI 的态度：GAAIS-20（20 题），AI_POS 和 AI_NEG（反向计分）
- 共 64 题，5 点 Likert

## 问题 3：为什么选这些构念

- Big Five 是经过数十年验证的人格框架，BFI-44 是标准短量表
- GAAIS 是 2020 年发表的 AI 态度量表，有信效度验证
- 都是公开发表，适合教育项目
- 中文翻译版，标注反向题

## 问题 4：计分系统如何工作

- 反向题：scored = 6 - raw
- 维度分：该维度所有已答题目的 scored_value 均值
- Cronbach α：按维度算，样本 < 30 时不报告
- 计分逻辑独立在 lib/scoring.ts，7 个 Vitest 测试覆盖
- 验证方法：把 reverseScore 改成 7-value，测试变红，证明测试有效

## 问题 5：用了什么技术

Next.js 16 + TypeScript + Tailwind + Supabase + Chart.js + Vitest + psychometric + Netlify + HTTP Basic Auth

## 问题 6：如何用 agentic AI

- 用 VS Code 里的 Claude 作为 agentic coding 工具
- 工作流：Explore → Plan → Implement → Test
- 关键：先写 CLAUDE.md 和 PROGRESS.md 提供稳定上下文；一次只做一个模块；自己审查 AI 输出（尤其是计分和安全）；拒绝有风险的建议
- 详见 AI_DEV_LOG.md

## 问题 7：从参与者学到什么

（待补充：等试点数据，见 PILOT_EVALUATION.md）

## 问题 8：遇到什么问题

（框架，从 AI_DEV_LOG 提炼）

- Google Fonts 报错
- Turbopack 缓存
- Netlify secrets 误报
- Cronbach α 小样本极端值

## 问题 9：AI 犯了什么错

- AI 初始没给 /admin 加访问控制
- AI 生成的 cronbachAlpha 在样本 < 30 时直接输出极端值
- AI 提议临时改样本量门槛验证被拒

## 问题 10：如何验证和修正

三个例子：

- reverseScore 故意写错实验（突变测试，证明测试有效）
- Cronbach α 加门槛（completedCount < 30 时不报告）
- /admin 加 Basic Auth（proxy.ts）

## 问题 11：如果还有一周会改进什么

（列思路）

- 常模数据
- IRT（项目反应理论）
- 注意力检测题
- 移动端优化
- 可访问性
