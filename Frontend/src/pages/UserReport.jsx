import React, { useState, useEffect } from "react";

const BASE_URL = "http://localhost:5000/api";

export default function UserReport({ token, user, onLogout, onNavigateDashboard }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

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
      showToast("Laporan PDF berhasil diunduh!", "success");
    } catch (err) {
      console.error("PDF download error:", err);
      showToast("Gagal mengunduh laporan PDF.", "error");
    } finally {
      setDownloading(false);
    }
  };

  const productivity = stats ? stats.productivity || 0 : 0;

  return (
    <div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="dashboard-navbar">
        <div className="navbar-brand">
          <div className="logo-icon" style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
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
          <div>
            <div className="navbar-title">DoneRight</div>
            <div className="navbar-subtitle">Analisis Performa Produktivitas</div>
          </div>
        </div>
        <button className="btn-logout" onClick={onLogout}>
          Logout
        </button>
      </nav>

      {/* MAIN CONTAINER */}
      <div className="dashboard-container" style={{ maxWidth: "760px" }}>
        {/* BACK BUTTON */}
        <div className="report-header-row" style={{ display: "flex", justifyContent: "space-between", marginBottom: "28px" }}>
          <button 
            className="btn-secondary" 
            onClick={onNavigateDashboard}
            style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "8px", 
              padding: "10px 16px",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              color: "#475569",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f8fafc";
              e.currentTarget.style.borderColor = "#cbd5e1";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.borderColor = "#e2e8f0";
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Dashboard
          </button>
        </div>

        {loading ? (
          <div 
            className="report-loading" 
            style={{ 
              textAlign: "center", 
              padding: "60px 20px", 
              color: "var(--text-muted)",
              background: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #f1f5f9",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="var(--primary-color)" strokeWidth={2.5} style={{ animation: "spin 1s linear infinite" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" />
              </svg>
            </div>
            <p style={{ fontWeight: 500, color: "#475569" }}>Menganalisis performa tugas Anda...</p>
          </div>
        ) : !stats ? (
          <div 
            className="report-loading" 
            style={{ 
              textAlign: "center", 
              padding: "60px 20px", 
              color: "#ef4444",
              background: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #fee2e2",
              boxShadow: "0 4px 6px -1px rgba(239,68,68,0.05)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p style={{ color: "#ef4444", fontWeight: 500 }}>Terjadi kesalahan saat memuat data laporan.</p>
          </div>
        ) : (
          <div className="report-content active">
            {/* BIG BANNER */}
            <div 
              className="big-productivity-card" 
              style={{
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                borderRadius: "16px",
                padding: "28px",
                color: "white",
                boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.4)",
                marginBottom: "28px",
                textAlign: "center"
              }}
            >
              <div className="big-prod-label" style={{ fontSize: "14px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.9 }}>Productivity Rate Anda</div>
              <div className="big-prod-value" style={{ fontSize: "56px", fontWeight: "800", marginTop: "8px", lineHeight: 1 }}>{productivity}%</div>
              <div className="progress-bar-container" style={{ backgroundColor: "rgba(255,255,255,0.2)", height: "10px", marginTop: "18px", borderRadius: "10px", overflow: "hidden" }}>
                <div className="progress-bar-fill" style={{ backgroundColor: "white", width: `${productivity}%`, height: "100%", borderRadius: "10px", transition: "width 0.6s ease" }}></div>
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
                <div className="admin-stat-icon-circle icon-blue">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-left">
                  <span className="admin-stat-label">Tugas Selesai</span>
                  <span className="admin-stat-value">{stats.completed_tasks || 0}</span>
                  <span className="admin-stat-sub">Berhasil diselesaikan</span>
                </div>
                <div className="admin-stat-icon-circle icon-green">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-left">
                  <span className="admin-stat-label">Tepat Waktu</span>
                  <span className="admin-stat-value">{stats.on_time || 0}</span>
                  <span className="admin-stat-sub">Sebelum deadline</span>
                </div>
                <div className="admin-stat-icon-circle icon-yellow">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-left">
                  <span className="admin-stat-label">Terlambat</span>
                  <span className="admin-stat-value">{stats.overdue || 0}</span>
                  <span className="admin-stat-sub">Melewati deadline</span>
                </div>
                <div className="admin-stat-icon-circle icon-red">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* ACTION CARD */}
            <div 
              className="report-action-card" 
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                border: "1px solid var(--border-color)",
                padding: "28px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01)"
              }}
            >
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-main)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--primary-color)" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Unduh Laporan Format PDF
              </h3>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px", lineHeight: 1.6 }}>
                Dapatkan dokumen PDF resmi yang memuat rincian statistik tugas, kategori, dan timeline performa produktivitas Anda.
              </p>
              <button
                className="btn-primary"
                onClick={handleDownloadPDF}
                style={{ 
                  backgroundColor: "#00a854", 
                  borderColor: "#00a854", 
                  width: "100%", 
                  padding: "12px", 
                  fontSize: "16px", 
                  fontWeight: "600",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#008f47";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#00a854";
                }}
                disabled={downloading}
              >
                {downloading ? (
                  "Mengunduh PDF..."
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Unduh Laporan PDF
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      {/* TOAST NOTIFICATION */}
      <div className={`toast-notification ${toast.show ? "active" : ""} ${toast.type}`}>
        <div className="toast-message">{toast.message}</div>
      </div>
    </div>
  );
}
