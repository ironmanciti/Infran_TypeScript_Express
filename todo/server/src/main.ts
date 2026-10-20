// 할 일 API의 시작 파일입니다.
// 실행: 저장소 루트에서 npm run dev:todo (http://localhost:3000)
import express, { type Application } from "express";
import cors from "cors";
import { todosRouter } from "./todos-router.js";
import { errorHandler } from "./error-handler.js";

const app: Application = express();

// 프런트엔드 개발 서버(localhost:5173)의 요청만 허용
app.use(cors({ origin: "http://localhost:5173" }));

app.use(express.json()); // 요청 본문의 JSON을 파싱해 req.body에 넣음

// 할 일 API는 todos-router.ts에서 처리
app.use("/api/todos", todosRouter);

// 오류 처리 미들웨어는 모든 라우트 뒤, 맨 마지막에 등록
app.use(errorHandler);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
