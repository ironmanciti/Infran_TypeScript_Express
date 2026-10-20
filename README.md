# Infran_TypeScript_Express (Section 10~11 실습)

Section 10(백엔드와 Express)과 Section 11(실전 프로젝트) 실습용 저장소입니다.
Section 1~9 실습 저장소(Infran_TypeScript)와는 별도로 내려받아 사용합니다.

## 준비

1. 이 저장소를 내려받아 압축을 풉니다.
2. 저장소 루트의 터미널에서 한 번만 설치합니다.

```bash
npm install
```

루트 `package.json`의 `workspaces`에 `server`, `todo/server`, `todo/client`가 등록되어 있어,
필요한 패키지가 모두 루트 `node_modules`에 함께 설치됩니다. 각 폴더 안에서 따로 `npm install`하지 마십시오.

## 실행 (저장소 루트에서)

| 명령 | 내용 | 주소 |
|---|---|---|
| `npm run dev:server` | 강의 예제 서버 (저장하면 자동 재시작) | http://localhost:3000 |
| `npm run dev:example` | 첫 API 샘플 실행 (server/src/examples/first-api.ts) | http://localhost:3000 |
| `npm run dev:todo` | 할 일 API 서버 | http://localhost:3000 |
| `npm run dev:todo-client` | 할 일 화면 (Vite, /api 요청은 3000번으로 전달) | http://localhost:5173 |
| `npm run build:todo` | 할 일 앱 배포용 빌드 (화면 → client/dist, 서버 → server/dist) | |
| `npm run start:todo` | 빌드한 할 일 앱 실행 (화면과 API를 함께 제공) | http://localhost:3000 |
| `npm run typecheck` | 모든 워크스페이스 타입 검사 | |

서버 세 개가 모두 3000번을 쓰므로 한 번에 하나만 실행합니다.

## 컨텍스트 파일

AI 코딩 도구가 작업을 시작할 때 자동으로 읽는 프로젝트 규칙입니다. 강사가 미리 만들어 두었으므로 새로 만들 필요는 없습니다.

| 파일 | 읽는 도구 | 내용 |
|---|---|---|
| `AGENTS.md` | Codex | 규칙 원본 (기술 스택, 폴더, 규칙, 명령, 할 일 프로젝트) |
| `CLAUDE.md` | Claude Code | `@AGENTS.md` 한 줄로 원본을 불러옴 |
| `GEMINI.md` | Gemini CLI | `@./AGENTS.md` 한 줄로 원본을 불러옴 |

규칙을 바꿀 때는 `AGENTS.md`만 고칩니다.

## 폴더 구성

```
├─ AGENTS.md           컨텍스트 파일 원본 (CLAUDE.md, GEMINI.md가 참조)
├─ package.json        workspaces, 공통 스크립트, typescript
├─ server/             Section 10 강의 예제 (도서 API)
│  ├─ package.json     dependencies, dev·example·build·start·typecheck 스크립트
│  ├─ tsconfig.json    Node.js용 설정 (NodeNext, outDir dist)
│  └─ src/
│     ├─ main.ts                 실습 시작 파일 (AI가 작성)
│     └─ examples/first-api.ts   첫 API 샘플 (읽고 실행만)
└─ todo/               할 일 목록 프로젝트
   ├─ server/          Section 10 실전 응용 문제: 할 일 API (src는 AI가 작성)
   │  ├─ package.json
   │  ├─ tsconfig.json
   │  └─ src/main.ts
   └─ client/          Section 11 프로젝트 1: 할 일 화면 (src는 AI가 작성)
      ├─ package.json
      ├─ tsconfig.json  브라우저용 설정 (DOM, noEmit)
      ├─ vite.config.ts /api 프록시
      ├─ index.html
      └─ src/main.ts
```
