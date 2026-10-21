# 할 일 목록 요구사항

이 파일은 무엇을 만들어야 하는지 정한다. 어떻게 만들지는 PLAN.md에서 정한다.
강사가 제공하는 파일이므로 수정하지 않는다.

## 화면

- 배치: todo/client/layout.png
- 요소 id: todo-input, todo-container, items-left, clear-completed, error-popup

## 기능과 완료 조건

| # | 기능 | 완료 조건 |
|---|---|---|
| 1 | 할 일 추가 | 폼 제출 시 POST /api/todos, 목록에 표시, 새로고침해도 유지 |
| 2 | 완료 표시 | 체크박스 변경 시 PATCH /api/todos/:id, 남은 개수 갱신 |
| 3 | 삭제 | 삭제 버튼 클릭 시 DELETE /api/todos/:id, 목록에서 제거 |
| 4 | 완료 항목 삭제 | Clear completed 클릭 시 완료된 항목을 모두 삭제 |
| 5 | 남은 개수 | "N items left" 표시, 1개면 "1 item left" |
| 6 | 입력 검증과 오류 | 빈 입력이면 요청 없이 오류 팝업, 서버 오류 시 메시지 표시, 요청 중에는 버튼 비활성화 |
| 7 | 마감일 | 선택 입력, 마감일이 빠른 순으로 정렬(없는 항목은 맨 뒤), 지난 날짜는 빨간색, 잘못된 날짜는 400 |
| 8 | 상태 필터 | 전체·진행 중·완료 버튼, 서버에서 거른다(GET /api/todos?completed=true 또는 false), 잘못된 값은 400, 추가·삭제 후에도 필터 유지, 남은 개수는 필터와 관계없이 전체 기준 |

## 정해 둔 이름

- client/src/api.ts: getTodos, createTodo, updateTodo, deleteTodo
- 모든 서버 요청은 request 함수를 거친다

## 공통 조건

- 화면은 항상 서버의 데이터로 다시 그린다 (요청이 끝나면 목록을 다시 조회)
- 서버 응답은 Zod로 검증한다
- 작업 후 저장소 루트에서 npm run typecheck 가 통과한다

## 구현 순서와 단계별 확인

PLAN.md의 각 단계 완료 조건에는 아래 확인 방법을 그대로 넣는다.
서버 확인 요청은 todo/server/todos.http 에 있다.

| 단계 | 만들 것 | 확인 방법 |
|---|---|---|
| 1. 화면 뼈대 | index.html, src/style.css, src/main.ts의 getElement와 elements | localhost:5173에서 layout.png와 같은 배치가 보이고, Console 탭에 오류가 없다 |
| 2. API 연결 | src/api.ts (request, todoSchema, 함수 네 개) | main.ts에서 getTodos()를 호출해 결과를 console.log로 출력한다(3단계에서 화면 표시로 바뀐다). Console 탭에 배열이 찍히고, Network 탭에서 /api/todos가 200 또는 304 |
| 3. 렌더링과 이벤트 | 목록 그리기, 추가·체크·삭제·Clear, 오류 팝업 | 화면에서 추가·체크·삭제·Clear가 동작하고, 새로고침해도 그대로 남는다 |
| 4. 마감일 | server를 먼저 구현하고 REST Client나 curl로 확인한 뒤 client | 잘못된 날짜는 400, 목록은 마감일이 빠른 순, 화면에서 지난 마감일은 빨간색 |
| 5. 상태 필터 | server를 먼저 구현하고 REST Client나 curl로 확인한 뒤 client | ?completed=abc는 400, 필터 버튼을 누를 때마다 Network 탭에 ?completed= 요청 |

- 모든 단계: 저장소 루트에서 npm run typecheck 통과
- 마지막 점검: 빈 입력은 요청 없이 팝업, 서버를 끄고 추가하면 메시지, Add를 두 번 눌러도 요청 1건
