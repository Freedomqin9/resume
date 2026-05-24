import { fail, ok } from "@/lib/api-response";
import { clampScore, getMatchLevel } from "@/lib/utils";
import { matchPrompt } from "@/prompts/job-prompts";
import { generateStructuredJson } from "@/services/ai-service";
import type { Job, MatchLevel, Profile } from "@/types/domain";

type AiMatch = {
  totalScore: number;
  skillScore: number;
  experienceScore: number;
  directionScore: number;
  growthScore: number;
  successScore: number;
  salaryCityScore: number;
  matchReasons: string[];
  riskPoints: string[];
  resumeSuggestions: string[];
  interviewSuggestions: string[];
  nextAction: string;
};

const matchSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "totalScore",
    "skillScore",
    "experienceScore",
    "directionScore",
    "growthScore",
    "successScore",
    "salaryCityScore",
    "matchReasons",
    "riskPoints",
    "resumeSuggestions",
    "interviewSuggestions",
    "nextAction",
  ],
  properties: {
    totalScore: { type: "integer", minimum: 0, maximum: 100 },
    skillScore: { type: "integer", minimum: 0, maximum: 100 },
    experienceScore: { type: "integer", minimum: 0, maximum: 100 },
    directionScore: { type: "integer", minimum: 0, maximum: 100 },
    growthScore: { type: "integer", minimum: 0, maximum: 100 },
    successScore: { type: "integer", minimum: 0, maximum: 100 },
    salaryCityScore: { type: "integer", minimum: 0, maximum: 100 },
    matchReasons: { type: "array", items: { type: "string" } },
    riskPoints: { type: "array", items: { type: "string" } },
    resumeSuggestions: { type: "array", items: { type: "string" } },
    interviewSuggestions: { type: "array", items: { type: "string" } },
    nextAction: { type: "string" },
  },
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { job?: Job; profile?: Profile };
    if (!body.profile || body.profile.profileCompletion < 20) {
      return fail("VALIDATION_ERROR", "请先填写职业画像。");
    }
    if (!body.job?.jdText || body.job.jdText.trim().length < 30) {
      return fail("VALIDATION_ERROR", "岗位 JD 不能为空，且至少需要 30 个字符。");
    }

    const ai = await generateStructuredJson<AiMatch>({
      instructions: matchPrompt,
      schemaName: "match_report",
      schema: matchSchema,
      input: JSON.stringify({
        profile: body.profile,
        job: body.job,
        scoringModel: "规则评分 40%，AI 语义评分 40%，用户偏好评分 20%。",
      }),
    });

    const totalScore = clampScore(ai.totalScore);
    const matchLevel: MatchLevel = getMatchLevel(totalScore);

    return ok({
      totalScore,
      matchLevel,
      skillScore: clampScore(ai.skillScore),
      experienceScore: clampScore(ai.experienceScore),
      directionScore: clampScore(ai.directionScore),
      growthScore: clampScore(ai.growthScore),
      successScore: clampScore(ai.successScore),
      salaryCityScore: clampScore(ai.salaryCityScore),
      matchReasons: ai.matchReasons,
      riskPoints: ai.riskPoints,
      resumeSuggestions: ai.resumeSuggestions,
      interviewSuggestions: ai.interviewSuggestions,
      nextAction: ai.nextAction,
    });
  } catch (error) {
    return fail(
      "AI_SERVICE_ERROR",
      error instanceof Error ? error.message : "匹配分析失败。",
      502,
    );
  }
}
