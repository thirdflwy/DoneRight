import React, { useState, useEffect } from "react";

const BASE_URL = "http://localhost:5000/api";

export default function AdminDashboard({ token, user, onLogout, onNavigateReport }) {
  // State
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categorySubmitting, setCategorySubmitting] = useState(false);

  // Load overview data automatically
  useEffect(() => {
    fetchOverviewData();
  }, []);

  // Fetch based on Active Tab
  useEffect(() => {
    if (activeTab === "overview") {
      fetchOverviewData();
    } else if (activeTab === "all-tasks") {
      fetchAllTasks();
    } else if (activeTab === "overdue-tasks") {
      fetchOverdueTasks();
    } else if (activeTab === "categories") {
      fetchCategories();
    }
  }, [activeTab]);

  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      // 1. Stats
      const statsRes = await fetch(`${BASE_URL}/admin/statistics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statsData = statsRes.ok ? await statsRes.json() : null;
      setStats(statsData);

      // 2. Overdue tasks
      const overdueRes = await fetch(`${BASE_URL}/admin/overdue`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const overdueData = overdueRes.ok ? await overdueRes.json() : [];
      setOverdueTasks(overdueData);

      // 3. All tasks for priority calculation
      const tasksRes = await fetch(`${BASE_URL}/admin/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tasksData = tasksRes.ok ? await tasksRes.json() : [];
      setAllTasks(tasksData);
    } catch (err) {
      console.error("Overview data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAllTasks(data);
      }
    } catch (err) {
      console.error("All tasks load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOverdueTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/overdue`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOverdueTasks(data);
      }
    } catch (err) {
      console.error("Overdue tasks load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Categories load error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create Category
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      alert("Nama kategori wajib diisi!");
      return;
    }

    setCategorySubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: categoryName.trim() }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan kategori.");

      setShowCategoryModal(false);
      setCategoryName("");
      await fetchCategories();
      alert("Kategori global baru berhasil ditambahkan!");
    } catch (err) {
      console.error("Save global category error:", err);
      alert("Gagal menyimpan kategori global.");
    } finally {
      setCategorySubmitting(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kategori global ini?")) return;

    try {
      const res = await fetch(`${BASE_URL}/admin/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Gagal menghapus kategori.");

      await fetchCategories();
      alert("Kategori global berhasil dihapus!");
    } catch (err) {
      console.error("Delete global category error:", err);
      alert("Gagal menghapus kategori global.");
    }
  };

  // Priority calculations
  const totalTasksCount = stats ? stats.total_tasks || 0 : allTasks.length;
  const completedTasksCount = stats ? stats.completed_tasks || 0 : allTasks.filter((t) => t.is_completed).length;
  const overdueCount = overdueTasks.length;
  const activeCount = Math.max(0, totalTasksCount - completedTasksCount - overdueCount);
  const completionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  allTasks.forEach((t) => {
    if (t.priority === "high") highCount++;
    else if (t.priority === "medium") mediumCount++;
    else if (t.priority === "low") lowCount++;
  });

  const highPercent = totalTasksCount > 0 ? (highCount / totalTasksCount) * 100 : 0;
  const mediumPercent = totalTasksCount > 0 ? (mediumCount / totalTasksCount) * 100 : 0;
  const lowPercent = totalTasksCount > 0 ? (lowCount / totalTasksCount) * 100 : 0;

  return (
    <div>
      {/* NAVBAR */}
      <nav className="dashboard-navbar">
        <div className="navbar-brand">
          <div className="logo-icon-admin"></div>
          <div>
            <div className="navbar-title">DoneRight Admin</div>
            <div className="navbar-subtitle">Admin DoneRight</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            className="btn-primary"
            onClick={onNavigateReport}
            style={{ backgroundColor: "#00a854", borderColor: "#00a854", padding: "6px 14px", fontSize: "14px" }}
          >
            📄 Laporan
          </button>
          <button className="btn-logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <div className="dashboard-container">
        {/* TABS HEADER */}
        <div className="admin-tabs-card">
          <div className="admin-tabs-row">
            <button
              className={`admin-tab-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`admin-tab-btn ${activeTab === "all-tasks" ? "active" : ""}`}
              onClick={() => setActiveTab("all-tasks")}
            >
              Semua Tugas
            </button>
            <button
              className={`admin-tab-btn ${activeTab === "overdue-tasks" ? "active" : ""}`}
              onClick={() => setActiveTab("overdue-tasks")}
            >
              Tugas Overdue{" "}
              {overdueCount > 0 && <span className="admin-tab-badge">{overdueCount}</span>}
            </button>
            <button
              className={`admin-tab-btn ${activeTab === "categories" ? "active" : ""}`}
              onClick={() => setActiveTab("categories")}
            >
              Kelola Kategori
            </button>
          </div>
        </div>

        {/* TAB PANEL: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="tab-panel active">
            {/* STATS GRID */}
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-left">
                  <span className="admin-stat-label">Total Tugas</span>
                  <span className="admin-stat-value">{totalTasksCount}</span>
                  <span className="admin-stat-sub">Tugas terdaftar</span>
                </div>
                <div className="admin-stat-icon-circle icon-blue">📄</div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-left">
                  <span className="admin-stat-label">Selesai</span>
                  <span className="admin-stat-value">{completedTasksCount}</span>
                  <span className="admin-stat-sub">{completionRate}% completion rate</span>
                </div>
                <div className="admin-stat-icon-circle icon-green">✓</div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-left">
                  <span className="admin-stat-label">Aktif</span>
                  <span className="admin-stat-value">{activeCount}</span>
                  <span className="admin-stat-sub">Sedang berjalan</span>
                </div>
                <div className="admin-stat-icon-circle icon-yellow">🕒</div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-left">
                  <span className="admin-stat-label">Overdue</span>
                  <span className="admin-stat-value">{overdueCount}</span>
                  <span className="admin-stat-sub">Perlu perhatian</span>
                </div>
                <div className="admin-stat-icon-circle icon-red">⚠</div>
              </div>
            </div>

            {/* PRIORITY DISTRIBUTION */}
            <div className="board-card">
              <div className="board-title">Distribusi Prioritas</div>
              <div className="priority-dist-row">
                <div className="priority-progress-item">
                  <div className="priority-progress-header">
                    <span>High Priority</span>
                    <span>{highCount} tugas</span>
                  </div>
                  <div className="priority-progress-bar">
                    <div className="priority-progress-fill fill-red" style={{ width: `${highPercent}%` }}></div>
                  </div>
                </div>

                <div className="priority-progress-item">
                  <div className="priority-progress-header">
                    <span>Medium Priority</span>
                    <span>{mediumCount} tugas</span>
                  </div>
                  <div className="priority-progress-bar">
                    <div className="priority-progress-fill fill-yellow" style={{ width: `${mediumPercent}%` }}></div>
                  </div>
                </div>

                <div className="priority-progress-item">
                  <div className="priority-progress-header">
                    <span>Low Priority</span>
                    <span>{lowCount} tugas</span>
                  </div>
                  <div className="priority-progress-bar">
                    <div className="priority-progress-fill fill-green" style={{ width: `${lowPercent}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB PANEL: SEMUA TUGAS */}
        {activeTab === "all-tasks" && (
          <div className="tab-panel active">
            <div className="board-card">
              <div className="board-title" style={{ marginBottom: "20px" }}>
                Monitoring Seluruh Tugas
              </div>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Judul</th>
                      <th>Prioritas</th>
                      <th>Status</th>
                      <th>Deadline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && allTasks.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: "center", color: "var(--text-muted)" }}>
                          Memuat tugas...
                        </td>
                      </tr>
                    ) : allTasks.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: "center", color: "var(--text-muted)" }}>
                          Tidak ada tugas terdaftar.
                        </td>
                      </tr>
                    ) : (
                      allTasks.map((task) => {
                        const now = new Date();
                        const deadline = task.deadline ? new Date(task.deadline) : null;
                        
                        let statusBadge = "";
                        if (task.is_completed) {
                          statusBadge = <span className="badge badge-completed">COMPLETED</span>;
                        } else if (deadline && deadline < now) {
                          statusBadge = <span className="badge badge-overdue">OVERDUE</span>;
                        } else {
                          statusBadge = <span className="badge badge-active">ACTIVE</span>;
                        }

                        return (
                          <tr key={task.id_tasks}>
                            <td>
                              <div className="admin-table-title">{task.title}</div>
                              <div className="admin-table-subtitle">{task.description || "-"}</div>
                            </td>
                            <td>
                              <span className={`badge badge-${task.priority}`}>
                                {task.priority.toUpperCase()}
                              </span>
                            </td>
                            <td>{statusBadge}</td>
                            <td>{deadline ? deadline.toLocaleDateString("id-ID") : "-"}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB PANEL: TUGAS OVERDUE */}
        {activeTab === "overdue-tasks" && (
          <div className="tab-panel active">
            <div className="board-card">
              <div className="board-title" style={{ marginBottom: "20px" }}>
                Tugas Overdue ({overdueCount})
              </div>
              <div className="overdue-list-row">
                {loading && overdueTasks.length === 0 ? (
                  <div className="empty-state">
                    <p>Memuat tugas overdue...</p>
                  </div>
                ) : overdueTasks.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">🎉</div>
                    <p>Hebat! Tidak ada tugas yang terlambat.</p>
                  </div>
                ) : (
                  overdueTasks.map((task) => {
                    const deadline = task.deadline ? new Date(task.deadline) : null;
                    return (
                      <div className="task-item-overdue" key={task.id_tasks}>
                        <h3 className="task-title" style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>
                          {task.title}
                        </h3>
                        <p className="task-desc" style={{ fontSize: "14px", marginBottom: "14px" }}>
                          {task.description || "-"}
                        </p>
                        <div className="task-badges">
                          <span className="badge badge-high" style={{ fontWeight: 600 }}>
                            HIGH
                          </span>
                          <span className="badge badge-deadline-overdue" style={{ fontWeight: 500 }}>
                            Deadline: {deadline ? deadline.toLocaleDateString("id-ID") : "-"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB PANEL: KELOLA KATEGORI */}
        {activeTab === "categories" && (
          <div className="tab-panel active">
            <div className="board-card">
              <div className="board-header">
                <div className="board-title">Kelola Kategori Tugas</div>
                <button
                  className="btn-primary"
                  onClick={() => setShowCategoryModal(true)}
                  style={{ padding: "8px 16px", fontSize: "14px" }}
                >
                  <span className="btn-icon-add">+</span> Tambah Kategori
                </button>
              </div>

              <div className="category-cards-grid">
                {loading && categories.length === 0 ? (
                  <div className="empty-state" style={{ gridColumn: "span 2" }}>
                    <p>Memuat kategori...</p>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="empty-state" style={{ gridColumn: "span 2" }}>
                    <p>Tidak ada kategori global.</p>
                  </div>
                ) : (
                  categories.map((cat) => {
                    const nameLower = cat.name.toLowerCase();
                    const isDefault = nameLower === "akademik" || nameLower === "organisasi" || nameLower === "pekerjaan";
                    const typeText = isDefault ? "Kategori Default" : "Kategori Custom";
                    const dateText = cat.created_at ? new Date(cat.created_at).toLocaleDateString("id-ID") : "14/5/2026";

                    return (
                      <div className="category-admin-card" key={cat.id_categories}>
                        <div className="category-admin-left">
                          <span className="category-admin-name">
                            {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                          </span>
                          <span className="category-admin-type">{typeText}</span>
                          <span className="category-admin-date">Dibuat: {dateText}</span>
                        </div>
                        {!isDefault && (
                          <button
                            className="btn-delete-icon"
                            onClick={() => handleDeleteCategory(cat.id_categories)}
                            title="Hapus Kategori"
                          >
                            <svg viewBox="0 0 24 24">
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ADD GLOBAL CATEGORY */}
      {showCategoryModal && (
        <div className="modal-overlay active">
          <div className="modal-content" style={{ maxWidth: "420px" }}>
            <div className="modal-header">
              <div className="modal-title">Tambah Kategori Baru</div>
            </div>
            <form onSubmit={handleCategorySubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nama Kategori *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Masukkan nama kategori"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    required
                    disabled={categorySubmitting}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-batal"
                  onClick={() => setShowCategoryModal(false)}
                  disabled={categorySubmitting}
                >
                  Batal
                </button>
                <button type="submit" className="btn-simpan" disabled={categorySubmitting}>
                  {categorySubmitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
