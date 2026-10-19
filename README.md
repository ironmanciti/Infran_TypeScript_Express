# Infran_TypeScript_Express (Section 10~11 실습)

Section 10(백엔드와 Express)과 Section 11(실전 프로젝트) 실습용 저장소입니다.
Section 1~9 실습 저장소(Infran_TypeScript)와는 별도로 내려받아 사용합니다.

## 준비

1. 이 저장소를 내려받아 압축을 풉니다.
2. 저장소 루트의 터미널에서 한 번만 설치합니다.

```bash
npm install
```

루트 `package.json`의 `workspaces`에 `server`가 등록되어 있어, express, zod, cors, cuid2, tsx가
루트 `node_modules`에 함께 설치됩니다. `server` 폴더 안에서 따로 `npm install`하지 마십시오.

## 실행 (저장소 루트에서)

| 명령 | 내용 | 주소 |
|---|---|---|
| `npm run dev:server` | Express 개발 서버 (저장하면 자동 재시작) | http://localhost:3000 |
| `npm run typecheck` | 모든 워크스페이스 타입 검사 | |

## 폴더 구성

```
├─ package.json      workspaces, 공통 스크립트, typescript
├─ server/           Section 10: Express 서버 (강의 예제 → 실전 응용 문제의 할 일 API)
│  ├─ package.json   dependencies, dev·build·start·typecheck 스크립트
│  ├─ tsconfig.json  Node.js용 설정 (NodeNext, outDir dist)
│  └─ src/main.ts    시작 파일
└─ client/           Section 11에서 Vite 프로젝트로 추가 (프론트엔드)
```
