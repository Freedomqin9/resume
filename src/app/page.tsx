import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  FileText,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const pains = ["不知道岗位适不适合", "简历不知道怎么改", "投递很多没反馈", "转行方向混乱"];
const features = [
  { icon: UserRound, title: "职业画像", text: "沉淀经历、技能、限制和目标方向。" },
  { icon: ClipboardList, title: "JD 分析", text: "提取岗位职责、硬性要求和风险信号。" },
  { icon: Target, title: "匹配评分", text: "把适配度拆成技能、经历、方向和偏好。" },
  { icon: FileText, title: "简历重构", text: "按岗位重写真实经历和证据表达。" },
  { icon: BriefcaseBusiness, title: "投递管理", text: "记录状态、备注、跟进时间和简历版本。" },
  { icon: BarChart3, title: "面试准备", text: "从风险点反推需要准备的解释材料。" },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-600 text-white">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold text-slate-950">JobPilot AI</span>
          </Link>
          <Link href="/auth">
            <Button variant="secondary">登录 / 注册</Button>
          </Link>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              <ShieldCheck className="h-4 w-4" />
              面向转行求职者的 AI 求职决策工作台
            </div>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
              让 AI 帮你判断：这个岗位到底值不值得投
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              JobPilot AI 会根据你的经历、技能、项目和目标岗位，分析岗位匹配度、简历差距与投递策略，帮助你少走弯路。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/auth">
                <Button className="w-full sm:w-auto">
                  开始免费分析
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#sample">
                <Button className="w-full sm:w-auto" variant="secondary">
                  查看示例报告
                </Button>
              </Link>
            </div>
          </div>
          <Card id="sample" className="self-end">
            <CardContent className="space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">示例报告</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    AI 产品助理 · 西安
                  </h2>
                </div>
                <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
                  82 / 100
                </span>
              </div>
              <div className="grid gap-3">
                {["流程制度与需求拆解经历可迁移", "AI 工具探索可作为项目证据", "PRD 和原型作品证据仍需补强"].map(
                  (item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-md border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700"
                    >
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      {item}
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-4">
          {pains.map((pain) => (
            <Card key={pain}>
              <CardContent>
                <p className="font-semibold text-slate-950">{pain}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardContent>
                <feature.icon className="mb-4 h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-slate-950">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{feature.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
