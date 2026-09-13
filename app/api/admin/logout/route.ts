import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // maxAge 0 = 立即过期，删除 cookie
  res.cookies.set("admin_session", "", {
    httpOnly: true,
    maxAge: 0,
    sameSite: "lax",
    path: "/",
  });
  return res;
}
