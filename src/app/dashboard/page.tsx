"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BriefcaseBusiness, ClipboardList, FileText, Target } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Badge, Card, CardContent, CardHeader } from "@/components/ui/card";
import { getStore } from "@/lib/local-store";
import { matchLevelText, scoreTone } from "@/lib/utils";
import type { Application, AuthUser, Job, MatchReport, Profile } from "@/types/domain";

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [reports, setReports] = useState<MatchReport[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setUser(getStore("authUser"));
      setProfile(getStore("profile"));
      setJobs(getStore("jobs"));
      setReports(getStore("matchReports"));
      setApplications(getStore("applications"));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const highMatch = reports.filter((report) => report.totalScore >= 70).length;
  const applied = applications.filter((item) => item.status === "applied").length;
  const followUp = applications.filter((item) => item.status === "follow_up").length;
  const latestReports = reports.slice(-5).reverse();

  return (
    <AppShell>
      <PageHeading
        title={`你好，${profile?.name || user?.name || "求职者"}`}
        description="今天建议优先处理高匹配岗位、完善画像证据，并把已投递岗位更新到台账。"
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="已分析岗位" value={jobs.length} icon={<ClipboardList />} />
        <Metric title="高匹配岗位" value={highMatch} icon={<Target />} />
        <Metric title="已投递岗位" value={applied} icon={<BriefcaseBusiness />} />
        <Metric title="待跟进岗位" value={followUp} icon={<FileText />} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader
            title="核心行动"
            description="优先完成职业画像，再粘贴 JD 生成匹配报告。"
          />
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <Action href="/jd-analysis" title="粘贴 JD 进行分析" />
            <Action href="/profile" title="完善职业画像" />
            <Action href="/resume" title="生成定制简历" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="待办事项" />
          <CardContent className="grid gap-3 text-sm text-slate-600">
            <Todo done={Boolean(profile?.profileCompletion && profile.profileCompletion > 70)}>
              完善项目经历和技能证据
            </Todo>
            <Todo done={reports.length > 0}>分析至少 1 个目标岗位</Todo>
            <Todo done={applications.length > 0}>把适合岗位加入投递台账</Todo>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="最近分析报告" description="查看最新岗位的匹配分和推荐等级。" />
        <CardContent>
          {latestReports.length === 0 ? (
            <Empty message="你还没有分析任何岗位。粘贴一个 JD，让 AI 帮你判断是否值得投递。" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="py-2">岗位</th>
                    <th>公司</th>
                    <th>匹配分</th>
                    <th>等级</th>
                    <th>创建时间</th>
                  </tr>
                </thead>
                <tbody>
                  {latestReports.map((report) => {
                    const job = jobs.find((item) => item.id === report.jobId);
                    return (
                      <tr key={report.id} className="border-t border-slate-100">
                        <td className="py-3 font-medium text-slate-950">{job?.title || "未命名岗位"}</td>
                        <td>{job?.company || "-"}</td>
                        <td>{report.totalScore}</td>
                        <td>
                          <Badge className={scoreTone(report.totalScore)}>
                            {matchLevelText(report.matchLevel)}
                          </Badge>
                        </td>
                        <td>{new Date(report.createdAt).toLocaleString("zh-CN")}</td>
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

function Metric({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">{title}</p>
          <span className="text-blue-600 [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
        </div>
        <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p>
        <p className="mt-1 text-xs text-slate-500">本地数据统计</p>
      </CardContent>
    </Card>
  );
}

function Action({ href, title }: { href: string; title: string }) {
  return (
    <Link href={href}>
      <Button className="w-full justify-between" variant="secondary">
        {title}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </Link>
  );
}

function Todo({ done, children }: { done: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className={done ? "h-2 w-2 rounded-full bg-green-500" : "h-2 w-2 rounded-full bg-amber-500"} />
      {children}
    </div>
  );
}

function Empty({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}
