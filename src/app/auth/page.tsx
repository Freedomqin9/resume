"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/form";
import { setStore } from "@/lib/local-store";
import { todayIso, uid } from "@/lib/utils";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("子椰");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function submit() {
    setError("");
    if (!email) return setError("请输入邮箱");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("邮箱格式不正确");
    if (password.length < 8) return setError("密码至少 8 位");
    if (mode === "register" && password !== confirm) return setError("两次密码不一致");
    if (mode === "register" && !agree) return setError("请勾选用户协议和隐私政策");

    setLoading(true);
    window.setTimeout(() => {
      setStore("authUser", {
        id: uid("user"),
        email,
        name: name || email.split("@")[0],
        createdAt: todayIso(),
      });
      router.replace("/dashboard");
    }, 300);
  }

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="hidden border-r border-slate-200 bg-white p-10 lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-600 text-white">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold text-slate-950">JobPilot AI</span>
        </div>
        <div>
          <h1 className="max-w-lg text-4xl font-bold leading-tight text-slate-950">
            把求职判断、简历证据和投递进度放进一个专业工作台
          </h1>
          <p className="mt-5 max-w-md leading-7 text-slate-600">
            第一版使用本地账号和浏览器存储，适合个人演示和功能验证；后续可接入 Supabase Auth 与 PostgreSQL。
          </p>
        </div>
        <p className="text-sm text-slate-500">你的数据当前仅保存在本机浏览器。</p>
      </section>

      <section className="flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-950">
                {mode === "login" ? "登录" : "注册"}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                使用本地演示账号进入 JobPilot AI 工作台。
              </p>
            </div>
            <div className="grid gap-4">
              {mode === "register" ? (
                <Field label="姓名">
                  <Input value={name} onChange={(event) => setName(event.target.value)} />
                </Field>
              ) : null}
              <Field label="邮箱">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </Field>
              <Field label="密码" hint="至少 8 位">
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </Field>
              {mode === "register" ? (
                <>
                  <Field label="确认密码">
                    <Input
                      type="password"
                      value={confirm}
                      onChange={(event) => setConfirm(event.target.value)}
                    />
                  </Field>
                  <label className="flex items-start gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={agree}
                      onChange={(event) => setAgree(event.target.checked)}
                      className="mt-1"
                    />
                    我已阅读并同意用户协议和隐私政策。
                  </label>
                </>
              ) : null}
              {error ? (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}
              <Button onClick={submit} disabled={loading}>
                {loading ? "处理中..." : mode === "login" ? "登录" : "注册"}
              </Button>
              <button
                className="text-sm font-medium text-blue-700"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
              >
                {mode === "login" ? "没有账号？立即注册" : "已有账号？返回登录"}
              </button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
