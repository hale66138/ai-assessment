import { createClient } from "@supabase/supabase-js";

// 维度取值，与 dimension_scores / feedback 表的 CHECK 约束保持一致
export type Dimension = "O" | "C" | "E" | "A" | "N" | "AI_POS" | "AI_NEG";

// 表结构类型，供后续 route handler 获得类型提示
// 表结构类型：需满足 supabase-js 的 GenericSchema 约束
// （Tables 里的每张表要含 Row/Insert/Update/Relationships，schema 层要含 Views/Functions），
// 否则 .from().insert() 的入参会被推断成 never。
export type Database = {
  public: {
    Tables: {
      participants: {
        Row: { id: string; created_at: string };
        Insert: { id: string; created_at?: string };
        Update: { id?: string; created_at?: string };
        Relationships: [];
      };
      answers: {
        Row: {
          id: number;
          participant_id: string;
          question_id: string;
          value: number;
          created_at: string;
        };
        Insert: {
          participant_id: string;
          question_id: string;
          value: number;
          created_at?: string;
        };
        Update: {
          participant_id?: string;
          question_id?: string;
          value?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      dimension_scores: {
        Row: {
          id: number;
          participant_id: string;
          dimension: Dimension;
          score: number;
          created_at: string;
        };
        Insert: {
          participant_id: string;
          dimension: Dimension;
          score: number;
          created_at?: string;
        };
        Update: {
          participant_id?: string;
          dimension?: Dimension;
          score?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      feedback: {
        Row: {
          id: number;
          participant_id: string;
          rating: number;
          comments: string | null;
          created_at: string;
        };
        Insert: {
          participant_id: string;
          rating: number;
          comments?: string | null;
          created_at?: string;
        };
        Update: {
          participant_id?: string;
          rating?: number;
          comments?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`缺少环境变量：${name}`);
  }
  return value;
}

const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
const anonKey = requireEnv(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
// 可选：仅管理端 /api/admin/stats 需要，缺省时惰性报错
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 匿名客户端：仅用于 /api/submit 的写入（受 RLS insert-only 约束）
export const supabase = createClient<Database>(url, anonKey, {
  auth: { persistSession: false },
});

export type SupabaseClientType = typeof supabase;

// service_role 客户端：仅在服务端使用（绕过 RLS），供 /api/admin/stats 聚合查询。
// 延迟创建 + 惰性校验，未配置 key 时不影响应用启动。
let adminClient: SupabaseClientType | null = null;

export function getSupabaseAdmin(): SupabaseClientType {
  if (adminClient) return adminClient;

  const key = serviceRoleKey;
  if (!key) {
    throw new Error("缺少环境变量：SUPABASE_SERVICE_ROLE_KEY（仅管理端需要）");
  }

  const client = createClient<Database>(url, key, {
    auth: { persistSession: false },
  });
  adminClient = client;
  return client;
}
