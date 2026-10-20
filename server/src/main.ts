// Section 10 Express 서버의 시작 파일입니다. 실행: 저장소 루트에서 npm run dev:server
import express, { type Application, type NextFunction, type Request, type Response } from "express";
import { booksRouter } from "./books-router.js";
import { errorHandler } from "./error-handler.js";

const app: Application = express();

// 로그 미들웨어: 모든 요청의 메서드와 경로를 출력
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use(express.json()); // 요청 본문의 JSON을 파싱해 req.body에 넣음

// 도서 API는 books-router.ts에서 처리
app.use("/books", booksRouter);

// 오류 처리 미들웨어는 모든 라우트 뒤, 맨 마지막에 등록
app.use(errorHandler);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
