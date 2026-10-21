// 오류 처리 미들웨어: 라우트에서 던진 오류를 모두 JSON으로 응답합니다.
// 인자가 4개여야 Express가 오류 처리 미들웨어로 인식하므로 _next도 남겨 둡니다.
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // Zod 검증 실패(요청 본문, 쿼리) → 400, 필드별 오류
  if (err instanceof z.ZodError) {
    res.status(400).json({
      message: "요청 값이 올바르지 않습니다",
      errors: z.flattenError(err).fieldErrors,
    });
    return;
  }

  // express.json이 던진 오류(깨진 JSON 등)는 status를 가지고 있음
  const status =
    typeof err === "object" && err !== null && "status" in err && typeof err.status === "number"
      ? err.status
      : 500;

  if (status >= 500) console.error(err);

  res.status(status).json({
    message: status >= 500 ? "서버 내부 오류가 발생했습니다" : (err as Error).message,
  });
}
