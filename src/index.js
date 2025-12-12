// src/index.js

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Halaman
import App from './App';
import Login from './pages/Login';
import Admin from './pages/Admin';

// Auth helper
import { isAuthenticated } from './services/api';

// CSS wajib untuk UI admin
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";

function RequireAuth({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

const root = createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <Routes>
      {/* Public */}
      <Route path="/" element={<App />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Admin */}
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
