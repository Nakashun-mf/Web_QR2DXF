import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Eruda デバッグコンソール（?debug=true のときのみ起動）
if (new URLSearchParams(window.location.search).get("debug") === "true") {
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/eruda";
  script.onload = () => (window as any).eruda.init();
  document.body.appendChild(script);
}
