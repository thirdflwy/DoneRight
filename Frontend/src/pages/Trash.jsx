import React, { useState, useEffect } from "react";

const BASE_URL = "http://localhost:5000/api";

export default function Trash({ token, onLogout, onNavigateDashboard }) {
  const [trashTasks, setTrashTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

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

  // Delete permanently (individual)
  const handleDeletePermanent = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus tugas ini secara PERMANEN? Tindakan ini tidak dapat dibatalkan!")) return;
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

  // Restore All Tasks
  const handleRestoreAll = async () => {
    if (trashTasks.length === 0) return;
    if (!confirm("Apakah Anda yakin ingin memulihkan SEMUA tugas di keranjang sampah?")) return;

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
      alert("Semua tugas berhasil dipulihkan!");
    } catch (err) {
      console.error("Restore all error:", err);
      alert("Terjadi kesalahan saat memulihkan semua tugas.");
    } finally {
      setProcessing(false);
    }
  };

  // Delete All Permanently
  const handleClearAll = async () => {
    if (trashTasks.length === 0) return;
    if (
      !confirm(
        "PERINGATAN! Apakah Anda yakin ingin menghapus SEMUA tugas di keranjang sampah secara PERMANEN?\nTindakan ini tidak dapat dibatalkan!"
      )
    )
      return;

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
      alert("Semua tugas berhasil dihapus secara permanen!");
    } catch (err) {
      console.error("Clear all error:", err);
      alert("Terjadi kesalahan saat mengosongkan keranjang sampah.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      {/* NAVBAR */}
      <nav className="dashboard-navbar">
        <div className="navbar-brand">
          <div className="navbar-logo-icon" style={{ backgroundColor: "#ef4444" }}></div>
          <div>
            <div className="navbar-title">DoneRight Sampah</div>
            <div className="navbar-subtitle">Keranjang Sampah & Restorasi</div>
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
          <button className="btn-back-dashboard" onClick={onNavigateDashboard}>
            ← Kembali ke Dashboard
          </button>

          {trashTasks.length > 0 && (
            <div className="btn-group-row">
              <button
                className="btn-secondary"
                onClick={handleRestoreAll}
                disabled={processing}
                style={{ backgroundColor: "#ecfdf5", color: "#10b981", fontSize: "14px", fontWeight: "600" }}
              >
                🔄 Pulihkan Semua
              </button>
              <button
                className="btn-primary"
                onClick={handleClearAll}
                disabled={processing}
                style={{ backgroundColor: "#ef4444", borderColor: "#ef4444", fontSize: "14px", fontWeight: "600" }}
              >
                🗑️ Kosongkan Sampah
              </button>
            </div>
          )}
        </div>

        {/* TRASHED TASKS BOARD */}
        <div className="board-card" style={{ marginBottom: "20px" }}>
          <div className="board-header" style={{ marginBottom: "0" }}>
            <div className="board-title">
              Keranjang Sampah User ({trashTasks.length})
            </div>
          </div>
        </div>

        {/* LIST */}
        <div>
          {loading ? (
            <div className="empty-state">
              <div className="empty-state-icon">🗑️</div>
              <p>Memuat keranjang sampah...</p>
            </div>
          ) : trashTasks.length === 0 ? (
            <div className="empty-state">
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
            trashTasks.map((task) => {
              const deadline = task.deadline ? new Date(task.deadline) : null;
              return (
                <div className="task-item" key={task.id_tasks} style={{ borderLeft: "4px solid #ef4444" }}>
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

                  <div className="task-right" style={{ gap: "10px", justifyContent: "center" }}>
                    <button
                      className="btn-detail"
                      onClick={() => handleRestore(task.id_tasks)}
                      disabled={processing}
                      style={{ color: "#10b981", fontSize: "14px", fontWeight: "600" }}
                    >
                      Pulihkan
                    </button>
                    <button
                      className="btn-detail"
                      onClick={() => handleDeletePermanent(task.id_tasks)}
                      disabled={processing}
                      style={{ color: "#ef4444", fontSize: "14px", fontWeight: "600" }}
                    >
                      Hapus Permanen
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
