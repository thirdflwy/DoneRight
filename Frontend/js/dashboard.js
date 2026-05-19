const BASE_URL = "http://localhost:5000/api";
const token = localStorage.getItem("token");

// Redirect if not logged in
if (!token) {
    window.location.href = "login.html";
}

// State variables
let allTasks = [];
let allCategories = [];
let currentEditingTaskId = null;
let currentDetailTaskId = null;

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    loadUserProfile();
    fetchCategories();
    fetchTasks();
    
    // Close modal when clicking on overlay
    document.querySelectorAll(".modal-overlay").forEach(overlay => {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                closeAllModals();
            }
        });
    });
    
    // Close modal with Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeAllModals();
        }
    });
});

// LOGOUT
function handleLogout() {
    localStorage.clear();
    window.location.href = "login.html";
}

// LOAD USER PROFILE
async function loadUserProfile() {
    try {
        const response = await fetch(`${BASE_URL}/users/profile`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                handleLogout();
            }
            throw new Error("Gagal mengambil profil.");
        }
        
        const user = await response.json();
        document.getElementById("welcomeUser").innerText = `Selamat datang, ${user.username}`;
    } catch (error) {
        console.error("Profile error:", error);
    }
}

// FETCH CATEGORIES
async function fetchCategories() {
    try {
        const response = await fetch(`${BASE_URL}/categories`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        
        if (!response.ok) throw new Error("Gagal mengambil kategori.");
        
        allCategories = await response.json();
        populateCategoryDropdowns();
    } catch (error) {
        console.error("Categories error:", error);
    }
}

// POPULATE CATEGORY DROPDOWNS
function populateCategoryDropdowns() {
    const filterSelect = document.getElementById("filterCategory");
    const formSelect = document.getElementById("taskCategory");
    
    // Save current selected values
    const prevFilterVal = filterSelect.value;
    const prevFormVal = formSelect.value;
    
    filterSelect.innerHTML = `
        <option value="">Semua Kategori</option>
        <option value="null">Tanpa Kategori</option>
    `;
    
    formSelect.innerHTML = `
        <option value="">Tanpa Kategori</option>
    `;
    
    allCategories.forEach(cat => {
        const optionHTML = `<option value="${cat.id_categories}">${cat.name}</option>`;
        filterSelect.innerHTML += optionHTML;
        formSelect.innerHTML += optionHTML;
    });
    
    // Restore selection
    filterSelect.value = prevFilterVal;
    formSelect.value = prevFormVal;
}

// FETCH TASKS
async function fetchTasks() {
    const listContainer = document.getElementById("taskListContainer");
    
    try {
        const response = await fetch(`${BASE_URL}/tasks`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        
        if (!response.ok) throw new Error("Gagal mengambil daftar tugas.");
        
        allTasks = await response.json();
        renderTasksList();
        updateProgressBar();
    } catch (error) {
        console.error("Tasks error:", error);
        listContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon" style="color: #ef4444;">⚠</div>
                <p>Terjadi kesalahan saat memuat tugas.</p>
            </div>
        `;
    }
}

// UPDATE PROGRESS BAR
function updateProgressBar() {
    const total = allTasks.length;
    const completed = allTasks.filter(t => t.is_completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    document.getElementById("progressBarFill").style.width = `${percent}%`;
    document.getElementById("progressText").innerText = `${completed} dari ${total} tugas selesai`;
    document.getElementById("progressPercent").innerText = `${percent}%`;
}

// RENDER TASKS LIST WITH FILTERS
function renderTasksList() {
    const listContainer = document.getElementById("taskListContainer");
    
    const search = document.getElementById("searchTask").value.toLowerCase().trim();
    const filterCat = document.getElementById("filterCategory").value;
    const filterPrio = document.getElementById("filterPriority").value;
    const filterStat = document.getElementById("filterStatus").value;
    
    let filteredTasks = allTasks.filter(task => {
        // Search Filter
        const titleMatch = task.title.toLowerCase().includes(search);
        const descMatch = task.description ? task.description.toLowerCase().includes(search) : false;
        const searchMatch = titleMatch || descMatch;
        
        // Category Filter
        const catMatch = filterCat === "" || 
            (filterCat === "null" ? !task.category_id : String(task.category_id) === filterCat);
            
        // Priority Filter
        const prioMatch = filterPrio === "" || task.priority === filterPrio;
        
        // Status Filter
        const now = new Date();
        const deadline = task.deadline ? new Date(task.deadline) : null;
        let computedStatus = "pending";
        
        if (task.is_completed) {
            if (deadline && task.completed_at && new Date(task.completed_at) > deadline) {
                computedStatus = "overdue";
            } else {
                computedStatus = "done";
            }
        } else {
            if (deadline && deadline < now) {
                computedStatus = "overdue";
            }
        }
        
        const statMatch = filterStat === "" || computedStatus === filterStat;
        
        return searchMatch && catMatch && prioMatch && statMatch;
    });
    
    // Sort tasks: Incomplete first, then by created_at desc
    filteredTasks.sort((a, b) => {
        if (a.is_completed !== b.is_completed) {
            return a.is_completed ? 1 : -1;
        }
        return new Date(b.created_at) - new Date(a.created_at);
    });

    if (filteredTasks.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📂</div>
                <p>Tidak ada tugas yang ditemukan.</p>
            </div>
        `;
        return;
    }
    
    listContainer.innerHTML = "";
    
    filteredTasks.forEach(task => {
        const isCompleted = task.is_completed;
        const now = new Date();
        const deadline = task.deadline ? new Date(task.deadline) : null;
        
        let statusBadgeHTML = "";
        let isLate = false;
        
        if (isCompleted) {
            if (deadline && task.completed_at && new Date(task.completed_at) > deadline) {
                statusBadgeHTML = `<span class="badge badge-completed">✓ Selesai (Late)</span>`;
                isLate = true;
            } else {
                statusBadgeHTML = `<span class="badge badge-completed">✓ Selesai</span>`;
            }
        } else {
            if (deadline && deadline < now) {
                statusBadgeHTML = `<span class="badge badge-high">Overdue</span>`;
                isLate = true;
            } else {
                statusBadgeHTML = `<span class="badge badge-completed" style="background-color: #f1f5f9; color: #475569;">Belum Selesai</span>`;
            }
        }
        
        const prioClass = `badge-${task.priority}`;
        const deadlineText = deadline ? deadline.toLocaleDateString("id-ID") : "-";
        
        listContainer.innerHTML += `
            <div class="task-item">
                <div class="task-left">
                    <div class="task-title-row">
                        <div class="todo-checkbox ${isCompleted ? 'checked' : ''}" onclick="toggleTaskStatus(${task.id_tasks}, event)"></div>
                        <h3 class="task-title ${isCompleted ? 'completed' : ''}">${escapeHtml(task.title)}</h3>
                    </div>
                    <p class="task-desc">${task.description ? escapeHtml(task.description) : '-'}</p>
                    <div class="task-badges">
                        <span class="badge ${prioClass}">${capitalizeFirst(task.priority)}</span>
                        ${task.category_name ? `<span class="badge badge-category">${escapeHtml(task.category_name)}</span>` : ''}
                        ${task.deadline ? `<span class="badge badge-deadline" ${isLate && !isCompleted ? 'style="background-color: #fee2e2; color: #ef4444;"' : ''}>Deadline: ${deadlineText}</span>` : ''}
                        ${statusBadgeHTML}
                    </div>
                </div>
                <div class="task-right">
                    <button class="btn-detail" onclick="openDetailModal(${task.id_tasks})">Detail</button>
                </div>
            </div>
        `;
    });
}

function handleFilterChange() {
    renderTasksList();
}

// TOGGLE TASK STATUS
async function toggleTaskStatus(id, event) {
    if (event) {
        event.stopPropagation();
    }
    
    try {
        const response = await fetch(`${BASE_URL}/tasks/toggle/${id}`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        
        if (!response.ok) throw new Error("Gagal merubah status tugas.");
        
        // Refresh tasks
        fetchTasks();
    } catch (error) {
        console.error("Toggle error:", error);
        alert("Gagal merubah status tugas.");
    }
}

// CLOSE ALL MODALS
function closeAllModals() {
    document.querySelectorAll(".modal-overlay").forEach(overlay => {
        overlay.classList.remove("active");
    });
    currentEditingTaskId = null;
    currentDetailTaskId = null;
}

// OPEN ADD TASK MODAL
function openAddTaskModal() {
    currentEditingTaskId = null;
    document.getElementById("taskModalTitle").innerText = "Tambah Tugas Baru";
    document.getElementById("taskForm").reset();
    document.getElementById("taskSubmitBtn").innerText = "Simpan";
    document.getElementById("taskModal").classList.add("active");
}

// CLOSE TASK MODAL
function closeTaskModal() {
    closeAllModals();
}

// HANDLE TASK FORM SUBMIT (Create & Update)
async function handleTaskSubmit(event) {
    event.preventDefault();
    
    const title = document.getElementById("taskTitle").value.trim();
    const description = document.getElementById("taskDescription").value.trim();
    const category_id = document.getElementById("taskCategory").value;
    const priority = document.getElementById("taskPriority").value;
    const deadline = document.getElementById("taskDeadline").value;
    
    if (!title || !priority || !deadline) {
        alert("Field bertanda * wajib diisi!");
        return;
    }
    
    const payload = {
        title,
        description: description || null,
        category_id: category_id || null,
        priority,
        deadline,
    };
    
    const submitBtn = document.getElementById("taskSubmitBtn");
    submitBtn.disabled = true;
    submitBtn.innerText = "Menyimpan...";
    
    try {
        let url = `${BASE_URL}/tasks`;
        let method = "POST";
        
        if (currentEditingTaskId) {
            url = `${BASE_URL}/tasks/${currentEditingTaskId}`;
            method = "PUT";
        }
        
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });
        
        if (!response.ok) throw new Error("Gagal menyimpan tugas.");
        
        closeTaskModal();
        fetchTasks();
    } catch (error) {
        console.error("Save task error:", error);
        alert("Terjadi kesalahan saat menyimpan tugas.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Simpan";
    }
}

// OPEN DETAIL MODAL
function openDetailModal(id) {
    const task = allTasks.find(t => t.id_tasks === id);
    if (!task) return;
    
    currentDetailTaskId = id;
    
    document.getElementById("detailTitle").innerText = task.title;
    document.getElementById("detailDesc").innerText = task.description || "-";
    document.getElementById("detailCategory").innerText = task.category_name || "Tanpa Kategori";
    document.getElementById("detailPriority").innerText = capitalizeFirst(task.priority);
    
    const deadline = task.deadline ? new Date(task.deadline) : null;
    document.getElementById("detailDeadline").innerText = deadline ? deadline.toLocaleDateString("id-ID") + " " + deadline.toLocaleTimeString("id-ID", {hour: '2-digit', minute:'2-digit'}) : "-";
    
    let statusText = "Belum Selesai";
    const now = new Date();
    if (task.is_completed) {
        if (deadline && task.completed_at && new Date(task.completed_at) > deadline) {
            statusText = "Selesai (Terlambat)";
        } else {
            statusText = "Selesai";
        }
    } else if (deadline && deadline < now) {
        statusText = "Overdue (Terlambat)";
    }
    document.getElementById("detailStatus").innerText = statusText;
    
    document.getElementById("detailModal").classList.add("active");
}

// CLOSE DETAIL MODAL
function closeDetailModal() {
    closeAllModals();
}

// DELETE FROM DETAIL
async function handleDeleteFromDetail() {
    if (!currentDetailTaskId) return;
    
    const confirmDelete = confirm("Apakah Anda yakin ingin memindahkan tugas ini ke tempat sampah?");
    if (!confirmDelete) return;
    
    try {
        const response = await fetch(`${BASE_URL}/tasks/${currentDetailTaskId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        
        if (!response.ok) throw new Error("Gagal menghapus tugas.");
        
        closeDetailModal();
        fetchTasks();
    } catch (error) {
        console.error("Delete task error:", error);
        alert("Gagal menghapus tugas.");
    }
}

// EDIT FROM DETAIL
function handleEditFromDetail() {
    if (!currentDetailTaskId) return;
    const task = allTasks.find(t => t.id_tasks === currentDetailTaskId);
    if (!task) return;
    
    closeDetailModal();
    
    currentEditingTaskId = task.id_tasks;
    document.getElementById("taskModalTitle").innerText = "Edit Tugas";
    document.getElementById("taskTitle").value = task.title;
    document.getElementById("taskDescription").value = task.description || "";
    document.getElementById("taskCategory").value = task.category_id || "";
    document.getElementById("taskPriority").value = task.priority;
    
    if (task.deadline) {
        const d = new Date(task.deadline);
        const tzOffset = d.getTimezoneOffset() * 60000;
        const localISOTime = new Date(d - tzOffset).toISOString().slice(0, 16);
        document.getElementById("taskDeadline").value = localISOTime;
    } else {
        document.getElementById("taskDeadline").value = "";
    }
    
    document.getElementById("taskSubmitBtn").innerText = "Simpan Perubahan";
    document.getElementById("taskModal").classList.add("active");
}

// OPEN ADD CATEGORY MODAL
function openCategoryModal() {
    document.getElementById("categoryForm").reset();
    document.getElementById("categoryModal").classList.add("active");
}

// CLOSE CATEGORY MODAL
function closeCategoryModal() {
    closeAllModals();
}

// HANDLE CATEGORY FORM SUBMIT
async function handleCategorySubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById("categoryNameInput").value.trim();
    if (!name) {
        alert("Nama kategori wajib diisi!");
        return;
    }
    
    const submitBtn = document.getElementById("categorySubmitBtn");
    submitBtn.disabled = true;
    submitBtn.innerText = "Menyimpan...";
    
    try {
        const response = await fetch(`${BASE_URL}/categories`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name }),
        });
        
        if (!response.ok) throw new Error("Gagal menyimpan kategori.");
        
        closeCategoryModal();
        await fetchCategories();
        alert("Kategori baru berhasil ditambahkan!");
    } catch (error) {
        console.error("Save category error:", error);
        alert("Terjadi kesalahan saat menyimpan kategori.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Simpan";
    }
}

// UTILITY FUNCTIONS
function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function capitalizeFirst(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}
