const BASE_URL =
    "http://localhost:5000/api";

// REGISTER
async function register() {
    const username =
        document.getElementById(
            "registerUsername"
        ).value;

    const email =
        document.getElementById(
            "registerEmail"
        ).value;

    const password =
        document.getElementById(
            "registerPassword"
        ).value;

    try {
        const response =
            await fetch(
                `${BASE_URL}/auth/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        username,
                        email,
                        password,
                    }),
                }
            );

        const data =
            await response.json();

        alert(data.message);
    } catch (error) {
        console.log(error);
    }
}

// LOGIN
async function login() {
    const email =
        document.getElementById(
            "loginEmail"
        ).value;

    const password =
        document.getElementById(
            "loginPassword"
        ).value;

    try {
        const response =
            await fetch(
                `${BASE_URL}/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

        const data =
            await response.json();

        if (data.token) {
            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(
                    data.user
                )
            );

            if (
                data.user.role ===
                "admin"
            ) {
                window.location.href =
                    "admin.html";
            } else {
                window.location.href =
                    "user.html";
            }
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.log(error);
    }
}