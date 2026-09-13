# 已知问题与改进方向

> 本文档记录项目当前的已知不足，作为"如果还有一周会如何改进"的依据。
> 最后更新：2026-09-13

## 🔴 安全问题

### 1. 登录 cookie 是固定值，可被伪造
`proxy.ts` 检查 `admin_session === "ok"`，`login/route.ts` 也设置固定值 `"ok"`。
攻击者可用浏览器 DevTools 手动设置 `admin_session=ok` 绕过密码。
**改进方向**：把 cookie 值改成 `sha256(ADMIN_PASSWORD)`，proxy 里比对哈希。不知道密码就无法伪造。

### 2. ADMIN_PASSWORD 未配置时静默放行
`proxy.ts` 里 `if (!expectedPassword) return NextResponse.next()` 是为本地开发方便。
生产环境如果忘了配 ADMIN_PASSWORD，/admin 会完全不设防且无提示。
**改进方向**：生产环境检测到未配置时直接返回 500，或至少在首页显示警告。

### 3. 登录接口无速率限制
`/api/admin/login` 没有失败次数限制，可被暴力尝试。
**改进方向**：加简单计数器（同一 IP 5 分钟内失败 5 次则拒绝），或用 Netlify 的 rate limiting。

### 4. 反馈数据客户端直插、无服务端校验
`feedback/page.tsx` 用 anon 客户端直接 insert，rating 范围和 comments 长度只在客户端 UI 校验。
**改进方向**：确认数据库 feedback 表有 `CHECK (rating BETWEEN 1 AND 5)` 约束；或改走 `/api/feedback` 路由做服务端校验。

## 🟡 健壮性 / 边界情况

### 5. /api/submit 非幂等、非原子写入
网络重试时 participant 主键冲突 → 500；中途失败会留孤儿 participant 行。
**改进方向**：改用数据库函数/RPC 做原子写入，或用 upsert 语义。

### 6. 结果页"最高/最低"在全部分数相等时显示同一维度
5 个大五维度同分时，会显示"开放性最高、开放性最低，相差 0.0 分"。
**改进方向**：加相等判断，或直接不显示这条比较。

### 7. lib/session.ts 有遗留注释、类型可收紧
`setScores(scores: unknown)` 可收紧为 `Record<Dimension, number>`。
**改进方向**：小改动，顺手做。

### 8. AI_NEG 标签容易误导
结果页标为「AI 负面担忧」，但该维度已反向计分——分数越高担忧越低。
**改进方向**：标签改成「AI 担忧（反向）」或在描述里写明方向。

## 💡 建议

### 9. 数据库 schema / RLS 未进版本库
仓库里没有建表 SQL 或迁移文件，安全关键定义只存在于 Supabase 控制台，不可追溯。
**改进方向**：补一个 `schema.sql`（含 4 张表定义、RLS 策略、CHECK 约束）进仓库。

## 🟢 已确认无问题

- 秘密处理：`.env.local` 未进 git；`service_role` 只在服务端使用
- 题目数据：BFI-44 维度分布正确（O10/C9/E8/A9/N8），反向题标记抽查全部正确
- 计分逻辑：反向计分、维度均值、Cronbach α 方向对齐均正确
- 登录流程：无死循环
- RLS 用法：提交走 anon、聚合走 service_role，符合硬性约束
