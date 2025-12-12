// /pbltes/web/src/pages/Login.jsx (Disesuaikan)

import { useState } from "react";
import { useNavigate } from "react-router-dom";
// Pastikan login dan setToken diimpor dengan nama yang sama persis
import { login, setToken } from "../services/api"; 

export default function LoginPage() {
    const [u, setU] = useState("");
    const [p, setP] = useState("");
    const [err, setErr] = useState("");
    const [showPass, setShowPass] = useState(false);
    const nav = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        setErr("");

        if (!u || !p) {
            setErr("Isi username dan password terlebih dahulu.");
            return;
        }

        try {
            // 💡 Panggil fungsi login dari api.js
            const { token } = await login(u, p);
            
            // 💡 Simpan token menggunakan setToken dari api.js
            setToken(token); 
            
            // Redirect ke halaman Admin setelah berhasil
            nav("/admin", { replace: true }); 
        } catch (e) {
            console.error("Login failed:", e);
            
            // 💡 Penanganan error yang lebih informatif (menggunakan pesan error dari API Helper)
            // Error ditangkap dari throw new Error(msg) di api.js
            if (e.message && e.message.includes("invalid_credentials")) {
                setErr("Username atau password salah.");
            } else if (e.message) {
                setErr(e.message); // Menampilkan pesan error lain (misal: "Tidak bisa menghubungi API")
            } else {
                 setErr("Terjadi kesalahan saat mencoba login.");
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700">
            <div className="bg-white shadow-lg rounded-2xl w-full max-w-sm p-8 animate-fadeIn">
                <h1 className="text-2xl font-bold text-center text-blue-700 mb-6">
                    Admin Login
                </h1>

                <form onSubmit={submit} className="grid gap-4">
                    {/* Input Username */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">
                            Username
                        </label>
                        <input
                            type="text"
                            placeholder="Masukkan username"
                            value={u}
                            onChange={(e) => setU(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none transition"
                        />
                    </div>

                    {/* Input Password */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPass ? "text" : "password"}
                                placeholder="Masukkan password"
                                value={p}
                                onChange={(e) => setP(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-400 outline-none transition"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-2 top-2.5 text-gray-500 hover:text-blue-500 transition"
                            >
                                {showPass ? "🙈" : "👁️"}
                            </button>
                        </div>
                    </div>

                    {/* Pesan Error */}
                    {err && (
                        <div className="text-red-500 text-sm text-center animate-shake">
                            {err}
                        </div>
                    )}

                    {/* Tombol Submit */}
                    <button
                        type="submit"
                        className="mt-2 bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition transform hover:scale-[1.02]"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
