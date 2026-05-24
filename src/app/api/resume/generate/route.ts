import { fail, ok } from "@/lib/api-response";
import { resumePrompt } from "@/prompts/job-prompts";
import { generateStructuredJson } from "@/services/ai-service";
import type { Job, MatchReport, Profile, ResumeMode } from "@/types/domain";

type AiResume = {
  resumeTitle: string;
  summary: string;
  skillsSection: string;
  workSection: string;
  projectSection: string;
  selfEvaluation: string;
  hrMessage: string;
  interviewIntro: string;
};

const resumeSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "resumeTitle",
    "summary",
    "skillsSection",
    "workSection",
    "projectSection",
    "selfEvaluation",
    "hrMessage",
    "interviewIntro",
  ],
  properties: {
    resumeTitle: { type: "string" },
    summary: { type: "string" },
    skillsSection: { type: "string" },
    workSection: { type: "string" },
    projectSection: { type: "string" },
    selfEvaluation: { type: "string" },
    hrMessage: { type: "string" },
    interviewIntro: { type: "string" },
  },
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      profile?: Profile;
      job?: Job;
      report?: MatchReport;
      mode?: ResumeMode;
    };
    if (!body.profile) return fail("VALIDATION_ERROR", "请先填写职业画像。");
    if (!body.job) return fail("VALIDATION_ERROR", "请先选择岗位。");
    if (!body.report) return fail("VALIDATION_ERROR", "请先生成匹配报告。");

    const data = await generateStructuredJson<AiResume>({
      instructions: resumePrompt,
      schemaName: "resume_rewrite",
      schema: resumeSchema,
      input: JSON.stringify({
        mode: body.mode || "career_transition",
        profile: body.profile,
        job: body.job,
        matchReport: body.report,
      }),
    });

    return ok(data);
  } catch (error) {
    return fail(
      "AI_SERVICE_ERROR",
      error instanceof Error ? error.message : "简历生成失败。",
      502,
    );
  }
}
