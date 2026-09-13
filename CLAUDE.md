@AGENTS.md
# 项目：AI 与人格测评平台

## 目标
构建一个 Web 评估平台，测量 Big Five 人格和对 AI 的态度（GAAIS）。
用户匿名答题，数据存入 Supabase，管理员可看聚合统计。

## 技术栈
Next.js + TypeScript + Tailwind + Supabase + Chart.js + psychometric

## 实现顺序
1. 配置 Supabase：给出建表 SQL，创建 lib/supabase.ts
2. 同意页 /
3. 问卷页 /assessment
4. 计分逻辑 lib/scoring.ts 和测试
5. 提交 API /api/submit
6. 结果页 /results
7. 管理员 API 和页面 /admin

## 硬性约束
- 不收集姓名、邮箱、IP，参与者 ID 用 crypto.randomUUID()
- Supabase RLS 只允许匿名 insert，不允许 select
- 结果页必须有免责声明，不得做临床推断
- 计分测试必须通过