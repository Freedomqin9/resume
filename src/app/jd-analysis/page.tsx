"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Badge, Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { getStore, setStore } from "@/lib/local-store";
import { todayIso, uid } from "@/lib/utils";
import type { ApiResponse, ExtractedRequirements, Job, MatchReport } from "@/types/domain";

export default function JdAnalysisPage() {
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const user = getStore("authUser");
      setJob({
        id: uid("job"),
        userId: user?.id || "local-user",
        title: "",
        company: "",
        city: "",
        salary: "",
        source: "手动粘贴",
        url: "",
        jdText: "",
        createdAt: todayIso(),
        updatedAt: todayIso(),
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function update<K extends keyof Job>(key: K, value: Job[K]) {
    if (!job) return;
    setJob({ ...job, [key]: value, updatedAt: todayIso() });
  }

  async function extract() {
    if (!job) return;
    setMessage("");
    if (job.jdText.trim().length < 30) {
      setMessage("岗位 JD 至少需要 30 个字符。");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/jobs/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job }),
      });
      const payload = (await response.json()) as ApiResponse<ExtractedRequirements>;
      if (!payload.success) throw new Error(payload.error.detail);
      const next = { ...job, extractedRequirements: payload.data, updatedAt: todayIso() };
      const jobs = getStore("jobs").filter((item) => item.id !== job.id);
      setStore("jobs", [...jobs, next]);
      setJob(next);
      setMessage("岗位要求提取完成，已保存到本地。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "分析失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  async function match() {
    if (!job) return;
    setMessage("");
    const profile = getStore("profile");
    if (!profile) {
      setMessage("请先填写职业画像，再生成匹配报告。");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job, profile }),
      });
      const payload = (await response.json()) as ApiResponse<Omit<MatchReport, "id" | "userId" | "jobId" | "createdAt">>;
      if (!payload.success) throw new Error(payload.error.detail);
      const report: MatchReport = {
        ...payload.data,
        id: uid("report"),
        userId: job.userId,
        jobId: job.id,
        createdAt: todayIso(),
      };
      const jobs = getStore("jobs").filter((item) => item.id !== job.id);
      setStore("jobs", [...jobs, job]);
      setStore("matchReports", [...getStore("matchReports"), report]);
      router.push("/match");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "匹配分析失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <PageHeading
        title="JD 分析"
        description="粘贴目标岗位 JD，系统会提取职责、要求、技能关键词和风险信号。"
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader title="岗位输入" description="信息越完整，后续匹配报告越准确。" />
          <CardContent className="grid gap-4">
            <Field label="岗位名称">
              <Input value={job?.title || ""} onChange={(event) => update("title", event.target.value)} />
            </Field>
            <Field label="公司名称">
              <Input value={job?.company || ""} onChange={(event) => update("company", event.target.value)} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="城市">
                <Input value={job?.city || ""} onChange={(event) => update("city", event.target.value)} />
              </Field>
              <Field label="薪资范围">
                <Input value={job?.salary || ""} onChange={(event) => update("salary", event.target.value)} />
              </Field>
            </div>
            <Field label="来源">
              <Select value={job?.source || "手动粘贴"} onChange={(event) => update("source", event.target.value)}>
                <option>手动粘贴</option>
                <option>招聘网站</option>
                <option>朋友推荐</option>
              </Select>
            </Field>
            <Field label="岗位链接">
              <Input value={job?.url || ""} onChange={(event) => update("url", event.target.value)} />
            </Field>
            <Field label="岗位 JD 原文">
              <Textarea className="min-h-64" value={job?.jdText || ""} onChange={(event) => update("jdText", event.target.value)} />
            </Field>
            {message ? (
              <div className="rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">
                {message}
              </div>
            ) : null}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={extract} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                提取岗位要求
              </Button>
              <Button variant="secondary" onClick={match} disabled={loading}>
                生成匹配报告
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="AI 提取结果" description="提取后会展示岗位要求和风险信号。" />
          <CardContent>
            {job?.extractedRequirements ? (
              <div className="grid gap-5">
                <Info title="岗位类型" items={[job.extractedRequirements.jobType]} />
                <Info title="核心职责" items={job.extractedRequirements.coreResponsibilities} />
                <Info title="硬性要求" items={job.extractedRequirements.hardRequirements} />
                <Info title="技能关键词" items={job.extractedRequirements.skills} />
                <Info title="风险信号" items={job.extractedRequirements.riskSignals} danger />
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                你还没有提取岗位要求。
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function Info({ title, items, danger }: { title: string; items: string[]; danger?: boolean }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-slate-950">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.filter(Boolean).map((item) => (
          <Badge key={item} className={danger ? "border-red-200 bg-red-50 text-red-700" : undefined}>
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}
