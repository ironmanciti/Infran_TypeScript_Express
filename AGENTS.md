# Infran_TypeScript_Express

TypeScript 강의 실습 저장소입니다. server(강의 예제)와 todo(할 일 프로젝트)로 구성됩니다.
이 파일이 컨텍스트 파일의 원본이며, CLAUDE.md와 GEMINI.md는 이 파일을 불러옵니다.

## 기술 스택
- TypeScript, ES 모듈, Node 22 이상
- 백엔드: Express 5, Zod 4, tsx
- 프론트엔드: Vite vanilla-ts, DOM 조작 (프레임워크 없음)

## 폴더
- server/: 강의 예제 (도서 API)
- todo/server/: 할 일 API (/api/todos)
- todo/client/: 할 일 화면 (src/api.ts 서버 요청, src/main.ts 화면)

## 규칙
- 프레임워크나 새 라이브러리를 추가하지 않는다
- 외부 입력(요청 본문, 쿼리, 서버 응답)은 Zod로 검증한다
- 함수는 반환 타입을 명시한다
- 패키지 설치는 저장소 루트에서만 한다 (각 폴더에서 npm install 금지)
- 요청받지 않은 파일은 수정하지 않는다
- 작업 후 루트에서 npm run typecheck 를 실행하고 결과를 보고한다

## 명령 (저장소 루트에서)
- npm run dev:server : 강의 예제 서버 (3000번)
- npm run dev:todo : 할 일 API (3000번)
- npm run dev:todo-client : 할 일 화면 (5173번, /api 요청은 3000번으로 프록시)
- npm run typecheck : 전체 타입 검사
- npm run build:todo, npm run start:todo : 배포용 빌드와 실행

## 할 일 프로젝트 (todo/)
할 일 목록 웹 애플리케이션. server(Express API)와
client(Vite vanilla-ts)로 구성된다.

### 규칙
- 프레임워크, 상태 관리 라이브러리를 추가하지 않는다
- client 의 서버 호출은 src/api.ts 의 request 를 거친다
- 서버 응답은 Zod 스키마로 검증한 뒤 사용한다
- 요소 선택은 getElement 함수를 사용한다
- 함수는 반환 타입을 명시한다
- 작업 후 저장소 루트에서 npm run typecheck 실행
- 요구사항은 todo/REQUIREMENTS.md 를 따른다

### API (todo/server, /api/todos)
GET /, POST / {title}, PATCH /:id {title?, completed?}, DELETE /:id
- 할 일: id(cuid2 문자열), title(공백 제거 후 1~100자), completed(boolean, 기본 false)
- 상태 코드: 검증 실패 400, 없는 id 404, 생성 201, 삭제 204
