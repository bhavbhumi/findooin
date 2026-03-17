import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./lib/error-tracker"; // Initialize global error tracking

createRoot(document.getElementById("root")!).render(<App />);
