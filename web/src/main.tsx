import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App";
import { AccountProvider } from "./account/AccountContext";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <AccountProvider>
                <App />
            </AccountProvider>
        </BrowserRouter>
    </StrictMode>
);