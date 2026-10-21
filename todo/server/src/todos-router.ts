// 할 일 API 라우터: main.ts에서 /api/todos 경로에 연결합니다.
import { Router, type Request, type Response } from "express";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

// title 검증 규칙: 공백 제거 후 1~100자
const titleSchema = z
  .string({ error: "title은 문자열이어야 합니다" })
  .trim()
  .min(1, "title은 1자 이상이어야 합니다")
  .max(100, "title은 100자 이하여야 합니다");

// POST /api/todos 요청 본문 검증 규칙
const createTodoSchema = z.object({
  title: titleSchema,
  completed: z.boolean({ error: "completed는 boolean이어야 합니다" }).default(false),
});

// PATCH /api/todos/:id 요청 본문 검증 규칙 (일부 필드만 보내도 됨)
const updateTodoSchema = z.object({
  title: titleSchema.optional(),
  completed: z.boolean({ error: "completed는 boolean이어야 합니다" }).optional(),
});

const todos: Todo[] = [];

export const todosRouter = Router();

// GET /api/todos: 할 일 목록을 JSON으로 응답
todosRouter.get("/", (_req: Request, res: Response) => {
  res.json(todos);
});

// POST /api/todos: 본문을 검증한 뒤 cuid2 id를 붙여 배열에 추가
todosRouter.post("/", (req: Request, res: Response) => {
  // 검증 실패 시 ZodError를 던지고, errorHandler가 400으로 응답
  const data = createTodoSchema.parse(req.body);

  const newTodo: Todo = { id: createId(), ...data };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// PATCH /api/todos/:id: title, completed 중 보낸 필드만 수정, 없으면 404
todosRouter.patch("/:id", (req: Request<{ id: string }>, res: Response) => {
  const todo = todos.find((t) => t.id === req.params.id);
  if (!todo) {
    res.status(404).json({ message: `id ${req.params.id}인 할 일을 찾을 수 없습니다` });
    return;
  }

  const data = updateTodoSchema.parse(req.body);
  if (data.title !== undefined) todo.title = data.title;
  if (data.completed !== undefined) todo.completed = data.completed;
  res.json(todo);
});

// DELETE /api/todos/:id: 할 일 삭제 후 204(본문 없음), 없으면 404
todosRouter.delete("/:id", (req: Request<{ id: string }>, res: Response) => {
  const index = todos.findIndex((t) => t.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ message: `id ${req.params.id}인 할 일을 찾을 수 없습니다` });
    return;
  }
  todos.splice(index, 1);
  res.status(204).end();
});
