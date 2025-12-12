// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Halaman
import App from "./App";
import Login from "./pages/Login";
import Admin from "./pages/Admin";

// Auth helper
import { isAuthenticated } from "./services/api";

// === Import CSS Wajib (untuk tampilan Admin UI) ===
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";
// ===================================================

// Proteksi halaman admin
function RequireAuth({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

// Render React aplikasi
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      {/* Home */}
      <Route path="/" element={<App />} />

      {/* Login (public) */}
      <Route path="/login" element={<Login />} />

      {/* Admin (protected) */}
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <Admin />
          </RequireAuth>
        }
      />

      {/* Redirect semua route yang tidak dikenal */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </BrowserRouter>
);
