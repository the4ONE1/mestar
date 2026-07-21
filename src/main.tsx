import { createRoot, hydrateRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import Analytics from "./components/Analytics";
import "./index.css";

const container = document.getElementById("root")!;
const tree = (
  <HelmetProvider>
    <Analytics />
    <App />
  </HelmetProvider>
);

// If the page was prerendered (has server-rendered children), hydrate.
// Otherwise, fall back to a plain client render.
if (container.hasChildNodes()) {
  hydrateRoot(container, tree);
} else {
  createRoot(container).render(tree);
}
