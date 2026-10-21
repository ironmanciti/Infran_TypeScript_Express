// 할 일 API의 시작 파일입니다.
// 실행: 저장소 루트에서 npm run dev:todo (http://localhost:3000)
import cors from "cors";
import express, { type Application, type NextFunction, type Request, type Response } from "express";
import path from "node:path";
import { errorHandler } from "./error-handler.js";
import { todosRouter } from "./todos-router.js";

const app: Application = express();

// 로그 미들웨어: 모든 요청의 메서드와 경로를 출력
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Vite 개발 서버(localhost:5173)에서 오는 요청만 허용
app.use(cors({ origin: "http://localhost:5173" }));

app.use(express.json()); // 요청 본문의 JSON을 파싱해 req.body에 넣음

// 할 일 API는 todos-router.ts에서 처리
app.use("/api/todos", todosRouter);

// 배포용: 빌드된 화면(todo/client/dist)을 정적 파일로 제공
// src(개발)와 dist(배포) 모두 두 단계 위가 todo/ 폴더
const clientDist: string = path.resolve(import.meta.dirname, "../../client/dist");
app.use(express.static(clientDist));

// 오류 처리 미들웨어는 모든 라우트 뒤, 맨 마지막에 등록
app.use(errorHandler);

// 배포 환경이 정한 포트를 쓰고, 없으면 3000
const port: number = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
