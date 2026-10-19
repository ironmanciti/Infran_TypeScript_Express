// Express로 만든 첫 API 샘플
// 실행: 저장소 루트에서 npm run dev:server
// 이후 실습에서는 AI에게 이 파일을 새 코드로 바꿔 쓰게 합니다.
import express, { type Application, type Request, type Response } from "express";

const app: Application = express();
app.use(express.json()); // 요청 본문의 JSON을 파싱해 req.body에 넣음

const users = [
  { id: 1, name: "John" },
  { id: 2, name: "Jane" },
];

// GET /: HTML 응답
app.get("/", (_req: Request, res: Response) => {
  res.send("<h1>Hello World</h1>");
});

// GET /users: JSON 응답
app.get("/users", (_req: Request, res: Response) => {
  res.json(users); // Content-Type: application/json
});

// POST /users: 클라이언트가 보낸 JSON을 받아 그대로 돌려줌
app.post("/users", (req: Request, res: Response) => {
  console.log(req.body); // 클라이언트가 보낸 JSON (any)
  res.status(201).json(req.body);
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
