"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  BriefcaseBusiness,
  ClipboardList,
  FileText,
  Home,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  Target,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStore, setStore } from "@/lib/local-store";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/types/domain";

const navItems = [
  { href: "/dashboard", label: "工作台", icon: BarChart3 },
  { href: "/profile", label: "职业画像", icon: UserRound },
  { href: "/jd-analysis", label: "JD 分析", icon: ClipboardList },
  { href: "/match", label: "匹配报告", icon: Target },
  { href: "/resume", label: "简历重构", icon: FileText },
  { href: "/applications", label: "投递管理", icon: BriefcaseBusiness },
  { href: "/settings", label: "设置", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const authUser = getStore("authUser");
      setUser(authUser);
      if (!authUser) router.replace("/auth");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [router]);

  function logout() {
    setStore("authUser", null);
    router.replace("/");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-600 text-white">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold text-slate-950">JobPilot AI</span>
          </Link>
          <div className="hidden items-center gap-3 md:flex">
            <div className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
              {user?.email || "本地演示账号"}
            </div>
            <Button variant="ghost" onClick={logout}>
              <LogOut className="h-4 w-4" />
              退出
            </Button>
          </div>
          <button
            className="focus-ring rounded-md p-2 md:hidden"
            aria-label="打开导航"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 border-r border-slate-200 bg-white p-4 md:block">
          <nav className="grid gap-1">
            {navItems.map((item) => (
              <NavLink key={item.href} active={pathname === item.href} {...item} />
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {open ? (
        <div className="fixed inset-0 z-40 bg-slate-950/30 md:hidden">
          <div className="h-full w-72 bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-bold text-slate-950">JobPilot AI</span>
              <button
                className="focus-ring rounded-md p-2"
                aria-label="关闭导航"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="grid gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  active={pathname === item.href}
                  onClick={() => setOpen(false)}
                  {...item}
                />
              ))}
            </nav>
            <Button className="mt-4 w-full" variant="secondary" onClick={logout}>
              <LogOut className="h-4 w-4" />
              退出
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
        active
          ? "bg-blue-50 text-blue-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
