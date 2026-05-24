"use client";

import type {
  Application,
  AuthUser,
  Job,
  MatchReport,
  Profile,
  ResumeVersion,
} from "@/types/domain";

const prefix = "jobpilot_ai";

type StoreMap = {
  authUser: AuthUser | null;
  profile: Profile | null;
  jobs: Job[];
  matchReports: MatchReport[];
  resumes: ResumeVersion[];
  applications: Application[];
};

const defaults: StoreMap = {
  authUser: null,
  profile: null,
  jobs: [],
  matchReports: [],
  resumes: [],
  applications: [],
};

function key(name: keyof StoreMap) {
  return `${prefix}_${name}`;
}

export function getStore<K extends keyof StoreMap>(name: K): StoreMap[K] {
  if (typeof window === "undefined") return defaults[name];
  const value = window.localStorage.getItem(key(name));
  if (!value) return defaults[name];
  try {
    return JSON.parse(value) as StoreMap[K];
  } catch {
    return defaults[name];
  }
}

export function setStore<K extends keyof StoreMap>(name: K, value: StoreMap[K]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key(name), JSON.stringify(value));
  window.dispatchEvent(new Event("jobpilot-storage"));
}

export function clearAllStore() {
  if (typeof window === "undefined") return;
  (Object.keys(defaults) as Array<keyof StoreMap>).forEach((name) => {
    window.localStorage.removeItem(key(name));
  });
  window.dispatchEvent(new Event("jobpilot-storage"));
}
