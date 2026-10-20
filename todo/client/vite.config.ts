import { defineConfig } from "vite";

// 개발 중 브라우저가 5173번으로 보낸 /api 요청을 3000번의 할 일 API(todo/server)로 전달합니다.
// 브라우저 입장에서는 같은 출처이므로 cors 설정이 필요 없습니다.
export default defineConfig({
  server: { proxy: { "/api": "http://localhost:3000" } },
});
