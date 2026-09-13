import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 只保护管理后台相关路径，其余页面（同意页/问卷/结果/反馈/提交 API）不受影响
export const config = {
  matcher: ["/admin/:path*", "/api/admin/stats"],
};

// 登录成功后设置的 cookie 名，值固定为 "ok"（无需 HMAC，越简单越好）
const SESSION_COOKIE = "admin_session";

export function proxy(request: NextRequest) {
  const expectedPassword = process.env.ADMIN_PASSWORD;

  // 本地开发（未配置密码）：直接放行
  if (!expectedPassword) {
    return NextResponse.next();
  }

  const authed = request.cookies.get(SESSION_COOKIE)?.value === "ok";
  const { pathname } = request.nextUrl;

  // 已登录 → 放行
  if (authed) {
    return NextResponse.next();
  }

  // 登录页本身放行（否则登录页打不开）
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // 未登录访问 /admin → 跳登录页
  if (pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // 未登录访问 /api/admin/stats → 401
  return new NextResponse("Unauthorized", { status: 401 });
}
