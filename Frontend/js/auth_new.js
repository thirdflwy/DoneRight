const BASE_URL = "http://localhost:5000/api";

// REGISTER HANDLE
async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById("registerUsername").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value.trim();
    
    if (!username || !email || !password) {
        alert("Semua field wajib diisi!");
        return;
    }
    
    const registerButton = document.getElementById("registerButton");
    registerButton.disabled = true;
    registerButton.innerText = "Mendaftarkan...";
    
    try {
        const response = await fetch(`${BASE_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username,
                email,
                password,
            }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert("Registrasi sukses! Silakan login.");
            window.location.href = "login.html";
        } else {
            alert(data.message || "Registrasi gagal, silakan coba lagi.");
        }
    } catch (error) {
        console.error("Error during register:", error);
        alert("Terjadi kesalahan koneksi ke server.");
    } finally {
        registerButton.disabled = false;
        registerButton.innerText = "Daftar";
    }
}

// LOGIN HANDLE
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    
    if (!email || !password) {
        alert("Email dan password wajib diisi!");
        return;
    }
    
    const loginButton = document.getElementById("loginButton");
    loginButton.disabled = true;
    loginButton.innerText = "Mencoba Masuk...";
    
    try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
            }),
        });
        
        const data = await response.json();
        
        if (response.ok && data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            
            // Redirect based on role
            if (data.user.role === "admin") {
                alert("Selamat datang, Admin!");
                window.location.href = "admin_dashboard.html";
            } else {
                window.location.href = "dashboard.html";
            }
        } else {
            alert(data.message || "Email atau password salah.");
        }
    } catch (error) {
        console.error("Error during login:", error);
        alert("Terjadi kesalahan koneksi ke server.");
    } finally {
        loginButton.disabled = false;
        loginButton.innerText = "Login";
    }
}
