# 交付清单

## 公开访问
- 平台链接：https://ai-assessment-hale.netlify.app
- 参与者打开链接即可答题，10 分钟完成

## 管理员后台
- 地址：https://ai-assessment-hale.netlify.app/admin
- 访问凭证：单独提供
- 建议用桌面浏览器访问

## 源码
- GitHub：https://github.com/hale66138/ai-assessment

## 文档
- README.md：项目说明和运行方式
- AI_DEV_LOG.md：AI 开发过程记录
- TECHNICAL_REPORT.md：技术报告
- PILOT_EVALUATION.md：试点评估
- PROGRESS.md：开发进度交接

## 技术概要
- 测量：Big Five（BFI-44）+ 对 AI 态度（GAAIS-20），共 64 题
- 计分：反向题自动转换 + 7 维度均值 + Cronbach α
- 数据：匿名 UUID 写入 Supabase
- 隐私：不收集姓名、邮箱、IP

## 数据导出
数据满 10 人后，可在 Supabase Table Editor 导出 CSV 做分析。
