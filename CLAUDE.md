# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

@AGENTS.md

## 项目介绍

一个 Web 评估平台，测量两个心理学构念：

1. **Big Five 人格**：BFI-44，44 题，5 个维度（O/C/E/A/N）
2. **对 AI 的态度**：GAAIS-20，20 题，2 个子量表（AI_POS / AI_NEG）

共 64 题，5 点 Likert。参与者匿名答题，数据写入 Supabase，结果页展示雷达图和维度解释，管理员后台看聚合统计。

用途：教育研究，不是临床诊断工具。

**线上地址**：https://ai-assessment-hale.netlify.app
**管理员后台**：https://ai-assessment-hale.netlify.app/admin（访问凭证单独提供）
**源码**：https://github.com/hale66138/ai-assessment

## 技术栈

- **框架**：Next.js 16（App Router，Turbopack）
- **语言**：TypeScript
- **样式**：Tailwind CSS
- **数据库**：Supabase（PostgreSQL + REST API）
- **图表**：Chart.js + react-chartjs-2（雷达图）
- **测试**：Vitest 4
- **统计**：psychometric 包（cronbachAlpha）
- **鉴权**：自定义登录页 + admin_session cookie（proxy.ts 保护 /admin 和 /api/admin/stats）
- **部署**：Netlify（从 GitHub main 分支自动部署）

## 项目结构

- `app/` — 页面和 API 路由
  - `page.tsx` — 同意页
  - `assessment/page.tsx` — 问卷页
  - `results/page.tsx` — 结果页
  - `feedback/page.tsx` — 反馈页
  - `admin/page.tsx` — 管理后台
  - `admin/login/page.tsx` — 管理员登录页
  - `admin/logout-button.tsx` — 登出按钮
  - `api/submit/route.ts` — 提交答案
  - `api/admin/stats/route.ts` — 管理端聚合查询
  - `api/admin/login/route.ts` — 登录 API
  - `api/admin/logout/route.ts` — 登出 API
- `lib/` — 业务逻辑
  - `questions.ts` — 64 题数据（含 dimension 和 reverse 标记）
  - `scoring.ts` — 反向计分、维度均值、Cronbach α 适配
  - `scoring.test.ts` — 7 个计分测试
  - `supabase.ts` — anon 客户端 + getSupabaseAdmin
  - `session.ts` — sessionStorage 封装
  - `results.ts` — 结果页展示数据
  - `admin.ts` — 管理页聚合逻辑
- `proxy.ts` — /admin 的登录态中间件（检查 admin_session cookie）

## 环境变量

在 `.env.local` 中配置（不进 git）：

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase 项目 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — 匿名 key，前端写数据用
- `SUPABASE_SERVICE_ROLE_KEY` — 服务端 key，仅管理端聚合查询，绝不暴露给浏览器
- `ADMIN_PASSWORD` — 管理后台登录密码

## 常用命令

- `npm run dev` — 本地开发（http://localhost:3000）
- `npm test` — 运行计分测试
- `npm run build` — 生产构建
- `npm run lint` — 代码检查
- `npx tsc --noEmit` — 类型检查
- `netlify deploy --prod --trigger` — 部署到线上（必须带 `--trigger`，本地构建拿不到 secret 环境变量）

## 数据库

4 张表（Supabase）：

- `participants` — 参与者（id, created_at）
- `answers` — 每题作答（participant_id, question_id, value）
- `dimension_scores` — 7 维得分（participant_id, dimension, score）
- `feedback` — 反馈（participant_id, rating, comments）

RLS 策略：anon 只能 INSERT，service_role 全部权限。

## 硬性约束（不能做的事）

1. **不收集个人信息** — 不收集姓名、邮箱、IP；参与者 ID 用 `crypto.randomUUID()`
2. **不泄露密钥** — 密码、密钥绝不写入公开文件（README、CLAUDE.md、AI_DEV_LOG 等）
3. **RLS 必须严格** — anon 只能 insert，不能 select；service_role 只用于管理端
4. **结果页必须有免责声明** — 不得做临床推断、诊断或因果归因
5. **提交 API 用 anon 客户端** — service_role 只用于管理端聚合查询
6. **计分测试必须通过** — `npm test` 全绿才算完成
7. **界面全部中文**
8. **不引入在线资源** — 不用 Google Fonts 或任何需要联网加载的资源

## 关键约定

- **反向计分**：`scored = 6 - raw`
- **维度分**：该维度所有已答题目的 `scored_value` 均值
- **Cronbach α 样本量门槛**：< 10 暂不计算；10–30 波动较大，仅供参考；≥ 30 才稳定
- **AI_NEG 方向统一**：结果页说明「AI 两维方向统一，分数越高越积极」
- **Next.js 16 用 proxy.ts 而非 middleware.ts**
- **改完代码先 Ctrl+S 保存再跑测试**（Turbopack 缓存问题）

## 工作流程

Explore → Plan → Implement → Test。每次只做一个模块，每步验证。发现 AI 输出有问题要记录到 `AI_DEV_LOG.md`。

## 相关文档

- `README.md` — 项目说明和使用方式
- `AI_DEV_LOG.md` — AI 开发过程记录
- `TECHNICAL_REPORT.md` — 技术报告
- `PILOT_EVALUATION.md` — 试点评估
- `DELIVERY.md` — 交付清单
- `PROGRESS.md` — 开发进度交接
