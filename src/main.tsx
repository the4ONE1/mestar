import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import Analytics from "./components/Analytics";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <Analytics />
    <App />
  </HelmetProvider>
);
