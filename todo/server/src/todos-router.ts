// 할 일 API 라우터: main.ts에서 /api/todos 경로에 연결합니다.
import { createId } from "@paralleldrive/cuid2";
import { Router, type Request, type Response } from "express";
import { z } from "zod";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string | null; // 마감일 YYYY-MM-DD, 없으면 null
};

// title 검증 규칙: 앞뒤 공백을 제거한 뒤 1~100자
const titleSchema = z
  .string({ error: "title은 문자열이어야 합니다" })
  .trim()
  .min(1, "title은 1자 이상이어야 합니다")
  .max(100, "title은 100자 이하여야 합니다");

// dueDate 검증 규칙: 실제 있는 날짜의 YYYY-MM-DD 문자열, null이면 마감일 없음
const dueDateSchema = z.iso.date({ error: "dueDate는 YYYY-MM-DD 형식의 날짜여야 합니다" }).nullable();

// POST /api/todos 요청 본문 검증 규칙
const createTodoSchema = z.object({
  title: titleSchema,
  completed: z.boolean({ error: "completed는 boolean이어야 합니다" }).default(false),
  dueDate: dueDateSchema.default(null),
});

// PATCH /api/todos/:id 요청 본문 검증 규칙: 보낸 필드만 수정 (dueDate: null은 마감일 지우기)
const updateTodoSchema = z.object({
  title: titleSchema.optional(),
  completed: z.boolean({ error: "completed는 boolean이어야 합니다" }).optional(),
  dueDate: dueDateSchema.optional(),
});

// GET /api/todos 쿼리 검증 규칙: completed는 "true" 또는 "false" 문자열, 불리언으로 변환
const listQuerySchema = z.object({
  completed: z
    .enum(["true", "false"], { error: "completed는 true 또는 false여야 합니다" })
    .transform((value) => value === "true")
    .optional(),
});

// 데이터는 메모리 배열에 보관 (서버를 다시 시작하면 초기화됨)
const todos: Todo[] = [];

export const todosRouter = Router();

// 마감일이 빠른 순, 마감일이 없으면 맨 뒤 (같으면 추가한 순서 유지)
function compareByDueDate(a: Todo, b: Todo): number {
  if (a.dueDate === b.dueDate) return 0;
  if (a.dueDate === null) return 1;
  if (b.dueDate === null) return -1;
  return a.dueDate < b.dueDate ? -1 : 1; // YYYY-MM-DD는 문자열 비교로 순서가 맞음
}

// GET /api/todos: 할 일 목록을 마감일 순으로 응답, ?completed=true|false면 그 상태만
todosRouter.get("/", (req: Request, res: Response) => {
  // 검증 실패 시 ZodError를 던지고, errorHandler가 400으로 응답
  const { completed } = listQuerySchema.parse(req.query);
  const list = completed === undefined ? todos : todos.filter((t) => t.completed === completed);
  res.json(list.toSorted(compareByDueDate));
});

// POST /api/todos: 본문을 검증한 뒤 id를 붙여 배열에 추가
todosRouter.post("/", (req: Request, res: Response) => {
  // 검증 실패 시 ZodError를 던지고, errorHandler가 400으로 응답
  const data = createTodoSchema.parse(req.body);

  const newTodo: Todo = { id: createId(), ...data };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// PATCH /api/todos/:id: title, completed, dueDate 중 보낸 값만 수정, 없으면 404
todosRouter.patch("/:id", (req: Request<{ id: string }>, res: Response) => {
  const todo = todos.find((t) => t.id === req.params.id);
  if (!todo) {
    res.status(404).json({ message: `id ${req.params.id}인 할 일을 찾을 수 없습니다` });
    return;
  }

  const data = updateTodoSchema.parse(req.body);
  if (data.title !== undefined) todo.title = data.title;
  if (data.completed !== undefined) todo.completed = data.completed;
  if (data.dueDate !== undefined) todo.dueDate = data.dueDate;
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
