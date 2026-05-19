import React, { useState, useEffect } from "react";

const BASE_URL = "http://localhost:5000/api";

export default function AdminReport({ token, user, onLogout, onNavigateDashboard }) {
  const [stats, setStats] = useState(null);
  const [overdueCount, setOverdueCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchGlobalReport();
  }, []);

  const fetchGlobalReport = async () => {
    try {
      const statsRes = await fetch(`${BASE_URL}/admin/statistics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statsData = statsRes.ok ? await statsRes.json() : null;
      setStats(statsData);

      const overdueRes = await fetch(`${BASE_URL}/admin/overdue`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const overdueList = overdueRes.ok ? await overdueRes.json() : [];
      setOverdueCount(overdueList.length);
    } catch (err) {
      console.error("Global report load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`${BASE_URL}/statistics/pdf/global`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal mengunduh dokumen global.");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Laporan_Sistem_Global.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Global PDF download error:", err);
      alert("Gagal mengunduh laporan PDF global.");
    } finally {
      setDownloading(false);
    }
  };

  const total = stats ? stats.total_tasks || 0 : 0;
  const completed = stats ? stats.completed_tasks || 0 : 0;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div>
      {/* NAVBAR */}
      <nav className="dashboard-navbar">
        <div className="navbar-brand">
          <div className="logo-icon-admin"></div>
          <div>
            <div className="navbar-title">DoneRight Admin Laporan</div>
            <div className="navbar-subtitle">Overall System Statistics</div>
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
            ← Kembali ke Dashboard Admin
          </button>
        </div>

        {loading ? (
          <div className="report-loading">
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>📊</div>
            <p>Menganalisis data sistem keseluruhan...</p>
          </div>
        ) : !stats ? (
          <div className="report-loading">
            <div style={{ fontSize: "32px", color: "#ef4444", marginBottom: "12px" }}>⚠</div>
            <p style={{ color: "#ef4444" }}>Terjadi kesalahan saat memuat data laporan global.</p>
          </div>
        ) : (
          <div className="report-content active">
            {/* BIG BANNER */}
            <div className="big-productivity-card">
              <div className="big-prod-label">Global Productivity Rate Sistem</div>
              <div className="big-prod-value">{completionRate}%</div>
              <div className="progress-bar-container" style={{ backgroundColor: "rgba(255,255,255,0.2)", height: "10px", marginTop: "18px" }}>
                <div className="progress-bar-fill" style={{ backgroundColor: "white", width: `${completionRate}%` }}></div>
              </div>
            </div>

            {/* STATS GRID */}
            <div className="admin-stats-grid" style={{ marginBottom: "28px" }}>
              <div className="admin-stat-card">
                <div className="admin-stat-left">
                  <span className="admin-stat-label">Total Pengguna</span>
                  <span className="admin-stat-value">{stats.total_users || 0}</span>
                  <span className="admin-stat-sub">User terdaftar</span>
                </div>
                <div className="admin-stat-icon-circle icon-blue">👥</div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-left">
                  <span className="admin-stat-label">Total Semua Tugas</span>
                  <span className="admin-stat-value">{total}</span>
                  <span className="admin-stat-sub">Seluruh tugas pengguna</span>
                </div>
                <div className="admin-stat-icon-circle icon-blue">📄</div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-left">
                  <span className="admin-stat-label">Tugas Selesai</span>
                  <span className="admin-stat-value">{completed}</span>
                  <span className="admin-stat-sub">Berhasil diselesaikan</span>
                </div>
                <div className="admin-stat-icon-circle icon-green">✓</div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-left">
                  <span className="admin-stat-label">Tugas Overdue</span>
                  <span className="admin-stat-value">{overdueCount}</span>
                  <span className="admin-stat-sub">Tugas yang terlambat</span>
                </div>
                <div className="admin-stat-icon-circle icon-red">⚠</div>
              </div>
            </div>

            {/* ACTION CARD */}
            <div className="report-action-card">
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-main)", marginBottom: "8px" }}>
                Unduh Laporan Global Format PDF
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px" }}>
                Dapatkan dokumen laporan PDF global resmi yang memuat rangkuman statistik pengguna, tugas, dan tingkat penyelesaian tepat waktu di seluruh sistem.
              </p>
              <button
                className="btn-primary"
                onClick={handleDownloadPDF}
                style={{ backgroundColor: "#00a854", borderColor: "#00a854", width: "100%", padding: "12px", fontSize: "16px", fontWeight: "600" }}
                disabled={downloading}
              >
                {downloading ? "Mengunduh PDF Global..." : "📄 Unduh Laporan PDF Global"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
