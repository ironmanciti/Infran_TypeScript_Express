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

## 구현 순서

1. 화면 뼈대
2. API 연결
3. 렌더링과 이벤트
4. 마감일 (server를 먼저 구현하고 curl로 확인한 뒤 client)
5. 상태 필터 (server를 먼저 구현하고 curl로 확인한 뒤 client)
