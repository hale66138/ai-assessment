# AI 与人格测评平台

一个 Web 评估平台，测量 Big Five 人格特质和对 AI 的态度，用于教育研究。

## 测量内容

- Big Five 人格：BFI-44，44 题
- 对 AI 的态度：GAAIS-20，20 题（AI 积极态度 + AI 负面担忧）
- 共 64 题，5 点 Likert，约 10 分钟

## 公开访问

- 平台链接：https://ai-assessment-hale.netlify.app
- 参与者打开链接即可答题，匿名，不收集姓名/邮箱/IP

## 管理员后台

- 地址：https://ai-assessment-hale.netlify.app/admin
- 用户名：admin
- 密码：单独提供，不写入公开仓库
- 显示内容：完成人数、7 维平均分、Cronbach α、每题响应分布
- 样本量 < 30 时 α 显示「样本不足，暂不计算」

## 技术栈

- Next.js 16（App Router）+ TypeScript + Tailwind CSS
- Supabase（PostgreSQL）存储数据
- Chart.js 绘制雷达图
- Vitest 单元测试
- Netlify 部署

## 本地运行

```bash
npm install
cp .env.example .env.local   # 复制后填入四个变量
npm run dev
```

打开 http://localhost:3000。

## 环境变量

| 变量名 | 用途 |
|--------|------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase 项目 URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | 匿名 key，前端写数据用 |
| SUPABASE_SERVICE_ROLE_KEY | 服务端 key，仅管理端聚合查询，绝不暴露给浏览器 |
| ADMIN_PASSWORD | 管理后台 Basic Auth 密码 |

## 测试

```bash
npm test   # 7 个计分测试
```

## 计分说明

- 反向题：scored = 6 - raw
- 维度分：该维度所有已答题目的 scored_value 均值
- Cronbach α：按维度计算，样本 < 30 时不报告

## 隐私与免责

- 不收集姓名、邮箱、IP
- 参与者 ID 为前端生成的随机 UUID
- 结果仅供教育参考，不构成心理评估或医疗建议

## 项目结构

```
app/
  page.tsx               # 同意页
  assessment/page.tsx    # 问卷页（64 题）
  results/page.tsx       # 结果页（雷达图 + 维度解释 + 免责声明）
  feedback/page.tsx      # 反馈页
  admin/page.tsx         # 管理后台（聚合统计）
  api/submit/route.ts    # 提交 API
  api/admin/stats/route.ts # 管理统计 API
lib/
  questions.ts           # 64 题（BFI-44 + GAAIS-20）
  scoring.ts             # 计分逻辑
  scoring.test.ts        # 计分测试
  session.ts             # sessionStorage 封装
  supabase.ts            # Supabase 客户端
  results.ts             # 结果页展示数据
  admin.ts               # 管理页聚合
```

## 相关文档

- AI_DEV_LOG.md：AI 开发过程记录
- TECHNICAL_REPORT.md：技术报告
- PILOT_EVALUATION.md：试点评估
- PROGRESS.md：开发进度交接

## 部署

- 平台：Netlify
- 从 GitHub main 分支自动部署
- 环境变量在 Netlify → Site configuration → Environment variables 配置
