import { useState, useEffect } from "react";

const BASE_URL = "http://localhost:5000/api";

export default function Dashboard({ token, user, onLogout, onNavigateReport, onNavigateTrash }) {
  // State
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [sortBy, setSortBy] = useState("deadline");
  const [viewMode, setViewMode] = useState("list");

  // Modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Selected Items for modals
  const [selectedTask, setSelectedTask] = useState(null); // for Detail view
  const [editingTask, setEditingTask] = useState(null); // for edit inside Task Modal

  // Form states
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskCategory, setTaskCategory] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskDeadline, setTaskDeadline] = useState("");

  const [categoryName, setCategoryName] = useState("");
  const [categorySubmitting, setCategorySubmitting] = useState(false);
  const [taskSubmitting, setTaskSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${BASE_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error("Tasks fetch error:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${BASE_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Categories fetch error:", err);
    }
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchTasks(), fetchCategories()]);
    } catch (err) {
      console.error("Initial load error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Data on Load
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Checkbox Toggle Completion
  const handleToggleCompleted = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/tasks/toggle/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        await fetchTasks();
      }
    } catch (err) {
      console.error("Toggle completion error:", err);
    }
  };

  // Submit Task (Add or Edit)
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskPriority || !taskDeadline) {
      alert("Kolom dengan bintang (*) wajib diisi!");
      return;
    }

    setTaskSubmitting(true);
    const bodyData = {
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      id_categories: taskCategory ? parseInt(taskCategory, 10) : null,
      priority: taskPriority,
      deadline: taskDeadline,
    };

    try {
      let url = `${BASE_URL}/tasks`;
      let method = "POST";

      if (editingTask) {
        url = `${BASE_URL}/tasks/${editingTask.id_tasks}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) throw new Error("Gagal menyimpan tugas.");

      setShowTaskModal(false);
      await fetchTasks();
    } catch (err) {
      console.error("Task submit error:", err);
      alert(err.message || "Gagal menyimpan tugas.");
    } finally {
      setTaskSubmitting(false);
    }
  };

  // Submit Category
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      alert("Nama kategori wajib diisi!");
      return;
    }

    setCategorySubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/categories`, {
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
      alert("Kategori kustom baru berhasil dibuat!");
    } catch (err) {
      console.error("Category save error:", err);
      alert("Terjadi kesalahan saat menyimpan kategori.");
    } finally {
      setCategorySubmitting(false);
    }
  };

  // Delete Task
  const handleDeleteTask = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus tugas ini?")) return;

    try {
      const res = await fetch(`${BASE_URL}/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setShowDetailModal(false);
        await fetchTasks();
      }
    } catch (err) {
      console.error("Delete task error:", err);
    }
  };

  // Open modals helper
  const openAddTask = () => {
    setEditingTask(null);
    setTaskTitle("");
    setTaskDesc("");
    setTaskCategory("");
    setTaskPriority("medium");
    setTaskDeadline("");
    setShowTaskModal(true);
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDesc(task.description || "");
    setTaskCategory(task.id_categories || "");
    setTaskPriority(task.priority);
    // Format deadline for datetime-local input
    if (task.deadline) {
      const date = new Date(task.deadline);
      const tzOffset = date.getTimezoneOffset() * 60000;
      const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
      setTaskDeadline(localISOTime);
    } else {
      setTaskDeadline("");
    }
    setShowDetailModal(false);
    setShowTaskModal(true);
  };

  // Calculation Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.is_completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filter Tasks Client-side
  const filteredTasks = tasks.filter((task) => {
    // Keyword filter
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(search.toLowerCase()));

    // Category filter
    let matchesCategory = true;
    if (filterCategory) {
      if (filterCategory === "null") {
        matchesCategory = !task.id_categories;
      } else {
        matchesCategory = task.id_categories === parseInt(filterCategory, 10);
      }
    }

    // Priority filter
    const matchesPriority = filterPriority ? task.priority === filterPriority : true;

    // Status filter
    let matchesStatus = true;
    const now = new Date();
    const deadline = task.deadline ? new Date(task.deadline) : null;
    const isOverdue = !task.is_completed && deadline && deadline < now;

    if (filterStatus === "pending") {
      matchesStatus = !task.is_completed && !isOverdue;
    } else if (filterStatus === "done") {
      matchesStatus = task.is_completed;
    } else if (filterStatus === "overdue") {
      matchesStatus = isOverdue;
    }

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  })
  .sort((a, b) => {
    if (sortBy === "deadline") {
      return new Date(a.deadline) - new Date(b.deadline);
    }

    if (sortBy === "newest") {
      return new Date(b.created_at) - new Date(a.created_at);
    }

    const priorityOrder = {
      high: 0,
      medium: 1,
      low: 2,
    };

    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const groupedTasks = filteredTasks.reduce((groups, task) => {
  const key = task.category_name || "Tanpa Kategori";

  if (!groups[key]) {
    groups[key] = [];
  }

  groups[key].push(task);

  return groups;
  }, {});

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
              Selamat datang, {user ? user.username : "Pengguna"}
            </div>
          </div>
        </div>
        <button className="btn-logout" onClick={onLogout}>
          Logout
        </button>
      </nav>

      {/* MAIN CONTAINER */}
      <div className="dashboard-container">
        {/* PROGRESS BANNER */}
        <div className="progress-banner">
          <div className="progress-banner-title">Progress Penyelesaian Tugas</div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <div className="progress-stats">
            <span>
              {completedTasks} dari {totalTasks} tugas selesai
            </span>
            <span className="progress-percentage">{progressPercent}%</span>
          </div>
        </div>

        {/* DAFTAR TUGAS FILTER BOARD */}
        <div className="board-card">
          <div className="board-header">
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div className="board-title">Daftar Tugas</div>

              <div
                style={{
                  display: "flex",
                  background: "#f1f5f9",
                  borderRadius: "10px",
                  padding: "4px",
                }}
              >
                <button
                  onClick={() => setViewMode("list")}
                  style={{
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    background: viewMode === "list" ? "white" : "transparent",
                    color: viewMode === "list" ? "#4f46e5" : "#64748b",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Daftar
                </button>

                <button
                  onClick={() => setViewMode("grouped")}
                  style={{
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    background: viewMode === "grouped" ? "white" : "transparent",
                    color: viewMode === "grouped" ? "#4f46e5" : "#64748b",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Per Kategori
                </button>
              </div>
            </div>
            <div className="btn-group-row">
              <button
                className="btn-primary"
                onClick={onNavigateReport}
                style={{ backgroundColor: "#00a854", borderColor: "#00a854", padding: "8px 16px", fontSize: "14px" }}
              >
                <span className="btn-icon-add">📄</span> Laporan
              </button>
              <button
                className="btn-secondary"
                onClick={onNavigateTrash}
                style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "8px 16px", fontSize: "14px", display: "inline-flex", gap: "6px", alignItems: "center" }}
                title="Keranjang Sampah"
              >
                <span>🗑️</span> Sampah
              </button>
              <button
                className="btn-secondary"
                onClick={() => setShowCategoryModal(true)}
                style={{ backgroundColor: "#f1f5f9", color: "#475569" }}
              >
                <span className="btn-icon-add">+</span> Kategori
              </button>
              <button className="btn-primary" onClick={openAddTask} style={{ padding: "8px 16px", fontSize: "14px" }}>
                <span className="btn-icon-add">+</span> Tambah Tugas
              </button>
            </div>
          </div>

          {/* FILTERS */}
          <div className="filters-grid">
            <input
              type="text"
              className="filter-input"
              placeholder="Cari tugas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="filter-input"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">Semua Kategori</option>
              <option value="null">Tanpa Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id_categories} value={cat.id_categories}>
                  {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                </option>
              ))}
            </select>

            <select
              className="filter-input"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="">Semua Prioritas</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <select
              className="filter-input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="pending">Belum Selesai</option>
              <option value="done">Selesai</option>
              <option value="overdue">Overdue</option>
            </select>

            <select
              className="filter-input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="deadline">Urutkan: Deadline</option>
              <option value="priority">Urutkan: Prioritas</option>
              <option value="newest">Urutkan: Terbaru</option>
            </select>
          </div>
        </div>



      {/* TASKS LIST */}
      <div id="taskListContainer">
        {loading ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p>Memuat tugas...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎉</div>
            <p>Tidak ada tugas terdaftar sesuai kriteria filter.</p>
          </div>
        ) : viewMode === "list" ? (
          filteredTasks.map((task) => {
            const deadline = task.deadline ? new Date(task.deadline) : null;

            return (
              <div className="task-item" key={task.id_tasks}>
                <div className="task-left">
                  <div className="task-title-row">
                    <div
                      className={`todo-checkbox ${task.is_completed ? "checked" : ""}`}
                      onClick={() =>
                        handleToggleCompleted(task.id_tasks)
                      }
                    ></div>

                    <h3 className={`task-title ${task.is_completed ? "completed" : ""}`}>
                      {task.title}
                    </h3>
                  </div>

                  {task.description && (
                    <p className="task-desc">{task.description}</p>
                  )}

                  <div className="task-badges">
                    <span className={`badge badge-${task.priority}`}>
                      {task.priority.toUpperCase()}
                    </span>

                    {task.category_name && (
                      <span className="badge badge-category">
                        {task.category_name}
                      </span>
                    )}

                    {deadline && (
                      <span className="badge badge-deadline">
                        Deadline:{" "}
                        {deadline.toLocaleDateString("id-ID")}
                      </span>
                    )}

                    {task.is_completed && (
                      <span className="badge badge-completed">
                        ✓ Selesai
                      </span>
                    )}
                  </div>
                </div>

                <div className="task-right">
                  <button
                    className="btn-detail"
                    onClick={() => {
                      setSelectedTask(task);
                      setShowDetailModal(true);
                    }}
                  >
                    Detail
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          Object.entries(groupedTasks).map(([category, categoryTasks]) => (
            <div
              key={category}
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                  borderBottom: "1px solid #e5e7eb",
                  paddingBottom: "10px",
                }}
              >
                <h3 style={{ fontSize: "18px", fontWeight: 700 }}>
                  {category}
                </h3>

                <span
                  style={{
                    background: "#e0e7ff",
                    color: "#4338ca",
                    padding: "4px 12px",
                    borderRadius: "999px",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  {categoryTasks.length} tugas
                </span>
              </div>

              {categoryTasks.map((task) => (
                <div className="task-item" key={task.id_tasks}>
                  <div className="task-left">
                    <div className="task-title-row">
                      <div
                        className={`todo-checkbox ${task.is_completed ? "checked" : ""}`}
                        onClick={() =>
                          handleToggleCompleted(task.id_tasks)
                        }
                      ></div>

                      <h3 className={`task-title ${task.is_completed ? "completed" : ""}`}>
                        {task.title}
                      </h3>
                    </div>

                    {task.description && (
                      <p className="task-desc">{task.description}</p>
                    )}
                  </div>

                  <button
                    className="btn-detail"
                    onClick={() => {
                      setSelectedTask(task);
                      setShowDetailModal(true);
                    }}
                  >
                    Detail
                  </button>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* MODAL: ADD / EDIT TASK */}
      {showTaskModal && (
        <div className="modal-overlay active">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">
                {editingTask ? "Edit Detail Tugas" : "Tambah Tugas Baru"}
              </div>
            </div>
            <form onSubmit={handleTaskSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Judul Tugas *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Masukkan judul tugas"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    required
                    disabled={taskSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label>Deskripsi</label>
                  <textarea
                    className="form-input"
                    placeholder="Deskripsi tugas (opsional)"
                    style={{ height: "100px", resize: "vertical" }}
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    disabled={taskSubmitting}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Kategori</label>
                  <select
                    className="form-input"
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                    disabled={taskSubmitting}
                  >
                    <option value="">Tanpa Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id_categories} value={cat.id_categories}>
                        {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Prioritas *</label>
                  <select
                    className="form-input"
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    required
                    disabled={taskSubmitting}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Deadline *</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    required
                    disabled={taskSubmitting}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-batal"
                  onClick={() => setShowTaskModal(false)}
                  disabled={taskSubmitting}
                >
                  Batal
                </button>
                <button type="submit" className="btn-simpan" disabled={taskSubmitting}>
                  {taskSubmitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL VIEW */}
      {showDetailModal && selectedTask && (
        <div className="modal-overlay active">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">Detail Tugas</div>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item" style={{ gridColumn: "span 2" }}>
                  <span className="detail-label">Judul</span>
                  <span className="detail-value">{selectedTask.title}</span>
                </div>

                <div className="detail-item" style={{ gridColumn: "span 2" }}>
                  <span className="detail-label">Deskripsi</span>
                  <span className="detail-value detail-value-span">
                    {selectedTask.description || "-"}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Kategori</span>
                  <span className="detail-value">
                    {selectedTask.category_name
                      ? selectedTask.category_name.charAt(0).toUpperCase() +
                        selectedTask.category_name.slice(1)
                      : "-"}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Prioritas</span>
                  <span className="detail-value">{selectedTask.priority.toUpperCase()}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Deadline</span>
                  <span className="detail-value">
                    {selectedTask.deadline
                      ? new Date(selectedTask.deadline).toLocaleString("id-ID")
                      : "-"}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className="detail-value">
                    {selectedTask.is_completed ? "SELESAI" : "AKTIF"}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-hapus-modal"
                onClick={() => handleDeleteTask(selectedTask.id_tasks)}
              >
                Hapus
              </button>
              <button
                type="button"
                className="btn-batal"
                onClick={() => setShowDetailModal(false)}
              >
                Tutup
              </button>
              <button
                type="button"
                className="btn-simpan"
                onClick={() => openEditTask(selectedTask)}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD CUSTOM CATEGORY */}
      {showCategoryModal && (
        <div className="modal-overlay active">
          <div className="modal-content" style={{ maxWidth: "400px" }}>
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
    </div>
  );
}
