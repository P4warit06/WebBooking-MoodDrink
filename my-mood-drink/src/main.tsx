import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import AdminApp from "../src/order/components/admin/Adminapp";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Customer flow */}
        <Route path="/" element={<App />} />
        <Route path="/order/*" element={<App />} />

        {/* Admin / Barista flow — mount แยก route */}
        <Route path="/admin/*" element={<AdminApp />} />

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);