// 도서 API 라우터: main.ts에서 /books 경로에 연결합니다.
import { Router, type Request, type Response } from "express";
import { z } from "zod";

type Book = {
  id: number;
  title: string;
  author: string;
  price: number;
};

// POST /books 요청 본문 검증 규칙
const createBookSchema = z.object({
  title: z
    .string({ error: "title은 문자열이어야 합니다" })
    .trim()
    .min(1, "title은 1자 이상이어야 합니다")
    .max(100, "title은 100자 이하여야 합니다"),
  author: z
    .string({ error: "author는 필수 문자열입니다" })
    .trim()
    .min(1, "author는 비어 있을 수 없습니다"),
  price: z
    .number({ error: "price는 숫자여야 합니다" })
    .positive("price는 양수여야 합니다"),
});

const books: Book[] = [
  { id: 1, title: "타입스크립트 입문", author: "홍길동", price: 25000 },
  { id: 2, title: "Express 실전", author: "김철수", price: 30000 },
];

// 다음에 붙일 id. 삭제해도 줄이지 않아 id가 겹치지 않음
let nextId = 3;

export const booksRouter = Router();

// GET /books: 도서 목록을 JSON으로 응답
booksRouter.get("/", (_req: Request, res: Response) => {
  res.json(books);
});

// GET /books/:id: 도서 한 권 조회, 없으면 404
booksRouter.get("/:id", (req: Request<{ id: string }>, res: Response) => {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) {
    res.status(404).json({ message: `id ${req.params.id}인 도서를 찾을 수 없습니다` });
    return;
  }
  res.json(book);
});

// POST /books: 본문을 검증한 뒤 id를 붙여 배열에 추가
booksRouter.post("/", (req: Request, res: Response) => {
  // 검증 실패 시 ZodError를 던지고, errorHandler가 400으로 응답
  const data = createBookSchema.parse(req.body);

  const newBook: Book = { id: nextId++, ...data };
  books.push(newBook);
  res.status(201).json(newBook);
});

// DELETE /books/:id: 도서 삭제 후 204(본문 없음), 없으면 404
booksRouter.delete("/:id", (req: Request<{ id: string }>, res: Response) => {
  const index = books.findIndex((b) => b.id === Number(req.params.id));
  if (index === -1) {
    res.status(404).json({ message: `id ${req.params.id}인 도서를 찾을 수 없습니다` });
    return;
  }
  books.splice(index, 1);
  res.status(204).end();
});
