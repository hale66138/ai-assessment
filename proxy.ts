import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 只保护管理后台相关路径，其余页面（/ /assessment /results /feedback /api/submit）不受影响
export const config = {
  matcher: ["/admin/:path*", "/api/admin/stats"],
};

export function proxy(request: NextRequest) {
  const expectedPassword = process.env.ADMIN_PASSWORD;

  // 本地开发（未配置密码）时直接放行，方便调试
  if (!expectedPassword) {
    return NextResponse.next();
  }

  const credentials = readBasicAuth(request.headers.get("authorization"));

  if (
    !credentials ||
    credentials.username !== "admin" ||
    credentials.password !== expectedPassword
  ) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin"',
      },
    });
  }

  return NextResponse.next();
}

function readBasicAuth(
  header: string | null,
): { username: string; password: string } | null {
  if (!header || !header.startsWith("Basic ")) {
    return null;
  }

  try {
    // 用 Web API atob 解码 Base64（Edge / Node 运行时都可用，避免依赖 Buffer）
    const decoded = atob(header.slice("Basic ".length).trim());
    const separator = decoded.indexOf(":");
    if (separator === -1) {
      return null;
    }
    return {
      username: decoded.slice(0, separator),
      password: decoded.slice(separator + 1),
    };
  } catch {
    return null;
  }
}
