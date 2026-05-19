import React, { useState, useEffect } from "react";

const BASE_URL = "http://localhost:5000/api";

export default function UserReport({ token, user, onLogout, onNavigateDashboard }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${BASE_URL}/statistics/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Personal report load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`${BASE_URL}/statistics/pdf/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal mengunduh dokumen.");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Laporan_Produktivitas_Anda.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download error:", err);
      alert("Gagal mengunduh laporan PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const productivity = stats ? stats.productivity || 0 : 0;

  return (
    <div>
      {/* NAVBAR */}
      <nav className="dashboard-navbar">
        <div className="navbar-brand">
          <div className="navbar-logo-icon"></div>
          <div>
            <div className="navbar-title">DoneRight Laporan</div>
            <div className="navbar-subtitle">Analisis Performa Produktivitas</div>
          </div>
        </div>
        <button className="btn-logout" onClick={onLogout}>
          Logout
        </button>
      </nav>

      {/* MAIN CONTAINER */}
      <div className="dashboard-container" style={{ maxWidth: "720px" }}>
        {/* BACK BUTTON */}
        <div className="report-header-row" style={{ display: "flex", justifyContent: "space-between", marginBottom: "28px" }}>
          <button className="btn-back-dashboard" onClick={onNavigateDashboard}>
            ← Kembali ke Dashboard
          </button>
        </div>

        {loading ? (
          <div className="report-loading">
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>📊</div>
            <p>Menganalisis performa tugas Anda...</p>
          </div>
        ) : !stats ? (
          <div className="report-loading">
            <div style={{ fontSize: "32px", color: "#ef4444", marginBottom: "12px" }}>⚠</div>
            <p style={{ color: "#ef4444" }}>Terjadi kesalahan saat memuat data laporan.</p>
          </div>
        ) : (
          <div className="report-content active">
            {/* BIG BANNER */}
            <div className="big-productivity-card">
              <div className="big-prod-label">Productivity Rate Anda</div>
              <div className="big-prod-value">{productivity}%</div>
              <div className="progress-bar-container" style={{ backgroundColor: "rgba(255,255,255,0.2)", height: "10px", marginTop: "18px" }}>
                <div className="progress-bar-fill" style={{ backgroundColor: "white", width: `${productivity}%` }}></div>
              </div>
            </div>

            {/* STATS GRID */}
            <div className="admin-stats-grid" style={{ marginBottom: "28px" }}>
              <div className="admin-stat-card">
                <div className="admin-stat-left">
                  <span className="admin-stat-label">Total Tugas</span>
                  <span className="admin-stat-value">{stats.total_tasks || 0}</span>
                  <span className="admin-stat-sub">Tugas Anda terdaftar</span>
                </div>
                <div className="admin-stat-icon-circle icon-blue">📄</div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-left">
                  <span className="admin-stat-label">Tugas Selesai</span>
                  <span className="admin-stat-value">{stats.completed_tasks || 0}</span>
                  <span className="admin-stat-sub">Berhasil diselesaikan</span>
                </div>
                <div className="admin-stat-icon-circle icon-green">✓</div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-left">
                  <span className="admin-stat-label">Tepat Waktu</span>
                  <span className="admin-stat-value">{stats.on_time || 0}</span>
                  <span className="admin-stat-sub">Sebelum deadline</span>
                </div>
                <div className="admin-stat-icon-circle icon-yellow">🕒</div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-left">
                  <span className="admin-stat-label">Terlambat</span>
                  <span className="admin-stat-value">{stats.overdue || 0}</span>
                  <span className="admin-stat-sub">Melewati deadline</span>
                </div>
                <div className="admin-stat-icon-circle icon-red">⚠</div>
              </div>
            </div>

            {/* ACTION CARD */}
            <div className="report-action-card">
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-main)", marginBottom: "8px" }}>
                Unduh Laporan Format PDF
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px" }}>
                Dapatkan dokumen PDF resmi yang memuat rincian statistik tugas, kategori, dan timeline performa produktivitas Anda.
              </p>
              <button
                className="btn-primary"
                onClick={handleDownloadPDF}
                style={{ backgroundColor: "#00a854", borderColor: "#00a854", width: "100%", padding: "12px", fontSize: "16px", fontWeight: "600" }}
                disabled={downloading}
              >
                {downloading ? "Mengunduh PDF..." : "📄 Unduh Laporan PDF"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
