import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const expectedPassword = process.env.ADMIN_PASSWORD;

  // 本地开发（未配置密码）：直接放行
  if (!expectedPassword) {
    return NextResponse.json({ ok: true });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体不是合法的 JSON" }, { status: 400 });
  }

  const { password } = (body ?? {}) as { password?: unknown };
  if (typeof password !== "string" || password !== expectedPassword) {
    return NextResponse.json({ error: "密码错误" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", "ok", {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60, // 7 天
    sameSite: "lax",
    path: "/",
  });
  return res;
}
