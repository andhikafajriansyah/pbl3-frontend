// src/services/api.js
// Full API helper for login, dosen, mata_kuliah, jadwal, izin, absensi_dosen, status_kelas, health, todays_schedule

// ======================================
// BASE URL HANDLING
// ======================================
const viteApi =
  typeof import.meta !== "undefined" &&
  import.meta.env &&
  import.meta.env.VITE_API;

const craApi =
  typeof process !== "undefined" &&
  process.env &&
  process.env.REACT_APP_API;

function buildBaseFromWindow() {
  if (typeof window === "undefined") return null;
  const proto = window.location.protocol;
  const host = window.location.hostname;
  const port = "5000";
  return `${proto}//${host}:${port}/api`;
}

export const BASE = (
  viteApi ||
  craApi ||
  buildBaseFromWindow() ||
  "http://127.0.0.1:5000/api"
).replace(/\/+$/, "");

export const TOKEN_KEY = "sc_token";

// ======================================
// TOKEN HELPERS
// ======================================
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return !!localStorage.getItem(TOKEN_KEY);
}

function authHeader() {
  const t = localStorage.getItem(TOKEN_KEY);
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function base64UrlDecode(input) {
  try {
    input = input.replace(/-/g, "+").replace(/_/g, "/");
    const pad = input.length % 4;
    if (pad) input += "=".repeat(4 - pad);
    return atob(input);
  } catch (e) {
    return null;
  }
}

export function getUsernameFromToken() {
  try {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) return "";
    const parts = t.split(".");
    if (parts.length < 2) return "";
    const raw = base64UrlDecode(parts[1]);
    if (!raw) return "";
    const payload = JSON.parse(raw);
    return payload.username || payload.sub || payload.user || "";
  } catch {
    return "";
  }
}

// ======================================
// CORE REQUEST WRAPPER
// ======================================
async function readBody(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
}

export async function request(method, path, { body, params, auth } = {}) {
  const query = params ? new URLSearchParams(params).toString() : "";
  const url = `${BASE}${path}${query ? `?${query}` : ""}`;

  const headers = {
    "Content-Type": "application/json",
    ...(auth ? authHeader() : {}),
  };

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    console.error("[API ERROR] network:", e);
    throw new Error("Tidak bisa menghubungi server. Periksa koneksi.");
  }

  const data = await readBody(res);

  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
      throw new Error(
        data?.error || data?.message || "Sesi habis, silakan login ulang."
      );
    }
    throw new Error(
      data?.error || data?.message || `HTTP ${res.status}`
    );
  }

  return data;
}

export const get = (path, params = {}, auth = true) =>
  request("GET", path, { params, auth });

export const post = (path, body, auth = true) =>
  request("POST", path, { body, auth });

export const put = (path, body, auth = true) =>
  request("PUT", path, { body, auth });

export const del = (path, auth = true) =>
  request("DELETE", path, { auth });

// ======================================
// AUTH
// ======================================
export function login(username, password) {
  return request("POST", "/auth/login", {
    body: { username, password },
    auth: false,
  });
}

export const getHealth = () => get("/health", {}, false);
export const getTodaysSchedule = () => get("/todays_schedule", {}, false);

// ======================================
// CRUD DOSEN
// ======================================
export function getDosenList(q = "", page = 1, size = 10) {
  return get("/dosen", { q, page, size });
}

export const createDosen = (data) => post("/dosen", data);
export const updateDosen = (id, data) => put(`/dosen/${id}`, data);
export const deleteDosen = (id) => del(`/dosen/${id}`);

// ======================================
// CRUD MATA KULIAH
// ======================================
export function getMatkulList(q = "", page = 1, size = 10) {
  return get("/mata_kuliah", { q, page, size });
}

export const createMatkul = (data) => post("/mata_kuliah", data);
export const updateMatkul = (id, data) => put(`/mata_kuliah/${id}`, data);
export const deleteMatkul = (id) => del(`/mata_kuliah/${id}`);

// ======================================
// CRUD JADWAL
// ======================================
export function getJadwalList(q = "", page = 1, size = 10) {
  return get("/jadwal", { q, page, size });
}

export const createJadwal = (data) => post("/jadwal", data);
export const updateJadwal = (id, data) => put(`/jadwal/${id}`, data);
export const deleteJadwal = (id) => del(`/jadwal/${id}`);

// ======================================
// CRUD IZIN
// ======================================
export function getIzinList(page = 1, size = 10) {
  return get("/izin", { page, size });
}

export const createIzin = (data) => post("/izin", data);
export const updateIzin = (id, data) => put(`/izin/${id}`, data);
export const deleteIzin = (id) => del(`/izin/${id}`);

// ======================================
// CRUD ABSENSI DOSEN
// ======================================
export function getAbsensiDosenList(page = 1, size = 10) {
  return get("/absensi_dosen", { page, size });
}

export const createAbsensiDosen = (data) =>
  post("/absensi_dosen", data);

export const updateAbsensiDosen = (id, data) =>
  put(`/absensi_dosen/${id}`, data);

export const deleteAbsensiDosen = (id) =>
  del(`/absensi_dosen/${id}`);

// ======================================
// STATUS KELAS
// ======================================
export const getStatusKelas = () => get("/status_kelas", {}, true);

// Export default bundle
export default {
  BASE,
  setToken,
  clearToken,
  isAuthenticated,
  getUsernameFromToken,

  login,
  getHealth,
  getTodaysSchedule,

  getDosenList,
  createDosen,
  updateDosen,
  deleteDosen,

  getMatkulList,
  createMatkul,
  updateMatkul,
  deleteMatkul,

  getJadwalList,
  createJadwal,
  updateJadwal,
  deleteJadwal,

  getIzinList,
  createIzin,
  updateIzin,
  deleteIzin,

  getAbsensiDosenList,
  createAbsensiDosen,
  updateAbsensiDosen,
  deleteAbsensiDosen,

  getStatusKelas,
};
