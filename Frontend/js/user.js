const BASE_URL =
    "http://localhost:5000/api";

const token =
    localStorage.getItem(
        "token"
    );

// GET PROFILE
async function getProfile() {

    const response =
        await fetch(
            `${BASE_URL}/users/profile`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`,
                },
            }
        );

    const user =
        await response.json();

    document.getElementById(
        "profileBox"
    ).innerHTML = `
        <p>
            Username:
            ${user.username}
        </p>

        <p>
            Email:
            ${user.email}
        </p>

        <p>
            Password:
            ********
        </p>

        <button
            onclick="editProfile()"
        >
            Edit Profile
        </button>

        <button
            onclick="deleteAccount()"
        >
            Delete Account
        </button>
    `;
}

async function editProfile() {

    const username =
        prompt(
            "New Username"
        );

    const email =
        prompt(
            "New Email"
        );

    const password =
        prompt(
            "New Password"
        );

    await fetch(
        `${BASE_URL}/users/profile`,
        {
            method: "PUT",

            headers: {
                "Content-Type":
                    "application/json",

                Authorization:
                    `Bearer ${token}`,
            },

            body: JSON.stringify({
                username,
                email,
                password,
            }),
        }
    );

    getProfile();
}

async function deleteAccount() {

    const yes =
        confirm(
            "Delete account permanently?"
        );

    if (!yes) return;

    await fetch(
        `${BASE_URL}/users/profile`,
        {
            method: "DELETE",

            headers: {
                Authorization:
                    `Bearer ${token}`,
            },
        }
    );

    localStorage.clear();

    window.location.href =
        "home.html";
}

async function addCategory() {

    const name =
        document.getElementById(
            "categoryName"
        ).value;

    await fetch(
        `${BASE_URL}/categories`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",

                Authorization:
                    `Bearer ${token}`,
            },

            body: JSON.stringify({
                name,
            }),
        }
    );

    document.getElementById(
        "categoryName"
    ).value = "";

    getCategories();
}

// GET CATEGORIES
async function getCategories() {
    const response =
        await fetch(
            `${BASE_URL}/categories`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`,
                },
            }
        );

    const categories =
        await response.json();

    const select =
        document.getElementById(
            "category"
        );

    select.innerHTML = `
        <option value="">
            No Category
        </option>
    `;

    categories.forEach(
        (category) => {
            select.innerHTML += `
                <option
                    value="${category.id_categories}"
                >
                    ${category.name}
                </option>
            `;
        }
    );
}

// GET TASKS
async function getTasks() {
    const response =
        await fetch(
            `${BASE_URL}/tasks`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`,
                },
            }
        );

    const tasks =
        await response.json();

    const taskList =
        document.getElementById(
            "taskList"
        );

    taskList.innerHTML = "";

    tasks.forEach((task) => {
        taskList.innerHTML += `
            <div>

                <h3>
                    ${task.title}
                </h3>

                <p>
                    Description:
                    ${task.description ||
            "-"
            }
                </p>

                <p>
                    Category:
                    ${task.category_name ||
            "No Category"
            }
                </p>

                <p>
                    Priority:
                    ${task.priority}
                </p>

                <p>
                    Deadline:
                    ${task.deadline
                ? new Date(
                    task.deadline
                ).toLocaleString()
                : "-"
            }
                </p>

                <p>
                    Status:
                    ${task.is_completed
                ? "Done"
                : "Not Yet"
            }
                </p>

                <button
                    onclick="toggleTask(
                        ${task.id_tasks}
                    )"
                >
                    Toggle Done
                </button>

                <button
                    onclick="deleteTask(
                        ${task.id_tasks}
                    )"
                >
                    Delete
                </button>

                <hr>

            </div>
        `;
    });
}

// ADD TASK
async function addTask() {
    const title =
        document.getElementById(
            "title"
        ).value;

    const description =
        document.getElementById(
            "description"
        ).value;

    const category_id =
        document.getElementById(
            "category"
        ).value;

    const priority =
        document.getElementById(
            "priority"
        ).value;

    const deadline =
        document.getElementById(
            "deadline"
        ).value;

    await fetch(
        `${BASE_URL}/tasks`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",

                Authorization:
                    `Bearer ${token}`,
            },

            body: JSON.stringify({
                title,
                description,
                category_id:
                    category_id || null,
                priority,
                deadline,
            }),
        }
    );

    // RESET INPUT
    document.getElementById(
        "title"
    ).value = "";

    document.getElementById(
        "description"
    ).value = "";

    document.getElementById(
        "deadline"
    ).value = "";

    document.getElementById(
        "category"
    ).value = "";

    document.getElementById(
        "priority"
    ).value = "medium";

    getTasks();
    getTrash();
}

// TOGGLE TASK
async function toggleTask(id) {
    await fetch(
        `${BASE_URL}/tasks/toggle/${id}`,
        {
            method: "PATCH",

            headers: {
                Authorization:
                    `Bearer ${token}`,
            },
        }
    );

    getTasks();
    getTrash();
}

// DELETE TASK (SOFT DELETE)
async function deleteTask(id) {
    await fetch(
        `${BASE_URL}/tasks/${id}`,
        {
            method: "DELETE",

            headers: {
                Authorization:
                    `Bearer ${token}`,
            },
        }
    );

    getTasks();
    getTrash();
}

// GET TRASH
async function getTrash() {
    const response =
        await fetch(
            `${BASE_URL}/tasks/trash`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`,
                },
            }
        );

    const tasks =
        await response.json();

    const trash =
        document.getElementById(
            "trashList"
        );

    trash.innerHTML = "";

    tasks.forEach((task) => {
        trash.innerHTML += `
            <div>

                <h3>
                    ${task.title}
                </h3>

                <p>
                    Category:
                    ${task.category_name ||
            "No Category"
            }
                </p>

                <p>
                    Priority:
                    ${task.priority}
                </p>

                <p>
                    Deleted At:
                    ${new Date(
                task.deleted_at
            ).toLocaleString()}
                </p>

                <button
                    onclick="restoreTask(
                        ${task.id_tasks}
                    )"
                >
                    Restore
                </button>

                <button
                    onclick="permanentDeleteTask(
                        ${task.id_tasks}
                    )"
                >
    Delete Permanently
</button>

                <hr>

            </div>
        `;
    });
}

// RESTORE TASK
async function restoreTask(id) {
    await fetch(
        `${BASE_URL}/tasks/restore/${id}`,
        {
            method: "PATCH",

            headers: {
                Authorization:
                    `Bearer ${token}`,
            },
        }
    );

    getTasks();
    getTrash();
}

// PERMANENT DELETE
async function permanentDeleteTask(id) {

    const confirmDelete =
        confirm(
            "Delete permanently?"
        );

    if (!confirmDelete)
        return;

    await fetch(
        `${BASE_URL}/tasks/permanent/${id}`,
        {
            method: "DELETE",

            headers: {
                Authorization:
                    `Bearer ${token}`,
            },
        }
    );

    getTasks();
    getTrash();
}

// LOGOUT
function logout() {
    localStorage.clear();

    window.location.href =
        "home.html";
}

// INITIAL LOAD
getProfile();
getCategories();
getTasks();
getTrash();