// 할 일 API(/api/todos) 요청 모음: 모든 서버 호출은 request를 거치고, 응답은 Zod로 검증합니다.
import { z } from "zod";

const BASE_URL = "/api/todos";

// 서버가 보내는 할 일 한 개의 모양
export const todoSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
  dueDate: z.iso.date().nullable(), // 마감일 YYYY-MM-DD, 없으면 null
});

export const todoListSchema = z.array(todoSchema);

// 실패 응답 본문: 400, 404, 500 모두 message를 가지고, 400은 필드별 errors도 가짐
const errorBodySchema = z.object({
  message: z.string(),
  errors: z.record(z.string(), z.array(z.string()).optional()).optional(),
});

// 필드별 오류가 있으면 그 문구를, 없으면 message를 사용합니다.
function toErrorMessage(body: z.infer<typeof errorBodySchema>): string {
  const fieldMessages = Object.values(body.errors ?? {}).flatMap((messages) => messages ?? []);
  return fieldMessages.length > 0 ? fieldMessages.join(", ") : body.message;
}

export type Todo = z.infer<typeof todoSchema>;

// fetch 후 실패 응답이면 서버 message로 Error를 던지고, 성공 응답은 schema로 검증해 돌려줍니다.
// 204(본문 없음)는 undefined를 schema로 검증합니다.
export async function request<T>(path: string, schema: z.ZodType<T>, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body !== undefined) headers.set("Content-Type", "application/json");

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (!res.ok) {
    const body: unknown = await res.json().catch(() => undefined);
    const parsed = errorBodySchema.safeParse(body);
    throw new Error(parsed.success ? toErrorMessage(parsed.data) : `요청이 실패했습니다 (${res.status})`);
  }

  if (res.status === 204) return schema.parse(undefined);
  return schema.parse(await res.json());
}

// GET /api/todos: completed를 주면 ?completed= 쿼리로 서버에서 거름
export function getTodos(completed?: boolean): Promise<Todo[]> {
  const query = completed === undefined ? "" : `?completed=${completed}`;
  return request(`/${query}`, todoListSchema);
}

// POST /api/todos (201): dueDate가 없으면 null로 보냄
export function createTodo(title: string, dueDate: string | null = null): Promise<Todo> {
  return request("/", todoSchema, { method: "POST", body: JSON.stringify({ title, dueDate }) });
}

// PATCH /api/todos/:id: 보낸 필드만 수정 (dueDate: null은 마감일 지우기)
export function updateTodo(
  id: string,
  patch: { title?: string; completed?: boolean; dueDate?: string | null },
): Promise<Todo> {
  return request(`/${id}`, todoSchema, { method: "PATCH", body: JSON.stringify(patch) });
}

// DELETE /api/todos/:id (204)
export async function deleteTodo(id: string): Promise<void> {
  await request(`/${id}`, z.undefined(), { method: "DELETE" });
}
