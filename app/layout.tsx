import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 与人格测评",
  description: "一个教育探索用的人格与态度测评平台",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}