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
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: null,
    onCancel: null,
    confirmText: "Ya, Hapus",
    cancelText: "Batal",
    isDanger: true,
    isCategoryDelete: false,
    onKeepTasks: null,
    onDeleteTasks: null
  });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

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
  const [editingCategory, setEditingCategory] = useState(null);
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
      showToast("Kolom dengan bintang (*) wajib diisi!", "warning");
      return;
    }

    setTaskSubmitting(true);
    const bodyData = {
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      category_id: taskCategory ? parseInt(taskCategory, 10) : null,
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
      showToast(editingTask ? "Tugas berhasil diperbarui!" : "Tugas baru berhasil ditambahkan!", "success");
    } catch (err) {
      console.error("Task submit error:", err);
      showToast(err.message || "Gagal menyimpan tugas.", "error");
    } finally {
      setTaskSubmitting(false);
    }
  };

  // Submit Category
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      showToast("Nama kategori wajib diisi!", "warning");
      return;
    }

    setCategorySubmitting(true);
    try {
      let url = `${BASE_URL}/categories`;
      let method = "POST";

      if (editingCategory) {
        url = `${BASE_URL}/categories/${editingCategory.id_categories}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: categoryName.trim() }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan kategori.");

      setEditingCategory(null);
      setCategoryName("");
      await fetchCategories();
      await fetchTasks();
      showToast(editingCategory ? "Kategori berhasil diperbarui!" : "Kategori kustom baru berhasil dibuat!", "success");
    } catch (err) {
      console.error("Category save error:", err);
      showToast("Terjadi kesalahan saat menyimpan kategori.", "error");
    } finally {
      setCategorySubmitting(false);
    }
  };

  // Delete Category Actual
  const executeDeleteCategory = async (id, mode) => {
    try {
      const res = await fetch(`${BASE_URL}/categories/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mode }),
      });

      if (!res.ok) throw new Error("Gagal menghapus kategori.");

      await fetchCategories();
      await fetchTasks();
    } catch (err) {
      console.error("Delete category error:", err);
      showToast(err.message || "Gagal menghapus kategori.", "error");
    }
  };

  // Delete Category
  const handleDeleteCategory = (id) => {
    setConfirmModal({
      show: true,
      title: "Hapus Kategori",
      message: "Apakah Anda yakin ingin menghapus kategori ini? Pilih opsi di bawah untuk menentukan nasib tugas yang ada di dalamnya:",
      confirmText: "Hapus Kategori & Seluruh Tugas",
      cancelText: "Batal",
      isDanger: true,
      isCategoryDelete: true,
      onDeleteTasks: () => executeDeleteCategory(id, "delete_tasks"),
      onKeepTasks: () => executeDeleteCategory(id, "keep_tasks"),
      onCancel: () => {}
    });
  };

  // Delete Task Actual
  const executeDeleteTask = async (id) => {
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

  // Delete Task
  const handleDeleteTask = (id) => {
    setConfirmModal({
      show: true,
      title: "Hapus Tugas",
      message: "Apakah Anda yakin ingin menghapus tugas ini? Tugas ini akan dipindahkan ke keranjang sampah.",
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      isDanger: true,
      isCategoryDelete: false,
      onConfirm: () => executeDeleteTask(id),
      onCancel: () => {}
    });
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
    setTaskCategory(task.category_id || "");
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
        matchesCategory = !task.category_id;
      } else {
        matchesCategory = task.category_id === parseInt(filterCategory, 10);
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
                style={{ backgroundColor: "#00a854", borderColor: "#00a854", padding: "8px 16px", fontSize: "14px", display: "inline-flex", gap: "6px", alignItems: "center" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Laporan
              </button>
              <button
                className="btn-secondary"
                onClick={onNavigateTrash}
                style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "8px 16px", fontSize: "14px", display: "inline-flex", gap: "6px", alignItems: "center" }}
                title="Keranjang Sampah"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Sampah
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
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              className="filter-input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="done">Selesai</option>
              <option value="pending">Belum Selesai</option>
              <option value="overdue">Overdue</option>
            </select>

            <select
              className="filter-input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="deadline">Deadline</option>
              <option value="priority">Prioritas</option>
              <option value="newest">Terbaru</option>
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
              const now = new Date();
              const isOverdue = !task.is_completed && deadline && deadline < now;

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

                      {isOverdue && (
                        <span className="badge badge-overdue">
                          ⚠ Overdue
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

                {categoryTasks.map((task) => {
                  const deadline = task.deadline ? new Date(task.deadline) : null;
                  const now = new Date();
                  const isOverdue = !task.is_completed && deadline && deadline < now;

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

                          {isOverdue && (
                            <span className="badge badge-overdue">
                              ⚠ Overdue
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
                })}
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
                <button
                  type="button"
                  className="btn-close-modal"
                  onClick={() => setShowTaskModal(false)}
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
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
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
                <button
                  type="button"
                  className="btn-close-modal"
                  onClick={() => setShowDetailModal(false)}
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
                <div className="detail-grid">
                  <div className="detail-item" style={{ gridColumn: "span 2" }}>
                    <span className="detail-label">Judul</span>
                    <span className="detail-value" style={{ fontSize: "18px", color: "var(--text-main)", fontWeight: 700 }}>{selectedTask.title}</span>
                  </div>

                  <div className="detail-item" style={{ gridColumn: "span 2" }}>
                    <span className="detail-label">Deskripsi</span>
                    <span className="detail-value detail-value-span" style={{ whiteSpace: "pre-line", lineHeight: 1.5 }}>
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
                    <span className={`badge badge-${selectedTask.priority}`} style={{ width: "fit-content", marginTop: "4px", fontSize: "12px", padding: "4px 10px" }}>
                      {selectedTask.priority.toUpperCase()}
                    </span>
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
                    <div style={{ marginTop: "4px" }}>
                      {selectedTask.is_completed ? (
                        <span className="badge badge-completed" style={{ width: "fit-content", fontSize: "12px", padding: "4px 10px" }}>✓ Selesai</span>
                      ) : (selectedTask.deadline && new Date(selectedTask.deadline) < new Date() ? (
                        <span className="badge badge-overdue" style={{ width: "fit-content", fontSize: "12px", padding: "4px 10px" }}>⚠ Overdue</span>
                      ) : (
                        <span className="badge badge-pending" style={{ width: "fit-content", fontSize: "12px", padding: "4px 10px", backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", color: "#64748b", fontWeight: 600 }}>Aktif</span>
                      ))}
                    </div>
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
            <div className="modal-content" style={{ maxWidth: "420px" }}>
              <div className="modal-header">
                <div className="modal-title">Kelola Kategori</div>
                <button
                  type="button"
                  className="btn-close-modal"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setCategoryName("");
                    setEditingCategory(null);
                  }}
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
              <form onSubmit={handleCategorySubmit}>
                <div className="modal-body">
                  <div className="form-group" style={{ marginBottom: "20px" }}>
                    <label style={{ fontWeight: 600, display: "block", marginBottom: "8px" }}>
                      {editingCategory ? `Edit Kategori "${editingCategory.name}" *` : "Tambah Kategori Baru *"}
                    </label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Masukkan nama kategori"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        required
                        disabled={categorySubmitting}
                        style={{ margin: 0, flex: 1 }}
                      />
                      <button type="submit" className="btn-simpan" disabled={categorySubmitting} style={{ padding: "0 20px" }}>
                        {categorySubmitting ? "..." : editingCategory ? "Simpan" : "Tambah"}
                      </button>
                      {editingCategory && (
                        <button
                          type="button"
                          className="btn-batal"
                          onClick={() => {
                            setEditingCategory(null);
                            setCategoryName("");
                          }}
                          style={{ padding: "0 15px", margin: 0 }}
                        >
                          Batal
                        </button>
                      )}
                    </div>
                  </div>

                  <hr style={{ margin: "20px 0", border: "0", borderTop: "1px solid #e2e8f0" }} />

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontWeight: 600, display: "block", marginBottom: "12px" }}>Daftar Kategori Kustom</label>
                    {categories.filter(cat => !cat.is_global).length === 0 ? (
                      <p style={{ fontSize: "14px", color: "#64748b", fontStyle: "italic", textAlign: "center", margin: "10px 0" }}>Belum ada kategori kustom.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "180px", overflowY: "auto", paddingRight: "4px" }}>
                        {categories.filter(cat => !cat.is_global).map((cat) => (
                          <div
                            key={cat.id_categories}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "10px 14px",
                              background: "#f8fafc",
                              borderRadius: "10px",
                              border: "1px solid #e2e8f0",
                              transition: "all 0.2s"
                            }}
                          >
                            <span style={{ fontSize: "14px", fontWeight: 500, color: "#1e293b" }}>
                              {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                            </span>
                            <div style={{ display: "flex", gap: "4px" }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCategory(cat);
                                  setCategoryName(cat.name);
                                }}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#3b82f6",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  padding: "4px",
                                  borderRadius: "6px",
                                  transition: "background 0.2s"
                                }}
                                title="Edit Kategori"
                                onMouseEnter={(e) => e.currentTarget.style.background = "#dbeafe"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(cat.id_categories)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#ef4444",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  padding: "4px",
                                  borderRadius: "6px",
                                  transition: "background 0.2s"
                                }}
                                title="Hapus Kategori"
                                onMouseEnter={(e) => e.currentTarget.style.background = "#fee2e2"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer" style={{ borderTop: "1px solid #e2e8f0", paddingTop: "15px", marginTop: "15px" }}>
                  <button
                    type="button"
                    className="btn-batal"
                    onClick={() => {
                      setShowCategoryModal(false);
                      setCategoryName("");
                      setEditingCategory(null);
                    }}
                    style={{ width: "100%", margin: 0 }}
                  >
                    Tutup
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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
              <div className="modal-footer" style={{ flexDirection: confirmModal.isCategoryDelete ? "column" : "row", gap: "10px", alignItems: "stretch", width: "100%" }}>
                {confirmModal.isCategoryDelete ? (
                  <>
                    <button
                      type="button"
                      className="btn-hapus-modal"
                      onClick={() => {
                        if (confirmModal.onDeleteTasks) confirmModal.onDeleteTasks();
                        setConfirmModal({ ...confirmModal, show: false });
                      }}
                      style={{ margin: 0, width: "100%", padding: "12px", justifyContent: "center" }}
                    >
                      🗑️ Hapus Kategori & Seluruh Tugas
                    </button>
                    <button
                      type="button"
                      className="btn-simpan"
                      onClick={() => {
                        if (confirmModal.onKeepTasks) confirmModal.onKeepTasks();
                        setConfirmModal({ ...confirmModal, show: false });
                      }}
                      style={{ margin: 0, width: "100%", padding: "12px", justifyContent: "center" }}
                    >
                      📂 Hapus Kategori Saja (Simpan Tugas)
                    </button>
                    <button
                      type="button"
                      className="btn-batal"
                      onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                      style={{ margin: 0, width: "100%", padding: "12px", justifyContent: "center" }}
                    >
                      Batal
                    </button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TOAST NOTIFICATION */}
        <div className={`toast-notification ${toast.show ? "active" : ""} ${toast.type}`}>
          <div className="toast-message">{toast.message}</div>
        </div>
      </div>
    </div>
  );
}
