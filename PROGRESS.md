# 项目进度交接文档

> 用途：VS Code / Claude 重启后，让新对话能无缝接手。
> 最后更新：2026-09-13（晚上暂停）

---

## 一、项目是什么

Web 评估平台，测量两个心理学构念：

1. Big Five 人格（BFI-44，44 题，5 点 Likert）
2. 对 AI 的态度（GAAIS-20，20 题，5 点 Likert，分 AI_POS / AI_NEG）

共 64 题，反向题 26 道（BFI 16 + AI_NEG 10）。匿名答题，数据写 Supabase，管理员在 /admin 看聚合统计。

性质：教育探索项目，非临床诊断工具。结果页必须有免责声明。

---

## 二、技术栈

- Next.js 16（App Router，Turbopack）
- TypeScript + Tailwind CSS
- Supabase（PostgreSQL + REST API）
- Chart.js + react-chartjs-2（雷达图）
- psychometric 包（cronbachAlpha）
- Vitest 4
- 部署目标：Vercel

---

## 三、环境信息

- 操作系统：Windows，PowerShell
- 项目路径：C:\Users\32036\Desktop\ai-assessment
- 开发服务器：npm run dev → http://localhost:3000
- 测试：npm test（vitest run）
- 类型检查：npx tsc --noEmit
- 代码检查：npm run lint
- 生产构建：npm run build

环境变量（已填在 .env.local，不进 git）：
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

---

## 四、已完成的工作（全部）

### 1. 项目初始化
- npx create-next-app 生成
- 依赖：@supabase/supabase-js、chart.js、react-chartjs-2、psychometric、vitest
- package.json scripts 有 dev / build / start / lint / test / test:watch

### 2. Supabase 数据库
项目名 ai-assessment，区域 Asia-Pacific。

4 张表：
- participants：id (uuid, 主键), created_at
- answers：id, participant_id (uuid, 外键), question_id (text), value (int 1-5), created_at
  - 唯一约束 (participant_id, question_id)
- dimension_scores：id, participant_id, dimension (text), score (numeric), created_at
  - 唯一约束 (participant_id, dimension)
  - dimension 枚举：O / C / E / A / N / AI_POS / AI_NEG
- feedback：id, participant_id, rating (int 1-5), comments (text, 可空), created_at

RLS 策略（4 张表一致）：
- anon：只能 INSERT，不能 SELECT / UPDATE / DELETE
- service_role：全部权限

### 3. 题目数据（lib/questions.ts）
- 导出 QUESTION（64 题数组，每题 { id, scale, dimension, reverse, text }）
- 导出 LIKERT_LABELS（5 点 Likert 中文标签）
- BFI-44 反向题 16 道：02, 06, 08, 09, 12, 18, 21, 23, 24, 27, 31, 34, 35, 37, 41, 43
- BFI-44 维度：O=10, C=9, E=8, A=9, N=8
- GAAIS-20：AI_POS 10 题正向，AI_NEG 10 题全部 reverse: true
- 三处中文翻译已微调：BFI_35、BFI_40、GAAIS_02（详见 AI 开发记录）

### 4. 计分逻辑（lib/scoring.ts）
- reverseScore(value) => 6 - value
- scoreItem(q, raw) => q.reverse ? reverseScore(raw) : raw
- computeDimensionScores(answers) => 7 维均值
- cronbachAlpha(matrix)：适配 psychometric，只透传矩阵，方向对齐由调用方做

lib/scoring.test.ts：7 个测试全绿
- reverseScore 五个映射
- 全选 3 → 所有维度 = 3
- 全选 5 → 含反向题的维度 < 5
- 缺失答案只算已答
- 手算对拍 (5+5+1+1)/4 = 3
- cronbachAlpha 与 psychometric 一致

已验证测试有效性：把 reverseScore 改成 7-value，跑 npm test 有 4 个测试变红。

### 5. sessionStorage 封装（lib/session.ts）
- setParticipantId / getParticipantId
- setAnswers / getAnswers
- setScores / getScores
- clearAll
- SSR 安全

### 6. Supabase 客户端（lib/supabase.ts）
- supabase：anon 客户端（用于 /api/submit 和 /feedback）
- getSupabaseAdmin()：service_role（用于 /api/admin/stats）
- Database.feedback 已是新结构 (rating, comments)

### 7. 页面
- app/layout.tsx：根布局，lang="zh-CN"，无 Google 字体依赖
- app/page.tsx：同意页（说明 + 勾选 + UUID + 跳 /assessment）
- app/assessment/page.tsx：问卷页（逐题 + 进度条 + 题目导航 + 答满才能提交）
- app/results/page.tsx：结果页
  - 大五雷达图
  - 7 维分数 + 相对位置
  - 每维两句：描述 + 基于分数的解释
  - 维度间比较区块（只比大五 5 维，找最高/最低/差值）
  - 免责声明
  - 反馈链接
- app/feedback/page.tsx：反馈页（已真实写入 feedback 表）
- app/admin/page.tsx：管理后台（服务端组件，直接调 getAdminStats）

### 8. API Route
- app/api/submit/route.ts：POST { participantId, answers }，anon 写入三表，返回 scores
- app/api/admin/stats/route.ts：GET，service_role 读聚合

### 9. 展示数据
- lib/results.ts：DIMENSION_META、relativeLevel、formatScore、explainDimension
- lib/admin.ts：getAdminStats（完成人数、维度均值、题目分布、α）

### 10. Cronbach α 显示修复（已完成）
- lib/admin.ts：completedCount < 30 时所有维度 α 返回 null；题目数门槛 < 3 也返回 null
- app/admin/page.tsx：null 显示「样本不足，暂不计算」，有值保留两位小数
- lib/scoring.ts：给 cronbachAlpha 加了注释，说明方向对齐由调用方做
- 已验证：/admin 现在 7 个维度全部显示「样本不足，暂不计算」，不再出现 -3.938 等极端值

### 11. 部署前准备（已完成）
- .gitignore 检查通过：node_modules、.next、.vercel、.env* 都已忽略
- 补了 !.env.example 让模板可提交
- README.md 已生成（项目简介、技术栈、本地运行、环境变量、Vercel 部署、项目结构、免责声明）
- npm run build 通过，exit 0
  - 静态：/ /assessment /results /feedback
  - 动态：/admin /api/submit /api/admin/stats

### 12. Git 初始化（部分完成）
- git init 完成
- git add . 完成，暂存 35 个文件
- 确认 .env.local 没被加进去
- **卡在 git commit：本机 git config user.name 和 user.email 都是空的，需要先配置**

---

## 五、当前待办（明天从这里继续）

### 待办 1：配置 git 身份 + 完成第一次提交
需要用户提供 name 和 email，然后执行：
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
git commit -m "complete assessment platform"

建议邮箱用 GitHub 的 noreply 邮箱保护隐私，格式：用户名@users.noreply.github.com

### 待办 2：GitHub 建仓库 + 推送
1. 打开 https://github.com/new
2. Repository name 填 ai-assessment（或 web-assessment）
3. Public（公开），不要勾 Initialize with README / .gitignore
4. 建好后在本地执行：
   git remote add origin https://github.com/<用户名>/ai-assessment.git
   git branch -M main
   git push -u origin main
5. 首次 push 会弹浏览器登录 GitHub（Git Credential Manager 自动处理）

### 待办 3：Vercel 部署
1. 打开 https://vercel.com，用 GitHub 账号登录
2. 点 Add New → Project，选刚才的仓库
3. 在环境变量里添加三个：
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
4. 点 Deploy，等 1-2 分钟
5. 拿到公开 URL，形如 https://ai-assessment-xxx.vercel.app
6. 手机打开 URL 完整测一遍

### 待办 4：找 10 个真实用户答题
- 分享公开 URL
- 请他们填反馈
- 收集至少 10 条完成记录（Supabase 表会自动累积）
- 观察 /admin 页面的聚合数据

### 待办 5：写文档（挑战交付物）
- AI_DEV_LOG.md：记录 AI 开发的错误和修正
- PILOT_EVALUATION.md：10 人试点分析
- TECHNICAL_REPORT.md：技术报告
- README.md 已完成

---

## 六、硬性约束（不要违反）

1. 不收集姓名、邮箱、IP；ID 用 crypto.randomUUID()
2. Supabase RLS：anon 只能 insert，不能 select
3. 结果页必须有免责声明，不得做临床推断、诊断、因果归因
4. 提交 API 用 anon 客户端，不用 service_role
5. 计分测试必须通过（npm test）
6. 结果页和问卷页全部中文
7. 不引入 Google Fonts 或任何在线资源

---

## 七、已知踩过的坑

1. Google Fonts 报错：layout.tsx 已移除 next/font/google，不要加回
2. Turbopack 缓存：改完代码 Ctrl+S 保存再跑测试
3. feedback 表结构：新结构是 (rating, comments)
4. AI_NEG 反向计分：结果页说明「AI 两维方向统一，分数越高越积极」
5. vitest 版本：装的是 vitest 4，不是 5
6. React Compiler lint：避免在 effect 里 setState，用 useSyncExternalStore
7. 未保存文件就跑测试会误判：改完 scoring.ts 一定要 Ctrl+S
8. 文件位置：PROGRESS.md 必须在项目根目录（曾经误放到 lib/）

---

## 八、重启后请 Claude 读这份文档

新对话第一句：

> 请阅读项目根目录的 PROGRESS.md，然后读 lib/admin.ts、app/admin/page.tsx、lib/results.ts、app/results/page.tsx、lib/questions.ts，理解当前项目状态。
> 报告你读到了什么、已完成哪些、下一步应该做什么。
> 先不要写代码，等我说「继续」再动手。

---

## 九、项目文件结构

ai-assessment/
- app/
  - layout.tsx
  - page.tsx（同意页）
  - globals.css
  - assessment/page.tsx（问卷页）
  - results/page.tsx（结果页）
  - feedback/page.tsx（反馈页）
  - admin/page.tsx（管理后台）
  - api/submit/route.ts（提交 API）
  - api/admin/stats/route.ts（管理统计 API）
- lib/
  - questions.ts（64 题）
  - scoring.ts（计分）
  - scoring.test.ts（测试）
  - session.ts（sessionStorage）
  - supabase.ts（客户端）
  - results.ts（结果页数据）
  - admin.ts（管理页聚合）
- .env.local（不进 git）
- .env.example
- .gitignore
- package.json
- tsconfig.json
- vitest.config.mts
- PROGRESS.md（本文档）
- README.md（已生成）

---

## 十、AI 开发记录要点（供后续写 AI_DEV_LOG.md 用）

1. 早期 Google Fonts 报错，通过删除 next/font/google 解决
2. reverseScore「故意写错」实验：改成 7-value 后 4 个测试变红，证明测试有效（但第一次因为未保存文件导致误判）
3. Cronbach α 在小样本下出现 -22.857 等极端值，识别为统计假象，加 completedCount < 30 门槛修复
4. 结果页缺「维度间比较」，由挑战要求补充
5. 三处题目中文翻译微调（BFI_35、BFI_40、GAAIS_02）
6. AI 一度提议「临时把 n<30 改成 n<2 验证样本充足分支」，被拒绝（避免忘记回滚）