# 할 일 화면(todo/client) 구현 계획

요구사항은 `todo/REQUIREMENTS.md`를 따른다. 이 계획이 요구사항과 다르면 요구사항이 우선한다.

## 공통 규칙
- 프레임워크·새 라이브러리 추가 금지 (zod만 사용)
- 서버 호출은 `src/api.ts`의 `request`만 거친다. 응답은 Zod로 검증한 뒤 사용
- 요소 선택은 `getElement` 사용, 모든 함수는 반환 타입 명시
- 단계마다 저장소 루트에서 `npm run typecheck` 통과

## 파일 구성
| 파일 | 역할 |
|---|---|
| `todo/client/index.html` | 화면 뼈대 (요소 id) |
| `todo/client/src/style.css` | 어두운 테마 스타일 |
| `todo/client/src/api.ts` | `request`, Zod 스키마, API 함수 |
| `todo/client/src/main.ts` | 상태, 렌더링, 이벤트 |

## 요소 id (layout.png 기준)
| id | 요소 | 단계 |
|---|---|---|
| `todo-input` | 할 일 입력 (placeholder "할 일을 입력하세요") | 1 |
| `add-button`, `clear-button` | Add(추가), Clear(입력 지우기) | 1 |
| `todo-container` | 목록 `<ul>`: 체크박스·제목·삭제 버튼 | 1 |
| `items-left` | 남은 개수 ("2 items left") | 1 |
| `clear-completed` | 완료 항목 삭제 | 1 |
| `error-popup`, `error-message`, `error-close` | 오류 팝업(평소 hidden), 메시지, × 버튼 | 1 |
| `due-date-input` | `input type="date"` 마감일 | 4 |
| `filter-all`, `filter-active`, `filter-completed` | 전체·진행 중·완료 필터 버튼 | 5 |

---

## 1단계: 화면 뼈대
- 파일: `index.html`, `src/style.css`, `src/main.ts`
- 내용: 입력줄(todo-input, Add, Clear), 오류 팝업, 목록, 하단(items-left, clear-completed) 마크업. 어두운 카드 레이아웃 CSS. `main.ts`에서 style.css import
- 함수: `getElement<T extends HTMLElement>(id: string): T` — 없으면 Error 발생
- 완료 조건
  - `npm run dev:todo-client` 실행 시 layout.png의 1~6번 요소가 보인다
  - `#error-popup`은 숨겨져 있다
  - typecheck 통과

## 2단계: API 연결
- 파일: `src/api.ts`
- 스키마: `todoSchema`({id: string, title: string, completed: boolean}), `todoListSchema`, `errorBodySchema`({message: string})
- 타입: `Todo = z.infer<typeof todoSchema>`
- 함수
  - `request<T>(path: string, schema: z.ZodType<T>, init?: RequestInit): Promise<T>` — `/api/todos` 기준 fetch, JSON 헤더, 실패 응답이면 서버 `message`로 Error 발생, 204면 본문 없음 처리, 성공 응답은 schema.parse
  - `getTodos(): Promise<Todo[]>` (GET /) — 이름은 REQUIREMENTS.md를 따른다
  - `createTodo(title: string): Promise<Todo>` (POST /, 201)
  - `updateTodo(id: string, patch: {title?: string; completed?: boolean}): Promise<Todo>` (PATCH /:id)
  - `deleteTodo(id: string): Promise<void>` (DELETE /:id, 204)
- 완료 조건
  - 서버(`npm run dev:todo`) 실행 중 브라우저 콘솔에서 `getTodos()` 결과가 배열로 나오고, Network 탭에서 `/api/todos`가 200
  - 잘못된 응답 모양이면 ZodError가 난다
  - typecheck 통과

## 3단계: 렌더링과 이벤트
- 파일: `src/main.ts`
- 상태: `let todos: Todo[] = []`
- 함수
  - `render(): void` — 목록과 items-left 다시 그림
  - `createTodoItem(todo: Todo): HTMLLIElement` — 체크박스·제목(`textContent`)·삭제 버튼, 완료면 `completed` 클래스(취소선)
  - `updateItemsLeft(): void` — 미완료 개수 → "N items left" (1개면 "1 item left")
  - `showError(message: string): void`, `hideError(): void`
  - `handleAdd(): Promise<void>`, `handleClear(): void`, `handleToggle(id: string, completed: boolean): Promise<void>`, `handleDelete(id: string): Promise<void>`, `handleClearCompleted(): Promise<void>`
  - `refresh(): Promise<void>` — `getTodos()`로 목록을 다시 조회해 `todos`에 넣고 `render()` (화면은 항상 서버 데이터로 다시 그린다)
  - `setPending(pending: boolean): void` — 요청 중에는 Add·삭제·완료 삭제 버튼 비활성화
  - `init(): Promise<void>` — 이벤트 연결 후 `refresh()`
- 이벤트: Add 클릭·입력창 Enter → 추가, Clear → 입력 비움, 체크박스 change → 완료 토글, 삭제 클릭 → 삭제 (목록은 `#todo-container`에 이벤트 위임, `data-id` 사용), clear-completed → 완료 항목 모두 DELETE, × → 팝업 닫기
- 추가·토글·삭제·완료 삭제 요청이 끝나면 `refresh()`로 다시 조회한다
- 오류 처리: 빈 입력(공백만 포함)은 요청을 보내지 않고 팝업 표시, 서버 오류는 응답 `message`를 `showError`로 표시
- 완료 조건
  - 추가·토글·삭제·완료 삭제가 동작하고 새로고침 후에도 서버 상태와 일치
  - 빈 제목 추가 시 요청 없이 오류 팝업(Network 탭에 요청 없음), × 로 닫힘
  - Add를 빠르게 두 번 눌러도 요청은 1건
  - items-left 숫자가 정확
  - typecheck 통과

## 4단계: 마감일 (server를 먼저 구현하고 curl로 확인한 뒤 client)
- server: `todo/server/src/todos-router.ts`
  - `dueDate`(선택, `YYYY-MM-DD` 문자열 또는 null) 추가 — POST·PATCH 스키마와 `Todo` 타입, `z.iso.date()`로 검증해 잘못된 날짜는 400
  - `GET /`는 마감일이 빠른 순으로 정렬, 마감일이 없는 항목은 맨 뒤
  - AGENTS.md의 API 설명도 함께 갱신
  - curl 확인: 마감일 있는·없는 항목 추가 후 GET 순서, `dueDate: "2026-13-40"` → 400
- client 파일: `index.html`(`#due-date-input`), `api.ts`(`todoSchema`에 `dueDate: z.string().nullable()`, `createTodo(title, dueDate?)`), `main.ts`, `style.css`
- 함수: `isOverdue(dueDate: string): boolean` — 오늘 날짜보다 이전이면 true
- 렌더링: 제목 옆에 날짜 표시, 지났으면 빨간색(`overdue` 클래스), 아니면 초록색, 없으면 표시 안 함
- 완료 조건
  - 마감일과 함께 추가하면 목록에 날짜가 보이고 새로고침 후에도 유지
  - 지난 날짜는 빨간색, 미래 날짜는 초록색
  - 목록이 마감일이 빠른 순으로 보이고, 마감일 없는 항목은 맨 뒤
  - 마감일 없이도 추가 가능, Clear 시 날짜 입력도 비움
  - typecheck 통과

## 5단계: 상태 필터 (서버에서 거른다. server를 먼저 구현하고 curl로 확인한 뒤 client)
- server: `todo/server/src/todos-router.ts`
  - `GET /`에 쿼리 `completed` 지원: `z.enum(["true", "false"]).optional()`로 검증해 불리언으로 변환, 없으면 전체 반환, 잘못된 값은 400
  - curl 확인: `?completed=true`, `?completed=false`, 쿼리 없음, `?completed=abc` → 400
- client 파일: `index.html`(필터 버튼 3개), `api.ts`, `main.ts`, `style.css`
- 상태: `type Filter = "all" | "active" | "completed"`, `let currentFilter: Filter = "all"`
- 함수
  - `api.ts`: `getTodos(completed?: boolean): Promise<Todo[]>` — 값이 있으면 `?completed=` 쿼리를 붙여 요청
  - `setFilter(filter: Filter): Promise<void>` — 상태 변경, 선택 버튼에 `selected` 클래스, `refresh()` 호출
  - `refresh()`는 현재 필터에 맞는 쿼리로 `getTodos`를 호출한다 (화면에서 거르지 않는다)
  - 남은 개수는 필터와 관계없이 전체 기준이므로 `getTodos()`(쿼리 없음)로 전체 목록을 따로 받아 계산한다
- 완료 조건
  - 전체/진행 중/완료 클릭 시 서버에 해당 쿼리로 요청하고(Network 탭) 목록이 바뀌며 선택 버튼이 강조
  - items-left는 필터와 무관하게 전체 미완료 개수
  - 필터 상태에서 추가·토글·삭제해도 필터가 유지 ('완료' 필터에서 체크를 해제하면 목록에서 사라짐)
  - `?completed=abc`는 400
  - typecheck 통과

## 테스트 계획
클라이언트에 테스트 도구가 없고 새 라이브러리 추가가 금지되어 있으므로, 타입 검사와 브라우저 수동 확인으로 판정한다.
- 통과 판정 명령: `npm run typecheck` (저장소 루트)
- 수동 확인 (`npm run dev:todo` + `npm run dev:todo-client`)
  - 정상: "우유 사기" 추가 → 목록에 표시, 201 / 체크 → 취소선, PATCH 200 / 삭제 → 사라짐, 204
  - 경계값: 제목 100자 → 추가됨, 101자 → 팝업 / 앞뒤 공백 제목 → 공백 제거되어 저장 / 미완료 1개 → "1 item left"
  - 실패: 빈 제목 → 400, 팝업에 서버 메시지 / 서버 꺼짐 → 팝업 표시 / 다른 탭에서 지운 항목 토글 → 404 메시지 팝업
