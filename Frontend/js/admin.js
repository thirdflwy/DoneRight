const BASE_URL =
    "http://localhost:5000/api";

const token =
    localStorage.getItem(
        "token"
    );

async function getStats() {
    const response =
        await fetch(
            `${BASE_URL}/admin/statistics`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`,
                },
            }
        );

    const data =
        await response.json();

    document.getElementById(
        "stats"
    ).innerHTML = `
    <p>
      Total Users:
      ${data.total_users}
    </p>

    <p>
      Total Tasks:
      ${data.total_tasks}
    </p>

    <p>
      Completed:
      ${data.completed_tasks}
    </p>
  `;
}

async function getTasks() {
    const response =
        await fetch(
            `${BASE_URL}/admin/tasks`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`,
                },
            }
        );

    const tasks =
        await response.json();

    const container =
        document.getElementById(
            "tasks"
        );

    tasks.forEach((task) => {
        container.innerHTML += `
      <div>
        <h3>${task.title}</h3>
        <p>User:
        ${task.username}</p>
        <hr>
      </div>
    `;
    });
}

function logout() {
    localStorage.clear();

    window.location.href =
        "home.html";
}

getStats();
getTasks();