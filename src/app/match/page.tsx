"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { ScoreRing } from "@/components/score-ring";
import { Button } from "@/components/ui/button";
import { Badge, Card, CardContent, CardHeader } from "@/components/ui/card";
import { getStore, setStore } from "@/lib/local-store";
import { matchLevelText, scoreTone, todayIso, uid } from "@/lib/utils";
import type { Application, Job, MatchReport } from "@/types/domain";

export default function MatchPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [reports, setReports] = useState<MatchReport[]>([]);
  const report = reports.at(-1);
  const job = jobs.find((item) => item.id === report?.jobId);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setJobs(getStore("jobs"));
      setReports(getStore("matchReports"));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function addApplication() {
    if (!report || !job) return;
    const exists = getStore("applications").some((item) => item.jobId === job.id);
    if (exists) return;
    const application: Application = {
      id: uid("app"),
      userId: report.userId,
      jobId: job.id,
      status: "ready_to_apply",
      contactInfo: "",
      notes: "建议使用岗位定制简历后投递。",
      feedback: "",
      createdAt: todayIso(),
      updatedAt: todayIso(),
    };
    setStore("applications", [...getStore("applications"), application]);
  }

  return (
    <AppShell>
      <PageHeading
        title="匹配报告"
        description="查看综合匹配分、优势、风险点、简历建议和下一步行动。"
      />
      {!report || !job ? (
        <Card>
          <CardContent className="text-center">
            <p className="mb-4 text-sm text-slate-500">还没有匹配报告。</p>
            <Link href="/jd-analysis">
              <Button>去粘贴 JD</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardContent className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm text-slate-500">{job.company} · {job.city}</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">{job.title}</h2>
                <Badge className={scoreTone(report.totalScore)}>
                  {matchLevelText(report.matchLevel)}
                </Badge>
              </div>
              <ScoreRing score={report.totalScore} />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <Score title="技能匹配" value={report.skillScore} />
            <Score title="经历证据" value={report.experienceScore} />
            <Score title="岗位方向" value={report.directionScore} />
            <Score title="成长价值" value={report.growthScore} />
            <Score title="投递成功率" value={report.successScore} />
            <Score title="薪资城市" value={report.salaryCityScore} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ListCard title="匹配原因" items={report.matchReasons} />
            <ListCard title="风险点" items={report.riskPoints} danger />
          </div>
          <ListCard title="简历修改建议" items={report.resumeSuggestions} />
          <ListCard title="面试准备建议" items={report.interviewSuggestions} />

          <Card>
            <CardHeader title="下一步行动" description={report.nextAction} />
            <CardContent className="flex flex-col gap-3 sm:flex-row">
              <Link href="/resume">
                <Button>生成定制简历</Button>
              </Link>
              <Button variant="secondary" onClick={addApplication}>
                <Plus className="h-4 w-4" />
                加入投递台账
              </Button>
              <Link href="/applications">
                <Button variant="ghost">查看投递管理</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  );
}

function Score({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardContent>
        <p className="text-xs text-slate-500">{title}</p>
        <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
      </CardContent>
    </Card>
  );
}

function ListCard({ title, items, danger }: { title: string; items: string[]; danger?: boolean }) {
  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <ol className="grid gap-3">
          {items.map((item, index) => (
            <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
              <span className={danger ? "font-semibold text-red-600" : "font-semibold text-blue-600"}>
                {index + 1}.
              </span>
              {item}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
