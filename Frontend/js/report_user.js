const BASE_URL = "http://localhost:5000/api";
const token = localStorage.getItem("token");

// Redirect if not logged in
if (!token) {
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    fetchPersonalReport();
});

// LOGOUT
function handleLogout() {
    localStorage.clear();
    window.location.href = "login.html";
}

// FETCH PERSONAL REPORT METRICS
async function fetchPersonalReport() {
    const loading = document.getElementById("reportLoading");
    const content = document.getElementById("reportContent");
    
    try {
        const response = await fetch(`${BASE_URL}/statistics/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error("Gagal mengambil laporan.");
        
        const data = await response.json();
        
        // Update stats values
        document.getElementById("prodPercent").innerText = `${data.productivity}%`;
        document.getElementById("prodBarFill").style.width = `${data.productivity}%`;
        
        document.getElementById("userTotalTasks").innerText = data.total_tasks || 0;
        document.getElementById("userCompletedTasks").innerText = data.completed_tasks || 0;
        document.getElementById("userOnTimeTasks").innerText = data.on_time || 0;
        document.getElementById("userOverdueTasks").innerText = data.overdue || 0;
        
        // Toggle view
        loading.style.display = "none";
        content.classList.add("active");
    } catch (error) {
        console.error("Personal report fetch error:", error);
        loading.innerHTML = `
            <div style="font-size: 32px; color: #ef4444; margin-bottom: 12px;">⚠</div>
            <p style="color: #ef4444;">Terjadi kesalahan saat memuat data laporan.</p>
        `;
    }
}

// DOWNLOAD PDF REPORT
async function downloadPDFReport() {
    const btn = document.getElementById("downloadBtn");
    const prevText = btn.innerText;
    
    btn.disabled = true;
    btn.innerText = "Mengunduh PDF...";
    
    try {
        const response = await fetch(`${BASE_URL}/statistics/pdf/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error("Gagal mengunduh dokumen.");
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Laporan_Produktivitas_Anda.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("PDF download error:", error);
        alert("Gagal mengunduh laporan PDF.");
    } finally {
        btn.disabled = false;
        btn.innerText = prevText;
    }
}
