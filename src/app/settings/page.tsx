"use client";

import { useEffect, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { clearAllStore, getStore } from "@/lib/local-store";
import type { AuthUser } from "@/types/domain";

export default function SettingsPage() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setUser(getStore("authUser"));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function exportData() {
    const data = {
      profile: getStore("profile"),
      jobs: getStore("jobs"),
      matchReports: getStore("matchReports"),
      resumes: getStore("resumes"),
      applications: getStore("applications"),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "jobpilot-ai-data.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function clearData() {
    clearAllStore();
    window.location.href = "/";
  }

  return (
    <AppShell>
      <PageHeading
        title="设置"
        description="管理本地账号、AI 服务配置、数据导出和隐私控制。"
      />
      <div className="grid gap-6">
        <Card>
          <CardHeader title="账号信息" />
          <CardContent className="text-sm leading-7 text-slate-600">
            <p>当前账号：{user?.email || "未登录"}</p>
            <p>认证方式：本地浏览器模拟登录</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="AI 服务设置" />
          <CardContent className="text-sm leading-7 text-slate-600">
            <p>后端会读取 `.env.local` 中的 `OPENAI_API_KEY`。</p>
            <p>默认模型为 `gpt-4.1-mini`，可通过 `OPENAI_MODEL` 覆盖。</p>
            <p>未配置 Key 时，AI 分析接口会返回清晰错误，页面不会伪造结果。</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="数据控制" description="当前第一版数据仅保存于本机浏览器 localStorage。" />
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" onClick={exportData}>
              <Download className="h-4 w-4" />
              导出数据
            </Button>
            <Button variant="danger" onClick={clearData}>
              <Trash2 className="h-4 w-4" />
              删除本地数据
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="隐私说明" />
          <CardContent className="text-sm leading-7 text-slate-600">
            <p>你的简历和画像数据会用于生成分析结果。</p>
            <p>当前版本不会公开展示给其他用户。</p>
            <p>AI 分析可能调用第三方模型服务 OpenAI。</p>
            <p>你可以随时导出或删除本地数据。</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
