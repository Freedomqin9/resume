"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { Badge, Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/form";
import { getStore, setStore } from "@/lib/local-store";
import { todayIso } from "@/lib/utils";
import type { Application, ApplicationStatus, Job, MatchReport } from "@/types/domain";

const statusLabels: Record<ApplicationStatus, string> = {
  to_analyze: "待分析",
  ready_to_apply: "适合投递",
  applied: "已投递",
  follow_up: "待跟进",
  interview_scheduled: "已约面",
  first_round_done: "一面完成",
  second_round_done: "二面完成",
  rejected: "已拒绝",
  offer: "已 Offer",
  abandoned: "已放弃",
};

export default function ApplicationsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [reports, setReports] = useState<MatchReport[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [status, setStatus] = useState<ApplicationStatus | "all">("all");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setJobs(getStore("jobs"));
      setReports(getStore("matchReports"));
      setApplications(getStore("applications"));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const filtered = useMemo(
    () => applications.filter((item) => status === "all" || item.status === status),
    [applications, status],
  );

  function update(id: string, patch: Partial<Application>) {
    const next = applications.map((item) =>
      item.id === id ? { ...item, ...patch, updatedAt: todayIso() } : item,
    );
    setApplications(next);
    setStore("applications", next);
  }

  return (
    <AppShell>
      <PageHeading
        title="投递管理"
        description="把岗位、匹配分、状态、跟进时间和备注放进一张可管理的求职台账。"
      />
      <Card>
        <CardHeader title="筛选" />
        <CardContent>
          <Select value={status} onChange={(event) => setStatus(event.target.value as ApplicationStatus | "all")} className="max-w-xs">
            <option value="all">全部状态</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader title="岗位台账" description="修改状态、备注和下一次跟进日期会自动保存。" />
        <CardContent>
          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
              暂无投递记录。可在匹配报告页把岗位加入投递台账。
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="py-2">公司</th>
                    <th>岗位</th>
                    <th>匹配分</th>
                    <th>状态</th>
                    <th>投递日期</th>
                    <th>下次跟进</th>
                    <th>备注</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const job = jobs.find((value) => value.id === item.jobId);
                    const report = reports.find((value) => value.jobId === item.jobId);
                    return (
                      <tr key={item.id} className="border-t border-slate-100 align-top">
                        <td className="py-3">{job?.company || "-"}</td>
                        <td className="font-medium text-slate-950">{job?.title || "未命名岗位"}</td>
                        <td>{report ? <Badge>{report.totalScore}</Badge> : "-"}</td>
                        <td>
                          <Select value={item.status} onChange={(event) => update(item.id, { status: event.target.value as ApplicationStatus })}>
                            {Object.entries(statusLabels).map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </Select>
                        </td>
                        <td>
                          <Input type="date" value={item.appliedAt?.slice(0, 10) || ""} onChange={(event) => update(item.id, { appliedAt: event.target.value ? new Date(event.target.value).toISOString() : undefined })} />
                        </td>
                        <td>
                          <Input type="date" value={item.nextFollowUpAt?.slice(0, 10) || ""} onChange={(event) => update(item.id, { nextFollowUpAt: event.target.value ? new Date(event.target.value).toISOString() : undefined })} />
                        </td>
                        <td>
                          <Input value={item.notes} onChange={(event) => update(item.id, { notes: event.target.value })} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
