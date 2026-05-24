import type { ApiErrorCode, ApiResponse } from "@/types/domain";

export function ok<T>(data: T, message = "ok"): Response {
  const body: ApiResponse<T> = {
    success: true,
    data,
    message,
    error: null,
  };
  return Response.json(body);
}

export function fail(
  code: ApiErrorCode,
  detail: string,
  status = 400,
  message = "请求失败",
): Response {
  const body: ApiResponse<never> = {
    success: false,
    data: null,
    message,
    error: {
      code,
      detail,
    },
  };
  return Response.json(body, { status });
}
