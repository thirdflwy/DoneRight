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

document.addEventListener("DOMContentLoaded", () => {
    fetchGlobalReport();
});

// LOGOUT
function handleLogout() {
    localStorage.clear();
    window.location.href = "login.html";
}

// FETCH GLOBAL REPORT METRICS
async function fetchGlobalReport() {
    const loading = document.getElementById("reportLoading");
    const content = document.getElementById("reportContent");
    
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
        const overdueList = await overdueResponse.json();
        
        const total = stats.total_tasks || 0;
        const completed = stats.completed_tasks || 0;
        const overdue = overdueList.length;
        const users = stats.total_users || 0;
        
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        // Update stats values
        document.getElementById("globalProdPercent").innerText = `${completionRate}%`;
        document.getElementById("globalProdBarFill").style.width = `${completionRate}%`;
        
        document.getElementById("globalTotalUsers").innerText = users;
        document.getElementById("globalTotalTasks").innerText = total;
        document.getElementById("globalCompletedTasks").innerText = completed;
        document.getElementById("globalOverdueTasks").innerText = overdue;
        
        // Toggle view
        loading.style.display = "none";
        content.classList.add("active");
    } catch (error) {
        console.error("Global report fetch error:", error);
        loading.innerHTML = `
            <div style="font-size: 32px; color: #ef4444; margin-bottom: 12px;">⚠</div>
            <p style="color: #ef4444;">Terjadi kesalahan saat memuat data laporan global.</p>
        `;
    }
}

// DOWNLOAD GLOBAL PDF REPORT
async function downloadGlobalPDFReport() {
    const btn = document.getElementById("downloadBtn");
    const prevText = btn.innerText;
    
    btn.disabled = true;
    btn.innerText = "Mengunduh PDF Global...";
    
    try {
        const response = await fetch(`${BASE_URL}/statistics/pdf/global`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error("Gagal mengunduh dokumen global.");
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Laporan_Sistem_Global.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Global PDF download error:", error);
        alert("Gagal mengunduh laporan PDF global.");
    } finally {
        btn.disabled = false;
        btn.innerText = prevText;
    }
}
