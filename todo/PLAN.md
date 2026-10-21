# 할 일 화면(todo/client) 구현 계획

무엇을 만들지는 `todo/REQUIREMENTS.md`가 정한다. 이 계획과 요구사항이 다르면 요구사항을 따른다.

## 공통 규칙
- 프레임워크·새 라이브러리 추가 금지 (zod만 사용)
- 서버 호출은 `src/api.ts`의 `request`만 거치고, 응답은 Zod로 검증한 뒤 사용
- 요소 선택은 `getElement`, 모든 함수는 반환 타입 명시
- 화면은 항상 서버 데이터로 다시 그린다 (요청이 끝나면 목록을 다시 조회)
- 단계마다 저장소 루트에서 `npm run typecheck` 통과

## 파일 구성
| 파일 | 역할 | 단계 |
|---|---|---|
| `todo/client/index.html` | 화면 뼈대 (요소 id) | 1, 4, 5 |
| `todo/client/src/style.css` | 어두운 카드 스타일 | 1, 3, 4, 5 |
| `todo/client/src/main.ts` | getElement, 상태, 렌더링, 이벤트 | 1~5 |
| `todo/client/src/api.ts` | request, Zod 스키마, API 함수 | 2, 4, 5 |
| `todo/server/src/todos-router.ts` | 마감일, 정렬, 상태 필터 | 4, 5 |

## 요소 id (layout.png 번호 기준)
| 번호 | id | 요소 | 단계 |
|---|---|---|---|
| 1 | `todo-form`, `todo-input` | 입력 폼, 할 일 입력 (placeholder "할 일을 입력하세요") | 1 |
| 2 | `add-button`, `clear-button` | Add(폼 제출), Clear(입력 지우기) | 1 |
| 3 | `todo-container` | 목록 `<ul>`: 항목마다 체크박스·제목·(마감일)·삭제 버튼 | 1 |
| 4 | `items-left` | 남은 개수 ("2 items left") | 1 |
| 5 | `clear-completed` | 완료 항목 삭제 | 1 |
| 6 | `error-popup`, `error-message`, `error-close` | 오류 팝업(평소 hidden), 메시지, × 버튼 | 1 |
| 7 | `due-date-input` | `input type="date"` 마감일 | 4 |
| 8 | `filter-all`, `filter-active`, `filter-completed` | 전체·진행 중·완료 필터 버튼 | 5 |

---

## 1단계: 화면 뼈대
- 만들 파일: `index.html`, `src/style.css`, `src/main.ts`
- `index.html`: 1~6번 요소 마크업. 입력줄은 `<form id="todo-form">`(Add는 `type="submit"`, Clear는 `type="button"`). 오류 팝업과 5단계 필터가 들어갈 줄(`.status-row`), 목록, 하단. favicon 404가 Console 오류로 남지 않도록 `<link rel="icon" href="data:,">`
- `style.css`: layout.png처럼 어두운 둥근 카드, 파란 Add, 회색 버튼, 테두리 있는 목록 상자. `.error-popup[hidden] { display: none }`
- `main.ts`
  - `import "./style.css"`
  - `getElement<T extends HTMLElement>(id: string): T` — 없으면 Error
  - `elements` — 1~6번 요소를 `getElement`로 모아 둔 객체
- 완료 조건
  - localhost:5173에서 layout.png와 같은 배치가 보이고, Console 탭에 오류가 없다
  - `#error-popup`은 숨겨져 있다
  - `npm run typecheck` 통과

## 2단계: API 연결
- 만들 파일: `src/api.ts` (`main.ts`는 확인용 호출만 추가)
- 스키마와 타입
  - `todoSchema` = `{ id: string, title: string, completed: boolean }`, `todoListSchema` = 배열
  - `errorBodySchema` = `{ message: string, errors?: Record<string, string[]> }` (400은 필드별 errors가 옴)
  - `type Todo = z.infer<typeof todoSchema>`
- 함수
  - `request<T>(path: string, schema: z.ZodType<T>, init?: RequestInit): Promise<T>` — `/api/todos` + path로 fetch, 본문이 있으면 JSON 헤더. 실패 응답이면 Error를 던진다(필드별 errors가 있으면 그 문구, 없으면 message). 204는 본문 없이 처리, 성공 응답은 schema로 검증
  - `getTodos(): Promise<Todo[]>` — GET `/api/todos`
  - `createTodo(title: string): Promise<Todo>` — POST, 201
  - `updateTodo(id: string, patch: { title?: string; completed?: boolean }): Promise<Todo>` — PATCH `/:id`
  - `deleteTodo(id: string): Promise<void>` — DELETE `/:id`, 204
- `main.ts`: `getTodos()`를 호출해 결과를 `console.log` (3단계에서 화면 표시로 바뀐다)
- 완료 조건
  - main.ts에서 getTodos()를 호출해 결과를 console.log로 출력한다. Console 탭에 배열이 찍히고, Network 탭에서 /api/todos가 200 또는 304
  - 응답 모양이 다르면 ZodError가 난다
  - `npm run typecheck` 통과

## 3단계: 렌더링과 이벤트
- 수정 파일: `src/main.ts`, `src/style.css`
- 상태: `let todos: Todo[] = []`, `let pending = false`
- 함수
  - `refresh(): Promise<void>` — `getTodos()`로 다시 조회해 `todos`에 넣고 `render()`
  - `render(): void` — 목록과 남은 개수를 다시 그림
  - `createTodoItem(todo: Todo): HTMLLIElement` — `data-id`, 체크박스·제목(`textContent`)·삭제 버튼, 완료면 `completed` 클래스(취소선)
  - `updateItemsLeft(): void` — 미완료 개수로 "N items left", 1개면 "1 item left"
  - `showError(message: string): void`, `hideError(): void`
  - `setPending(value: boolean): void` — 요청 중에는 Add·체크박스·삭제·Clear completed(5단계부터 필터 포함) 비활성화
  - `runRequest(task: () => Promise<void>): Promise<void>` — 요청 중이면 무시, 아니면 `setPending(true)` → task → 실패 시 `showError` → `refresh()` → `setPending(false)`
  - `handleAdd(): Promise<void>` — 공백만 있으면 요청 없이 `showError("할 일을 입력하세요")`, 아니면 `createTodo` 후 입력 비움
  - `handleClear(): void` — 입력 비움
  - `handleToggle(id: string, completed: boolean): Promise<void>` — `updateTodo`
  - `handleDelete(id: string): Promise<void>` — `deleteTodo`
  - `handleClearCompleted(): Promise<void>` — 완료 항목을 모두 `deleteTodo`
  - `init(): Promise<void>` — 이벤트 연결 후 `refresh()`
- 이벤트
  - `#todo-form` submit(Add 클릭·Enter 모두) → `preventDefault` 후 `handleAdd`
  - `#todo-container` 이벤트 위임: 체크박스 change → `handleToggle`, 삭제 클릭 → `handleDelete`
  - Clear → `handleClear`, Clear completed → `handleClearCompleted`, × → `hideError`
- 완료 조건
  - 화면에서 추가·체크·삭제·Clear가 동작하고, 새로고침해도 그대로 남는다
  - 체크하면 남은 개수가 바뀌고, 1개면 "1 item left"
  - 빈 입력은 Network 탭에 요청 없이 팝업, × 로 닫힌다
  - `npm run typecheck` 통과

## 4단계: 마감일 (server를 먼저 구현하고 확인한 뒤 client)
- server: `todo/server/src/todos-router.ts`
  - `Todo`에 `dueDate: string | null`
  - `dueDateSchema = z.iso.date().nullable()` — POST는 `.default(null)`, PATCH는 `.optional()` (null이면 마감일 지우기)
  - `compareByDueDate(a: Todo, b: Todo): number` — 빠른 순, null은 맨 뒤. `GET /`은 정렬한 복사본을 응답
  - AGENTS.md의 API 설명에 dueDate 추가
  - 확인: `todo/server/todos.http`의 1~6번 (REST Client 또는 curl)
- client
  - `index.html`: `#due-date-input`을 할 일 입력 옆에
  - `api.ts`: `todoSchema`에 `dueDate: z.iso.date().nullable()`, `createTodo(title: string, dueDate: string | null): Promise<Todo>`
  - `main.ts`: 추가할 때 날짜를 함께 보냄(비어 있으면 null), Clear와 추가 성공 시 날짜도 비움
  - `isOverdue(dueDate: string): boolean` — 오늘(브라우저 날짜)보다 이전이면 true
  - `createTodoItem`: 제목 옆에 날짜, 지났으면 `overdue` 클래스(빨간색), 아니면 초록색, 없으면 비움
- 완료 조건
  - 잘못된 날짜는 400, 목록은 마감일이 빠른 순, 화면에서 지난 마감일은 빨간색
  - 마감일 없는 항목은 맨 뒤, 마감일 없이도 추가된다
  - `npm run typecheck` 통과

## 5단계: 상태 필터 (server를 먼저 구현하고 확인한 뒤 client)
- server: `todo/server/src/todos-router.ts`
  - `listQuerySchema` — `completed: z.enum(["true", "false"]).transform(...).optional()`, 잘못된 값은 400
  - `GET /`: completed가 있으면 그 상태만 거른 뒤 마감일 순으로 응답
  - 확인: `todo/server/todos.http`의 7~11번
- client
  - `index.html`: `.status-row` 왼쪽에 필터 버튼 3개
  - `api.ts`: `getTodos(completed?: boolean): Promise<Todo[]>` — 값이 있으면 `?completed=` 쿼리
  - `main.ts`
    - `type Filter = "all" | "active" | "completed"`, `let currentFilter: Filter = "all"`, `let allTodos: Todo[] = []`
    - `setFilter(filter: Filter): Promise<void>` — 상태 변경, 선택 버튼에 `selected` 클래스, `refresh()`
    - `refresh()`: 현재 필터 쿼리로 `todos`, 쿼리 없이 `allTodos`를 받는다('전체'면 한 번만 요청). 화면에서 거르지 않는다
    - 남은 개수와 Clear completed는 `allTodos` 기준
- 완료 조건
  - ?completed=abc는 400, 필터 버튼을 누를 때마다 Network 탭에 ?completed= 요청
  - 선택한 버튼이 강조되고, 필터 상태에서 추가·체크·삭제해도 필터가 유지된다
  - 남은 개수는 필터와 관계없이 전체 기준
  - `npm run typecheck` 통과

---

## 테스트 계획
client에는 테스트 도구가 없고 새 라이브러리를 추가할 수 없으므로, 타입 검사와 서버 요청 파일, 브라우저 확인으로 판정한다.

- 통과 판정 명령: `npm run typecheck` (저장소 루트)
- 서버 확인: `todo/server/todos.http` (4단계 1~6번, 5단계 7~11번) 또는 curl
- 브라우저 확인: `npm run dev:todo` + `npm run dev:todo-client`, Console·Network 탭

| 구분 | 입력 | 기대 결과 |
|---|---|---|
| 정상 | "우유 사기" 추가 | POST 201, 목록에 표시, 새로고침 후에도 있음 |
| 정상 | 체크 / 삭제 | PATCH 200 취소선 / DELETE 204 사라짐 |
| 정상 | 마감일 2026-12-01, 2026-10-25, 없음 순으로 추가 | GET 순서: 10-25 → 12-01 → 없음 |
| 경계값 | 제목 100자 / 101자 | 201 / 400, 팝업에 서버 메시지 |
| 경계값 | 앞뒤 공백 제목 | 공백 제거되어 저장 |
| 경계값 | 미완료 1개 | "1 item left" |
| 실패 | 빈 입력, 공백만 | 요청 없이 팝업 "할 일을 입력하세요" |
| 실패 | dueDate "2026-13-40", "내일" | 400 |
| 실패 | `?completed=abc` | 400 |
| 실패 | 서버를 끄고 추가 | 팝업에 오류 메시지 |
| 실패 | Add를 빠르게 두 번 | POST 요청 1건 |
