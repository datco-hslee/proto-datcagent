import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "driver.js/dist/driver.css";
import { driver } from "driver.js";
import App from "./App.tsx";

// driver.js 초기화 (앱이 로드된 후 실행될 수 있도록 setTimeout 사용)
setTimeout(() => {
  // 튜토리얼 드라이버 설정
  const driverObj = driver({
    showProgress: true,
    animate: true,
    showButtons: ['next', 'previous', 'close'],
    steps: []
  });
  
  // 전역 변수로 저장 (다른 컴포넌트에서 접근 가능하도록)
  window.driverjs = driverObj;
}, 1000);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
