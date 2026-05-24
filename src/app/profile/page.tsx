"use client";

import { useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { getStore, setStore } from "@/lib/local-store";
import { todayIso, uid } from "@/lib/utils";
import type { Profile } from "@/types/domain";

const fields: Array<keyof Profile> = [
  "name",
  "currentCity",
  "targetCities",
  "education",
  "major",
  "workYears",
  "targetRoles",
  "workExperience",
  "projectExperience",
  "skills",
  "careerGoal",
];

const emptyProfile: Profile = {
  id: "",
  userId: "",
  name: "",
  currentCity: "",
  targetCities: "",
  education: "",
  major: "",
  graduationYear: "",
  workYears: "",
  currentStatus: "转行",
  targetRoles: "",
  backupRoles: "",
  expectedSalary: "",
  minSalary: "",
  rejectedRoles: "",
  rejectedIndustries: "",
  workExperience: "",
  projectExperience: "",
  skills: "",
  careerGoal: "",
  profileCompletion: 0,
  updatedAt: "",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [savedAt, setSavedAt] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const user = getStore("authUser");
      const stored = getStore("profile");
      setProfile(
        stored || {
          ...emptyProfile,
          id: uid("profile"),
          userId: user?.id || "local-user",
          updatedAt: todayIso(),
        },
      );
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const completion = useMemo(() => {
    const filled = fields.filter((field) => String(profile[field] || "").trim()).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    const draft = {
      ...profile,
      [key]: value,
      updatedAt: todayIso(),
    };
    const nextCompletion = Math.round(
      (fields.filter((field) => String(draft[field] || "").trim()).length / fields.length) * 100,
    );
    const next = { ...draft, profileCompletion: nextCompletion };
    setProfile(next);
    setStore("profile", next);
    setSavedAt(new Date().toLocaleTimeString("zh-CN"));
  }

  function save() {
    const next = { ...profile, profileCompletion: completion, updatedAt: todayIso() };
    setProfile(next);
    setStore("profile", next);
    setSavedAt(new Date().toLocaleTimeString("zh-CN"));
  }

  return (
    <AppShell>
      <PageHeading
        title="职业画像"
        description="让系统理解你的经历、目标岗位、可迁移能力和求职限制，这是后续匹配分析的基础。"
      />

      <Card className="mb-6">
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">画像完成度</p>
              <div className="mt-2 h-3 w-full rounded-full bg-slate-100 sm:w-80">
                <div className="h-3 rounded-full bg-blue-600" style={{ width: `${completion}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              {savedAt ? <span className="text-sm text-slate-500">已自动保存 {savedAt}</span> : null}
              <Button onClick={save}>
                <Save className="h-4 w-4" />
                保存画像
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Section title="Step 1 基本信息">
          <Field label="姓名">
            <Input value={profile.name} onChange={(event) => update("name", event.target.value)} />
          </Field>
          <Field label="当前城市">
            <Input value={profile.currentCity} onChange={(event) => update("currentCity", event.target.value)} />
          </Field>
          <Field label="目标城市">
            <Input value={profile.targetCities} onChange={(event) => update("targetCities", event.target.value)} placeholder="西安、远程" />
          </Field>
          <Field label="当前状态">
            <Select value={profile.currentStatus} onChange={(event) => update("currentStatus", event.target.value)}>
              <option>在职</option>
              <option>离职</option>
              <option>应届</option>
              <option>转行</option>
            </Select>
          </Field>
          <Field label="学历">
            <Input value={profile.education} onChange={(event) => update("education", event.target.value)} />
          </Field>
          <Field label="专业">
            <Input value={profile.major} onChange={(event) => update("major", event.target.value)} />
          </Field>
          <Field label="毕业时间">
            <Input value={profile.graduationYear} onChange={(event) => update("graduationYear", event.target.value)} />
          </Field>
          <Field label="工作年限">
            <Input value={profile.workYears} onChange={(event) => update("workYears", event.target.value)} />
          </Field>
        </Section>

        <Section title="Step 2 求职目标">
          <Field label="主要求职方向">
            <Input value={profile.targetRoles} onChange={(event) => update("targetRoles", event.target.value)} />
          </Field>
          <Field label="备选求职方向">
            <Input value={profile.backupRoles} onChange={(event) => update("backupRoles", event.target.value)} />
          </Field>
          <Field label="期望薪资">
            <Input value={profile.expectedSalary} onChange={(event) => update("expectedSalary", event.target.value)} />
          </Field>
          <Field label="最低可接受薪资">
            <Input value={profile.minSalary} onChange={(event) => update("minSalary", event.target.value)} />
          </Field>
          <Field label="不考虑岗位">
            <Input value={profile.rejectedRoles} onChange={(event) => update("rejectedRoles", event.target.value)} />
          </Field>
          <Field label="不考虑行业">
            <Input value={profile.rejectedIndustries} onChange={(event) => update("rejectedIndustries", event.target.value)} />
          </Field>
        </Section>

        <Section title="Step 3-6 经历、项目与技能">
          <Field label="工作经历" hint="写核心职责、关键成果、工具、协作和量化结果。">
            <Textarea value={profile.workExperience} onChange={(event) => update("workExperience", event.target.value)} />
          </Field>
          <Field label="项目经历" hint="写项目背景、角色、解决问题、方法、结果和可迁移能力。">
            <Textarea value={profile.projectExperience} onChange={(event) => update("projectExperience", event.target.value)} />
          </Field>
          <Field label="技能清单">
            <Textarea value={profile.skills} onChange={(event) => update("skills", event.target.value)} />
          </Field>
          <Field label="职业目标">
            <Textarea value={profile.careerGoal} onChange={(event) => update("careerGoal", event.target.value)} />
          </Field>
        </Section>
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader title={title} />
      <CardContent className="grid gap-4 md:grid-cols-2">{children}</CardContent>
    </Card>
  );
}
