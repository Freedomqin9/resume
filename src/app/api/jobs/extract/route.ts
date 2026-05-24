import { fail, ok } from "@/lib/api-response";
import { jdExtractPrompt } from "@/prompts/job-prompts";
import { generateStructuredJson } from "@/services/ai-service";
import type { ExtractedRequirements, Job } from "@/types/domain";

const extractSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "jobType",
    "coreResponsibilities",
    "hardRequirements",
    "softRequirements",
    "skills",
    "experienceRequirement",
    "educationRequirement",
    "hiddenRequirements",
    "riskSignals",
  ],
  properties: {
    jobType: { type: "string" },
    coreResponsibilities: { type: "array", items: { type: "string" } },
    hardRequirements: { type: "array", items: { type: "string" } },
    softRequirements: { type: "array", items: { type: "string" } },
    skills: { type: "array", items: { type: "string" } },
    experienceRequirement: { type: "string" },
    educationRequirement: { type: "string" },
    hiddenRequirements: { type: "array", items: { type: "string" } },
    riskSignals: { type: "array", items: { type: "string" } },
  },
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { job?: Job };
    const job = body.job;
    if (!job?.jdText || job.jdText.trim().length < 30) {
      return fail("VALIDATION_ERROR", "岗位 JD 不能为空，且至少需要 30 个字符。");
    }

    const data = await generateStructuredJson<ExtractedRequirements>({
      instructions: jdExtractPrompt,
      schemaName: "jd_extraction",
      schema: extractSchema,
      input: JSON.stringify({
        title: job.title,
        company: job.company,
        city: job.city,
        salary: job.salary,
        jdText: job.jdText,
      }),
    });

    return ok(data);
  } catch (error) {
    return fail(
      "AI_SERVICE_ERROR",
      error instanceof Error ? error.message : "岗位要求提取失败。",
      502,
    );
  }
}
