# AI 与人格测评平台

一个匿名 Web 测评平台：测量 Big Five 人格（BFI-44）与对 AI 的态度（GAAIS-20），共 64 题，数据写入 Supabase，管理员可在 `/admin` 查看聚合统计。

## 技术栈

- Next.js 16（App Router）+ TypeScript + Tailwind CSS
- Supabase（PostgreSQL + REST API，RLS 匿名写入）
- Chart.js + react-chartjs-2（雷达图）
- psychometric（Cronbach α 内部一致性）
- Vitest（计分单元测试）

## 本地运行

```bash
git clone <你的仓库地址>
cd ai-assessment
npm install
```

复制 `.env.example` 为 `.env.local` 并填入真实值：

```bash
cp .env.example .env.local
```

启动开发服务器：

```bash
npm run dev
```

打开 http://localhost:3000。

## 环境变量

在 Supabase 控制台 → Project Settings → API 中可找到这三项：

| 变量 | 说明 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key（可公开，用于匿名写入） |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role secret key（仅服务端使用，绝不暴露给浏览器） |

## 部署（Vercel）

1. 初始化 Git 仓库并推送到 GitHub / GitLab。
2. 在 Vercel 中 Import 该仓库。
3. 在 Project Settings → Environment Variables 中填入上述 3 个环境变量。
4. 部署，构建命令与输出目录使用 Vercel 对 Next.js 的默认值即可。

数据库需已存在 4 张表（`participants` / `answers` / `dimension_scores` / `feedback`）并配置 RLS（anon 只能 INSERT，service_role 全权限）。

## 项目结构

```
app/
  page.tsx              # 同意页
  assessment/page.tsx   # 问卷页（64 题）
  results/page.tsx      # 结果页（雷达图 + 维度解释 + 免责声明）
  feedback/page.tsx     # 反馈页
  admin/page.tsx        # 管理后台（聚合统计）
  api/submit/route.ts   # 提交 API
  api/admin/stats/route.ts # 管理统计 API
lib/
  questions.ts          # 64 题（BFI-44 + GAAIS-20）
  scoring.ts            # 计分逻辑
  scoring.test.ts       # 计分测试
  session.ts            # sessionStorage 封装
  supabase.ts           # Supabase 客户端
  results.ts            # 结果页展示数据
  admin.ts              # 管理页聚合
```

## 测试

```bash
npm test          # 运行 Vitest
npm run lint      # 代码检查
npx tsc --noEmit  # 类型检查
```

## 免责声明

本测评仅供教育与研究参考，不构成心理评估或医疗建议，不用于临床诊断，也不做任何因果推断。测评匿名进行，不收集姓名、邮箱、IP 等个人信息。
