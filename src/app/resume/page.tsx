"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select } from "@/components/ui/form";
import { getStore, setStore } from "@/lib/local-store";
import { todayIso, uid } from "@/lib/utils";
import type { ApiResponse, Job, MatchReport, ResumeMode, ResumeVersion } from "@/types/domain";

export default function ResumePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [reports, setReports] = useState<MatchReport[]>([]);
  const [resumes, setResumes] = useState<ResumeVersion[]>([]);
  const [mode, setMode] = useState<ResumeMode>("career_transition");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const report = reports.at(-1);
  const job = jobs.find((item) => item.id === report?.jobId);
  const latestResume = resumes.at(-1);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setJobs(getStore("jobs"));
      setReports(getStore("matchReports"));
      setResumes(getStore("resumes"));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function generate() {
    const profile = getStore("profile");
    if (!profile || !job || !report) {
      setMessage("请先完成职业画像和匹配报告。");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/resume/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, job, report, mode }),
      });
      const payload = (await response.json()) as ApiResponse<Omit<ResumeVersion, "id" | "userId" | "jobId" | "matchReportId" | "resumeType" | "createdAt" | "updatedAt">>;
      if (!payload.success) throw new Error(payload.error.detail);
      const resume: ResumeVersion = {
        ...payload.data,
        id: uid("resume"),
        userId: report.userId,
        jobId: job.id,
        matchReportId: report.id,
        resumeType: mode,
        createdAt: todayIso(),
        updatedAt: todayIso(),
      };
      const next = [...getStore("resumes"), resume];
      setStore("resumes", next);
      setResumes(next);
      setMessage("简历建议生成完成。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "简历生成失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <PageHeading
        title="简历重构"
        description="按岗位要求重构真实经历，不编造项目，不虚构数据，突出可迁移能力。"
      />
      <Card className="mb-6">
        <CardHeader title="生成设置" description={job ? `${job.company} · ${job.title}` : "请先生成匹配报告"} />
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select value={mode} onChange={(event) => setMode(event.target.value as ResumeMode)} className="sm:w-56">
            <option value="conservative">保守模式</option>
            <option value="enhanced">增强模式</option>
            <option value="career_transition">转行模式</option>
          </Select>
          <Button onClick={generate} disabled={loading || !job || !report}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            生成定制简历
          </Button>
          {message ? <span className="text-sm text-blue-700">{message}</span> : null}
        </CardContent>
      </Card>

      {latestResume ? (
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr_0.9fr]">
          <Panel title="原始经历" sections={[getStore("profile")?.workExperience || "", getStore("profile")?.projectExperience || ""]} />
          <Panel title={latestResume.resumeTitle} sections={[
            latestResume.summary,
            latestResume.skillsSection,
            latestResume.workSection,
            latestResume.projectSection,
            latestResume.selfEvaluation,
          ]} />
          <Panel title="岗位对应关系" sections={[
            latestResume.hrMessage,
            latestResume.interviewIntro,
          ]} />
        </div>
      ) : (
        <Card>
          <CardContent className="text-center text-sm text-slate-500">
            暂无简历版本。完成匹配报告后，可在这里生成岗位定制版简历内容。
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}

function Panel({ title, sections }: { title: string; sections: string[] }) {
  return (
    <Card>
      <CardHeader title={title} />
      <CardContent className="grid gap-4">
        {sections.filter(Boolean).map((section) => (
          <div key={section} className="whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">
            {section}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
