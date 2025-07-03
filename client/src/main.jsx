import React from "react"; // ✅ Required for JSX in many setups
import { StrictMode } from "react"; // ✅ Wraps app for highlighting potential problems
import { createRoot } from "react-dom/client"; // ✅ Modern React 18+ root API
import { BrowserRouter } from "react-router-dom"; // ✅ Routing provider
import "./index.css"; // ✅ Global styles
import App from "./App"; // ✅ Your root app component

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
