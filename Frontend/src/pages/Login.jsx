import React, { useState } from "react";

const BASE_URL = "http://localhost:5000/api";

export default function Login({ onLoginSuccess, onNavigateRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Semua kolom wajib diisi!");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Email atau password salah.");
      }

      onLoginSuccess(data.token, data.user);
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg(err.message || "Terjadi kesalahan saat masuk.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-body">
      <div className="auth-container">
        <div className="auth-header">
          <div className="logo-icon">
            <div className="logo-inner">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="check-icon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h1>DoneRight</h1>
          <p>Sistem Manajemen Tugas Mahasiswa</p>
        </div>

        <div className="auth-card">
          <h2>Login</h2>
          
          {errorMsg && (
            <div style={{ color: "#ef4444", fontSize: "14px", marginBottom: "16px", fontWeight: 500 }}>
              ⚠ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                className="form-input"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                className="form-input"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "8px" }}>
              {loading ? "Login" : "Login"}
            </button>
          </form>

          <div className="auth-footer">
            Belum punya akun?{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigateRegister(); }}>
              Daftar di sini
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
