type JsonSchema = Record<string, unknown>;

type OpenAIResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  error?: {
    message?: string;
  };
};

export class AiServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiServiceError";
  }
}

function extractOutputText(payload: OpenAIResponse) {
  if (payload.output_text) return payload.output_text;

  const text = payload.output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text)
    .filter((value): value is string => Boolean(value))
    .join("\n");

  return text ?? "";
}

function safeParseJson<T>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new AiServiceError("AI 返回内容不是有效 JSON。");
    }
    return JSON.parse(match[0]) as T;
  }
}

export async function generateStructuredJson<T>({
  instructions,
  input,
  schema,
  schemaName,
}: {
  instructions: string;
  input: string;
  schema: JsonSchema;
  schemaName: string;
}): Promise<T> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new AiServiceError("缺少 OPENAI_API_KEY，请在 .env.local 中配置后重试。");
  }

  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      instructions,
      input,
      text: {
        format: {
          type: "json_schema",
          name: schemaName,
          strict: true,
          schema,
        },
      },
    }),
  });

  const payload = (await response.json()) as OpenAIResponse;
  if (!response.ok) {
    throw new AiServiceError(payload.error?.message || "OpenAI 服务调用失败。");
  }

  const outputText = extractOutputText(payload);
  if (!outputText) {
    throw new AiServiceError("AI 返回内容为空。");
  }

  return safeParseJson<T>(outputText);
}
