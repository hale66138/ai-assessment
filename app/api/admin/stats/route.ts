import { NextResponse } from "next/server";
import { getAdminStats } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await getAdminStats();
    return NextResponse.json(stats);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "读取统计数据失败" },
      { status: 500 },
    );
  }
}
