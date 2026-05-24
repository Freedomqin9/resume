import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { MatchLevel } from "@/types/domain";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function todayIso() {
  return new Date().toISOString();
}

export function clampScore(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, Math.round(number)));
}

export function getMatchLevel(score: number): MatchLevel {
  if (score >= 85) return "strongly_recommended";
  if (score >= 70) return "recommended";
  if (score >= 55) return "cautious";
  return "not_recommended";
}

export function matchLevelText(level: MatchLevel) {
  const map: Record<MatchLevel, string> = {
    strongly_recommended: "强烈推荐",
    recommended: "推荐",
    cautious: "谨慎",
    not_recommended: "不推荐",
  };
  return map[level];
}

export function scoreTone(score: number) {
  if (score >= 85) return "text-green-700 bg-green-50 border-green-200";
  if (score >= 70) return "text-blue-700 bg-blue-50 border-blue-200";
  if (score >= 55) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-red-700 bg-red-50 border-red-200";
}

export function splitTextList(value: string) {
  return value
    .split(/[,，、\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
