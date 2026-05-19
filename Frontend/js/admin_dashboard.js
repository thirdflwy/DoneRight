const BASE_URL = "http://localhost:5000/api";
const token = localStorage.getItem("token");

// Redirect if not logged in
if (!token) {
    window.location.href = "login.html";
}

// Check role
try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") {
        window.location.href = "login.html";
    }
} catch (e) {
    window.location.href = "login.html";
}

// State
let allTasks = [];
let allCategories = [];
let overdueTasksList = [];

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    // Initial fetch for overview and overdue badge count
    fetchOverviewData();
    
    // Close modal when clicking on overlay
    document.querySelectorAll(".modal-overlay").forEach(overlay => {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                closeCategoryModal();
            }
        });
    });
});

// LOGOUT
function handleLogout() {
    localStorage.clear();
    window.location.href = "login.html";
}

// TAB NAVIGATION SWITCHING
function switchTab(tabId, btnElement) {
    // Remove active classes
    document.querySelectorAll(".admin-tab-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.remove("active"));
    
    // Add active classes
    btnElement.classList.add("active");
    
    const targetPanel = document.getElementById(
        tabId === "overview" ? "overviewPanel" :
        tabId === "all-tasks" ? "allTasksPanel" :
        tabId === "overdue-tasks" ? "overdueTasksPanel" : "categoriesPanel"
    );
    
    if (targetPanel) {
        targetPanel.classList.add("active");
    }
    
    // Fetch data based on active tab
    if (tabId === "overview") {
        fetchOverviewData();
    } else if (tabId === "all-tasks") {
        fetchAllUserTasks();
    } else if (tabId === "overdue-tasks") {
        fetchOverdueTasksOnly();
    } else if (tabId === "categories") {
        fetchGlobalCategories();
    }
}

// FETCH OVERVIEW DATA
async function fetchOverviewData() {
    try {
        // Fetch stats
        const statsResponse = await fetch(`${BASE_URL}/admin/statistics`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!statsResponse.ok) throw new Error("Gagal mengambil statistics.");
        const stats = await statsResponse.json();
        
        // Fetch overdue tasks
        const overdueResponse = await fetch(`${BASE_URL}/admin/overdue`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!overdueResponse.ok) throw new Error("Gagal mengambil overdue tasks.");
        overdueTasksList = await overdueResponse.json();
        
        // Fetch all tasks for priority distribution calculation
        const tasksResponse = await fetch(`${BASE_URL}/admin/tasks`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!tasksResponse.ok) throw new Error("Gagal mengambil tasks.");
        allTasks = await tasksResponse.json();
        
        // Calculate counts
        const total = stats.total_tasks || 0;
        const completed = stats.completed_tasks || 0;
        const overdue = overdueTasksList.length;
        const active = Math.max(0, total - completed - overdue);
        
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        // Render stats on screen
        document.getElementById("statTotalTasks").innerText = total;
        document.getElementById("statCompletedTasks").innerText = completed;
        document.getElementById("statCompletionRate").innerText = `${completionRate}% completion rate`;
        document.getElementById("statActiveTasks").innerText = active;
        document.getElementById("statOverdueTasks").innerText = overdue;
        
        // Update Overdue Tab Badge
        const tabBadge = document.getElementById("overdueTabBadge");
        if (overdue > 0) {
            tabBadge.innerText = overdue;
            tabBadge.style.display = "inline-block";
        } else {
            tabBadge.style.display = "none";
        }
        
        // Calculate Priority Distribution
        let highCount = 0;
        let mediumCount = 0;
        let lowCount = 0;
        
        allTasks.forEach(task => {
            if (task.priority === "high") highCount++;
            else if (task.priority === "medium") mediumCount++;
            else if (task.priority === "low") lowCount++;
        });
        
        const highPercent = total > 0 ? (highCount / total) * 100 : 0;
        const mediumPercent = total > 0 ? (mediumCount / total) * 100 : 0;
        const lowPercent = total > 0 ? (lowCount / total) * 100 : 0;
        
        // Render priority distribution
        document.getElementById("priorityHighCount").innerText = `${highCount} tugas`;
        document.getElementById("priorityHighBar").style.width = `${highPercent}%`;
        
        document.getElementById("priorityMediumCount").innerText = `${mediumCount} tugas`;
        document.getElementById("priorityMediumBar").style.width = `${mediumPercent}%`;
        
        document.getElementById("priorityLowCount").innerText = `${lowCount} tugas`;
        document.getElementById("priorityLowBar").style.width = `${lowPercent}%`;
        
    } catch (error) {
        console.error("Overview fetch error:", error);
    }
}

// FETCH ALL TASKS FOR TABLE MONITORING
async function fetchAllUserTasks() {
    const tableBody = document.getElementById("allTasksTableBody");
    tableBody.innerHTML = `
        <tr>
            <td colspan="4" style="text-align: center; color: var(--text-muted);">Memuat tugas...</td>
        </tr>
    `;
    
    try {
        const response = await fetch(`${BASE_URL}/admin/tasks`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Gagal mengambil tasks.");
        allTasks = await response.json();
        
        if (allTasks.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: var(--text-muted);">Tidak ada tugas terdaftar.</td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = "";
        const now = new Date();
        
        allTasks.forEach(task => {
            const isCompleted = task.is_completed;
            const deadline = task.deadline ? new Date(task.deadline) : null;
            
            // Compute status badge
            let statusBadge = "";
            if (isCompleted) {
                statusBadge = `<span class="badge badge-completed">COMPLETED</span>`;
            } else if (deadline && deadline < now) {
                statusBadge = `<span class="badge badge-overdue">OVERDUE</span>`;
            } else {
                statusBadge = `<span class="badge badge-active">ACTIVE</span>`;
            }
            
            const prioClass = `badge-${task.priority}`;
            const deadlineText = deadline ? deadline.toLocaleDateString("id-ID") : "-";
            
            tableBody.innerHTML += `
                <tr>
                    <td>
                        <div class="admin-table-title">${escapeHtml(task.title)}</div>
                        <div class="admin-table-subtitle">${task.description ? escapeHtml(task.description) : '-'}</div>
                    </td>
                    <td>
                        <span class="badge ${prioClass}">${task.priority.toUpperCase()}</span>
                    </td>
                    <td>
                        ${statusBadge}
                    </td>
                    <td>
                        ${deadlineText}
                    </td>
                </tr>
            `;
        });
        
    } catch (error) {
        console.error("Fetch all tasks error:", error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: #ef4444;">Terjadi kesalahan saat memuat data.</td>
            </tr>
        `;
    }
}

// FETCH OVERDUE TASKS ONLY
async function fetchOverdueTasksOnly() {
    const overdueContainer = document.getElementById("overdueTasksContainer");
    overdueContainer.innerHTML = `
        <div class="empty-state">
            <p>Memuat tugas overdue...</p>
        </div>
    `;
    
    try {
        const response = await fetch(`${BASE_URL}/admin/overdue`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Gagal mengambil overdue tasks.");
        overdueTasksList = await response.json();
        
        // Update headers
        const count = overdueTasksList.length;
        document.getElementById("overduePanelHeader").innerText = `Tugas Overdue (${count})`;
        
        // Update badge count
        const tabBadge = document.getElementById("overdueTabBadge");
        if (count > 0) {
            tabBadge.innerText = count;
            tabBadge.style.display = "inline-block";
        } else {
            tabBadge.style.display = "none";
        }
        
        if (count === 0) {
            overdueContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🎉</div>
                    <p>Hebat! Tidak ada tugas yang terlambat.</p>
                </div>
            `;
            return;
        }
        
        overdueContainer.innerHTML = "";
        
        overdueTasksList.forEach(task => {
            const deadline = task.deadline ? new Date(task.deadline) : null;
            const deadlineText = deadline ? deadline.toLocaleDateString("id-ID") : "-";
            
            overdueContainer.innerHTML += `
                <div class="task-item-overdue">
                    <h3 class="task-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">${escapeHtml(task.title)}</h3>
                    <p class="task-desc" style="font-size: 14px; margin-bottom: 14px;">${task.description ? escapeHtml(task.description) : '-'}</p>
                    <div class="task-badges">
                        <span class="badge badge-high" style="font-weight: 600;">HIGH</span>
                        <span class="badge badge-deadline-overdue" style="font-weight: 500;">Deadline: ${deadlineText}</span>
                    </div>
                </div>
            `;
        });
        
    } catch (error) {
        console.error("Fetch overdue error:", error);
        overdueContainer.innerHTML = `
            <div class="empty-state">
                <p style="color: #ef4444;">Gagal memuat tugas overdue.</p>
            </div>
        `;
    }
}

// FETCH GLOBAL CATEGORIES
async function fetchGlobalCategories() {
    const container = document.getElementById("categoriesContainer");
    container.innerHTML = `
        <div class="empty-state" style="grid-column: span 2;">
            <p>Memuat kategori...</p>
        </div>
    `;
    
    try {
        const response = await fetch(`${BASE_URL}/admin/categories`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Gagal mengambil categories.");
        allCategories = await response.json();
        
        if (allCategories.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: span 2;">
                    <p>Tidak ada kategori global.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = "";
        
        allCategories.forEach(cat => {
            const nameLower = cat.name.toLowerCase();
            
            // Distinguish Default vs Custom
            const isDefault = nameLower === "akademik" || nameLower === "organisasi" || nameLower === "pekerjaan";
            const typeText = isDefault ? "Kategori Default" : "Kategori Custom";
            
            const dateText = cat.created_at ? new Date(cat.created_at).toLocaleDateString("id-ID") : "14/5/2026";
            
            container.innerHTML += `
                <div class="category-admin-card">
                    <div class="category-admin-left">
                        <span class="category-admin-name">${escapeHtml(capitalizeFirst(cat.name))}</span>
                        <span class="category-admin-type">${typeText}</span>
                        <span class="category-admin-date">Dibuat: ${dateText}</span>
                    </div>
                    ${!isDefault ? `
                        <button class="btn-delete-icon" onclick="handleDeleteCategory(${cat.id_categories})" title="Hapus Kategori">
                            <svg viewBox="0 0 24 24">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                        </button>
                    ` : ''}
                </div>
            `;
        });
        
    } catch (error) {
        console.error("Fetch categories error:", error);
        container.innerHTML = `
            <div class="empty-state" style="grid-column: span 2; color: #ef4444;">
                <p>Gagal memuat kategori global.</p>
            </div>
        `;
    }
}

// OPEN ADD CATEGORY MODAL
function openCategoryModal() {
    document.getElementById("categoryForm").reset();
    document.getElementById("categoryModal").classList.add("active");
}

// CLOSE CATEGORY MODAL
function closeCategoryModal() {
    document.getElementById("categoryModal").classList.remove("active");
}

// HANDLE CATEGORY FORM SUBMIT
async function handleCategorySubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById("categoryName").value.trim();
    if (!name) {
        alert("Nama kategori wajib diisi!");
        return;
    }
    
    const submitBtn = document.getElementById("categorySubmitBtn");
    submitBtn.disabled = true;
    submitBtn.innerText = "Menyimpan...";
    
    try {
        const response = await fetch(`${BASE_URL}/admin/categories`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name }),
        });
        
        if (!response.ok) throw new Error("Gagal menyimpan kategori.");
        
        closeCategoryModal();
        await fetchGlobalCategories();
        alert("Kategori global baru berhasil ditambahkan!");
    } catch (error) {
        console.error("Save category error:", error);
        alert("Terjadi kesalahan saat menyimpan kategori global.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Simpan";
    }
}

// DELETE CATEGORY
async function handleDeleteCategory(id) {
    const confirmDelete = confirm("Apakah Anda yakin ingin menghapus kategori global ini?");
    if (!confirmDelete) return;
    
    try {
        const response = await fetch(`${BASE_URL}/admin/categories/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        
        if (!response.ok) throw new Error("Gagal menghapus kategori.");
        
        await fetchGlobalCategories();
        alert("Kategori global berhasil dihapus!");
    } catch (error) {
        console.error("Delete category error:", error);
        alert("Gagal menghapus kategori global.");
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
