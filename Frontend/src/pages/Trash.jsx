import React, { useState, useEffect } from "react";

const BASE_URL = "http://localhost:5000/api";

export default function Trash({ token, onLogout, onNavigateDashboard }) {
  const [trashTasks, setTrashTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: null,
    onCancel: null,
    confirmText: "Ya, Hapus",
    cancelText: "Batal",
    isDanger: true
  });

  useEffect(() => {
    fetchTrash();
  }, []);

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/tasks/trash`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTrashTasks(data);
      }
    } catch (err) {
      console.error("Fetch trash error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Restore task (individual)
  const handleRestore = async (id) => {
    setProcessing(true);
    try {
      const res = await fetch(`${BASE_URL}/tasks/restore/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchTrash();
      }
    } catch (err) {
      console.error("Restore task error:", err);
    } finally {
      setProcessing(false);
    }
  };

  // Delete permanently actual
  const executeDeletePermanent = async (id) => {
    setProcessing(true);
    try {
      const res = await fetch(`${BASE_URL}/tasks/permanent/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchTrash();
      }
    } catch (err) {
      console.error("Delete permanent error:", err);
    } finally {
      setProcessing(false);
    }
  };

  // Delete permanently (individual)
  const handleDeletePermanent = (id) => {
    setConfirmModal({
      show: true,
      title: "Hapus Permanen",
      message: "Apakah Anda yakin ingin menghapus tugas ini secara PERMANEN? Tindakan ini tidak dapat dibatalkan!",
      confirmText: "Ya, Hapus Permanen",
      cancelText: "Batal",
      isDanger: true,
      onConfirm: () => executeDeletePermanent(id),
      onCancel: () => {}
    });
  };

  // Restore all actual
  const executeRestoreAll = async () => {
    setProcessing(true);
    try {
      await Promise.all(
        trashTasks.map((task) =>
          fetch(`${BASE_URL}/tasks/restore/${task.id_tasks}`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      await fetchTrash();
    } catch (err) {
      console.error("Restore all error:", err);
    } finally {
      setProcessing(false);
    }
  };

  // Restore All Tasks
  const handleRestoreAll = () => {
    if (trashTasks.length === 0) return;
    setConfirmModal({
      show: true,
      title: "Pulihkan Semua Tugas",
      message: "Apakah Anda yakin ingin memulihkan SEMUA tugas di keranjang sampah kembali ke Dashboard?",
      confirmText: "Ya, Pulihkan",
      cancelText: "Batal",
      isDanger: false,
      onConfirm: () => executeRestoreAll(),
      onCancel: () => {}
    });
  };

  // Clear all actual
  const executeClearAll = async () => {
    setProcessing(true);
    try {
      await Promise.all(
        trashTasks.map((task) =>
          fetch(`${BASE_URL}/tasks/permanent/${task.id_tasks}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      await fetchTrash();
    } catch (err) {
      console.error("Clear all error:", err);
    } finally {
      setProcessing(false);
    }
  };

  // Delete All Permanently
  const handleClearAll = () => {
    if (trashTasks.length === 0) return;
    setConfirmModal({
      show: true,
      title: "Kosongkan Tempat Sampah",
      message: "PERINGATAN! Apakah Anda yakin ingin menghapus SEMUA tugas di keranjang sampah secara PERMANEN?\nTindakan ini tidak dapat dibatalkan!",
      confirmText: "Ya, Hapus Semua",
      cancelText: "Batal",
      isDanger: true,
      onConfirm: () => executeClearAll(),
      onCancel: () => {}
    });
  };

  return (
    <div>
      {/* NAVBAR */}
      <nav className="dashboard-navbar">
        <div className="navbar-brand">
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
          <div>
            <div className="navbar-title">DoneRight</div>
            <div className="navbar-subtitle">
              Keranjang Sampah & Restorasi
            </div>
          </div>
        </div>
        <button className="btn-logout" onClick={onLogout}>
          Logout
        </button>
      </nav>

      {/* MAIN CONTAINER */}
      <div className="dashboard-container">
        {/* HEADER ROW WITH ACTION BUTTONS */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
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

          {trashTasks.length > 0 && (
            <div className="btn-group-row" style={{ gap: "10px" }}>
              <button
                className="btn-secondary"
                onClick={handleRestoreAll}
                disabled={processing}
                style={{ 
                  backgroundColor: "#ecfdf5", 
                  color: "#10b981", 
                  fontSize: "14px", 
                  fontWeight: "600",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: "1px solid #d1fae5",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#d1fae5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#ecfdf5";
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" />
                </svg>
                Pulihkan Semua
              </button>
              <button
                className="btn-primary"
                onClick={handleClearAll}
                disabled={processing}
                style={{ 
                  backgroundColor: "#ef4444", 
                  borderColor: "#ef4444", 
                  fontSize: "14px", 
                  fontWeight: "600",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#dc2626";
                  e.currentTarget.style.borderColor = "#dc2626";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#ef4444";
                  e.currentTarget.style.borderColor = "#ef4444";
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Kosongkan Sampah
              </button>
            </div>
          )}
        </div>

        {/* TRASHED TASKS BOARD */}
        <div className="board-card" style={{ marginBottom: "20px" }}>
          <div className="board-header" style={{ marginBottom: "20px" }}>
            <div className="board-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Keranjang Sampah ({trashTasks.length})
            </div>
          </div>

          {/* LIST INSIDE BOARD CARD */}
          <div>
            {loading ? (
              <div className="empty-state">
                <div className="empty-state-icon">🗑️</div>
                <p>Memuat keranjang sampah...</p>
              </div>
            ) : trashTasks.length === 0 ? (
              <div className="empty-state" style={{ padding: "60px 20px" }}>
                <div className="empty-state-icon" style={{ fontSize: "56px", opacity: 0.7 }}>
                  🗑️
                </div>
                <h3 style={{ fontSize: "18px", color: "var(--text-main)", marginTop: "12px", fontWeight: "600" }}>
                  Keranjang Sampah Kosong
                </h3>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "6px" }}>
                  Tugas yang Anda hapus sementara akan tampil di sini untuk dipulihkan kembali.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {trashTasks.map((task) => {
                  const deadline = task.deadline ? new Date(task.deadline) : null;
                  return (
                    <div className="task-item" key={task.id_tasks} style={{ borderLeft: "4px solid #ef4444", margin: 0 }}>
                      <div className="task-left">
                        <h3 className="task-title" style={{ color: "#334155" }}>
                          {task.title}
                        </h3>
                        {task.description && <p className="task-desc">{task.description}</p>}

                        <div className="task-badges">
                          <span className={`badge badge-${task.priority}`}>
                            {task.priority.toUpperCase()}
                          </span>
                          {task.category_name && (
                            <span className="badge badge-category">
                              {task.category_name.charAt(0).toUpperCase() + task.category_name.slice(1)}
                            </span>
                          )}
                          {deadline && (
                            <span className="badge badge-deadline">
                              Deadline: {deadline.toLocaleDateString("id-ID")}{" "}
                              {deadline.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="task-right" style={{ gap: "8px", justifyContent: "center", flexDirection: "row", alignSelf: "center" }}>
                        <button
                          onClick={() => handleRestore(task.id_tasks)}
                          disabled={processing}
                          style={{ 
                            background: "#ecfdf5", 
                            border: "1px solid #d1fae5", 
                            borderRadius: "8px", 
                            padding: "6px 12px", 
                            color: "#10b981", 
                            fontSize: "13px", 
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#d1fae5";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#ecfdf5";
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" />
                          </svg>
                          Pulihkan
                        </button>
                        <button
                          onClick={() => handleDeletePermanent(task.id_tasks)}
                          disabled={processing}
                          style={{ 
                            background: "#fef2f2", 
                            border: "1px solid #fee2e2", 
                            borderRadius: "8px", 
                            padding: "6px 12px", 
                            color: "#ef4444", 
                            fontSize: "13px", 
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#fee2e2";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#fef2f2";
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Hapus Permanen
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      {/* CUSTOM CONFIRMATION MODAL */}
      {confirmModal.show && (
        <div className="modal-overlay active" style={{ zIndex: 200 }}>
          <div className="modal-content" style={{ maxWidth: "420px" }}>
            <div className="modal-header">
              <div className="modal-title" style={{ color: confirmModal.isDanger ? "#ef4444" : "#0f172a" }}>
                {confirmModal.title}
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  color: "#94a3b8",
                  cursor: "pointer",
                  transition: "color 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#475569"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.6, margin: 0 }}>
                {confirmModal.message}
              </p>
            </div>
            <div className="modal-footer" style={{ borderTop: "none", backgroundColor: "#f8fafc", padding: "16px 24px" }}>
              <button
                type="button"
                className="btn-batal"
                onClick={() => {
                  if (confirmModal.onCancel) confirmModal.onCancel();
                  setConfirmModal({ ...confirmModal, show: false });
                }}
                style={{ margin: 0, padding: "10px 20px" }}
              >
                {confirmModal.cancelText}
              </button>
              <button
                type="button"
                className={confirmModal.isDanger ? "btn-hapus-modal" : "btn-simpan"}
                onClick={() => {
                  if (confirmModal.onConfirm) confirmModal.onConfirm();
                  setConfirmModal({ ...confirmModal, show: false });
                }}
                style={{ margin: 0, padding: "10px 24px" }}
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
}
