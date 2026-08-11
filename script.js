console.log("JavaScript is working!");

let users = [];
let tasks = [];

const userForm = document.getElementById("user-form");
const userInput = document.getElementById("user-input");

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskAssignee = document.getElementById("task-assignee");

const userFilter = document.getElementById("user-filter");
const taskList = document.getElementById("task-list");

function loadData() {
    const savedUsers = localStorage.getItem("users");
    const savedTasks = localStorage.getItem("tasks");

    if (savedUsers) {
        try {
            users = JSON.parse(savedUsers);
        } catch (error) {
            users = [];
        }
    }

    if (savedTasks) {
        try {
            tasks = JSON.parse(savedTasks);
        } catch (error) {
            tasks = [];
        }
    }
}

function saveData() {
    localStorage.setItem(
        "users",
        JSON.stringify(users)
    );

    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );
}

function addUser(event) {
    event.preventDefault();

    const username = userInput.value.trim();

    if (username === "") {
        alert("User name cannot be empty.");
        return;
    }

    if (!/^[A-Za-z ]+$/.test(username)) {
        alert("Username can contain alphabets and spaces only.");
        return;
    }

    const userExists = users.some(
        user =>
            user.name.toLowerCase() ===
            username.toLowerCase()
    );

    if (userExists) {
        alert("This user already exists.");
        return;
    }

    const newUser = {
        id: Date.now(),
        name: username
    };

    users.push(newUser);

    saveData();

    renderUsers();

    renderUserFilter();

    renderUserStatistics();

    userInput.value = "";
}

function renderUsers() {
    taskAssignee.innerHTML = "";

    const defaultOption =
        document.createElement("option");

    defaultOption.value = "";
    defaultOption.textContent = "Select User";

    taskAssignee.appendChild(defaultOption);

    users.forEach(user => {
        const option =
            document.createElement("option");

        option.value = user.id;
        option.textContent = user.name;

        taskAssignee.appendChild(option);
    });
}

function renderUserFilter() {
    if (!userFilter) {
        return;
    }

    userFilter.innerHTML = "";

    const allOption =
        document.createElement("option");

    allOption.value = "all";
    allOption.textContent = "All Users";

    userFilter.appendChild(allOption);

    users.forEach(user => {
        const option =
            document.createElement("option");

        option.value = user.id;
        option.textContent = user.name;

        userFilter.appendChild(option);
    });
}

function addTask(event) {
    event.preventDefault();

    const title = taskInput.value.trim();

    if (title === "") {
        alert("Task cannot be empty.");
        return;
    }

    const userId = Number(taskAssignee.value);

    if (!taskAssignee.value) {
        alert("Please select a user.");
        return;
    }

    const validUser = users.some(
        user => user.id === userId
    );

    if (!validUser) {
        alert("Please select a valid user.");
        return;
    }

    const newTask = {
        id: Date.now(),
        title: title,
        userId: userId,
        completed: false
    };

    tasks.push(newTask);

    saveData();

    taskInput.value = "";
    taskAssignee.value = "";

    renderTasks();
    updateStatistics();
    renderUserStatistics();
}

function renderTasks() {
    if (!taskList) {
        return;
    }

    taskList.innerHTML = "";

    let selectedUser = "all";

    if (userFilter) {
        selectedUser = userFilter.value;
    }

    let filteredTasks = tasks;

    if (selectedUser !== "all") {
        filteredTasks = tasks.filter(
            task =>
                task.userId === Number(selectedUser)
        );
    }

    if (filteredTasks.length === 0) {
        const message =
            document.createElement("li");

        message.textContent = "No tasks found.";

        taskList.appendChild(message);

        updateStatistics();
        renderUserStatistics();

        return;
    }

    filteredTasks.forEach(task => {
        const user = users.find(
            user => user.id === task.userId
        );

        const li =
            document.createElement("li");

        li.className = "task-item";

        if (task.completed) {
            li.classList.add("is-completed");
        }

        const content =
            document.createElement("div");

        content.className = "task-content";

        const checkbox =
            document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;

        checkbox.addEventListener(
            "change",
            function () {
                toggleTask(task.id);
            }
        );

        const text =
            document.createElement("span");

        text.className = "task-text";
        text.textContent = task.title;

        const meta =
            document.createElement("span");

        meta.className = "task-meta";
        meta.textContent =
            user ? user.name : "Unknown User";

        content.appendChild(checkbox);
        content.appendChild(text);
        content.appendChild(meta);

        const deleteButton =
            document.createElement("button");

        deleteButton.className = "btn-delete";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener(
            "click",
            function () {
                deleteTask(task.id);
            }
        );

        li.appendChild(content);
        li.appendChild(deleteButton);

        taskList.appendChild(li);
    });

    updateStatistics();
    renderUserStatistics();
}

function toggleTask(taskId) {
    const task = tasks.find(
        task => task.id === taskId
    );

    if (!task) {
        return;
    }

    task.completed = !task.completed;

    saveData();

    renderTasks();
    updateStatistics();
    renderUserStatistics();
}

function deleteTask(taskId) {
    tasks = tasks.filter(
        task => task.id !== taskId
    );

    saveData();

    renderTasks();
    updateStatistics();
    renderUserStatistics();
}

function filterTasks() {
    renderTasks();
}

function updateStatistics() {
    const completedTasks =
        tasks.filter(
            task => task.completed
        );

    const pendingTasks =
        tasks.filter(
            task => !task.completed
        );

    const completedCount =
        document.getElementById("completed-count");

    const pendingCount =
        document.getElementById("pending-count");

    if (completedCount) {
        completedCount.textContent =
            completedTasks.length;
    }

    if (pendingCount) {
        pendingCount.textContent =
            pendingTasks.length;
    }

    console.log("Total:", tasks.length);
    console.log("Completed:", completedTasks.length);
    console.log("Pending:", pendingTasks.length);
}

function renderUserStatistics() {
    const statistics =
        document.getElementById(
            "user-statistics"
        );

    if (!statistics) {
        return;
    }

    statistics.innerHTML = "";

    users.forEach(user => {
        const userTasks =
            tasks.filter(
                task =>
                    task.userId === user.id
            );

        const completed =
            userTasks.filter(
                task => task.completed
            ).length;

        const pending =
            userTasks.filter(
                task => !task.completed
            ).length;

        const userBox =
            document.createElement("div");

        userBox.className = "user-stat";

        const name =
            document.createElement("h3");

        name.textContent = user.name;

        const total =
            document.createElement("p");

        total.textContent =
            `Total: ${userTasks.length}`;

        const completedText =
            document.createElement("p");

        completedText.textContent =
            `Completed: ${completed}`;

        const pendingText =
            document.createElement("p");

        pendingText.textContent =
            `Pending: ${pending}`;

        userBox.appendChild(name);
        userBox.appendChild(total);
        userBox.appendChild(completedText);
        userBox.appendChild(pendingText);

        statistics.appendChild(userBox);
    });
}

userForm.addEventListener(
    "submit",
    addUser
);

taskForm.addEventListener(
    "submit",
    addTask
);

if (userFilter) {
    userFilter.addEventListener(
        "change",
        filterTasks
    );
}

loadData();

renderUsers();

renderUserFilter();

renderTasks();

updateStatistics();

renderUserStatistics();

console.log("Application loaded!");