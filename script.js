// ==========================================
// TASKFLOW - TO-DO LIST APPLICATION
// ==========================================


// ==========================================
// GET HTML ELEMENTS
// ==========================================

const taskInput = document.getElementById("taskInput");
const category = document.getElementById("category");
const priority = document.getElementById("priority");
const dueDate = document.getElementById("dueDate");
const assignedDate = document.getElementById("assignedDate");   

const addBtn = document.getElementById("addBtn");

const searchInput = document.getElementById("search");
const filter = document.getElementById("filter");

const taskList = document.getElementById("taskList");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");

const themeBtn = document.getElementById("themeBtn");


// ==========================================
// LOAD TASKS FROM LOCAL STORAGE
// ==========================================

let tasks = JSON.parse(localStorage.getItem("taskflowTasks")) || [];


// ==========================================
// SAVE TASKS
// ==========================================

function saveTasks() {
    localStorage.setItem("taskflowTasks", JSON.stringify(tasks));
}


// ==========================================
// ADD TASK
// ==========================================

function addTask() {

    const title = taskInput.value.trim();

    // Check empty task
    if (title === "") {
        alert("Please enter a task.");
        taskInput.focus();
        return;
    }

    // Create task object
    const newTask = 
    {
        id: Date.now(),
        title: title,
        category: category.value,
        priority: priority.value,
        dueDate: dueDate.value,

        assignedDate: assignedDate.value || getTodayDate(),
        completedDate: null,

        completed: false
    };


    // Add task to array
    tasks.push(newTask);

    // Save
    saveTasks();

    // Clear form
    taskInput.value = "";
    category.value = "Personal";
    priority.value = "Low";
    dueDate.value = "";
    assignedDate.value = "";

    // Refresh task list
    displayTasks();

    // Focus input
    taskInput.focus();
}


// ==========================================
// DISPLAY TASKS
// ==========================================

function displayTasks() {

    taskList.innerHTML = "";

    let filteredTasks = [...tasks];

    // ======================================
    // SEARCH
    // ======================================

    const searchText = searchInput.value.toLowerCase().trim();

    if (searchText !== "") {

        filteredTasks = filteredTasks.filter(task =>
            task.title.toLowerCase().includes(searchText) ||
            task.category.toLowerCase().includes(searchText) ||
            task.priority.toLowerCase().includes(searchText)
        );
    }


    // ======================================
    // FILTER
    // ======================================

    const selectedFilter = filter.value;

    if (selectedFilter === "pending") {

        filteredTasks = filteredTasks.filter(
            task => !task.completed
        );

    } else if (selectedFilter === "completed") {

        filteredTasks = filteredTasks.filter(
            task => task.completed
        );

    } else if (selectedFilter === "high") {

        filteredTasks = filteredTasks.filter(
            task => task.priority === "High"
        );
    }


    // ======================================
    // NO TASK MESSAGE
    // ======================================

    if (filteredTasks.length === 0) {

        const emptyMessage = document.createElement("div");

        emptyMessage.className = "task-card";

        emptyMessage.innerHTML = `
            <div class="task-info">
                <div class="task-title">
                    No tasks found
                </div>

                <div class="task-details">
                    Add a new task or change your search/filter.
                </div>
            </div>
        `;

        taskList.appendChild(emptyMessage);

        updateStatistics();

        return;
    }


    // ======================================
    // CREATE TASK CARDS
    // ======================================

    filteredTasks.forEach(task => {

        const taskCard = document.createElement("div");

        taskCard.className = "task-card";

        // Add completed class
        if (task.completed) {
            taskCard.classList.add("completed");
        }


        // Format date
        let formattedDate = "No due date";

        if (task.dueDate) {

            const date = new Date(task.dueDate + "T00:00:00");

            formattedDate = date.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );
        }


        // Priority text
        let priorityText = "";

        if (task.priority === "High") {
            priorityText = "🔴 High";
        } else if (task.priority === "Medium") {
            priorityText = "🟡 Medium";
        } else {
            priorityText = "🟢 Low";
        }


        // Task card HTML
        taskCard.innerHTML = `            
        <div class="task-details">
         <span>
         📁 ${escapeHTML(task.category)}
          </span>

        <span>
        ${priorityText}
         </span>

        <span>
        📌 Assigned:
        ${formatDate(task.assignedDate)}
        </span>

        <span>
        📅 Due:
        ${formattedDate}
        </span>

        <span>
        ${
            task.completed
            ? "✅ Completed"
            : "⏳ Pending"
        }
        </span>
        </div>
        
        <div class="task-timing">
         ${
             task.completed
             ? `
            <span class="completed-date">
                ✅ Completed:
                ${formatDate(task.completedDate)}
            </span>
             `
              : ""
            }
            ${
                task.completed && task.dueDate
                ? (() => {
                    const delay = calculateDelay
                    (
                     task.dueDate,
                     task.completedDate
                    );
                    if (delay > 0) 
                        {
                             return `
                            <span class="delay-badge">
                            🔴 Delayed by
                            ${delay}
                            day${delay > 1 ? "s" : ""}
                            </span>
                            `;
                        }
                         return `
                         <span class="on-time-badge">
                         🟢 Completed On Time
                        </span>
                         `;
                        })()
                        : ""
            }
            ${
                 !task.completed && task.dueDate
                 ? (() => {
                    const overdue = calculateOverdueDays(
                        task.dueDate
                    );
                    if (overdue > 0) {
                        return `
                        <span class="overdue-badge">
                        ⚠️ Overdue by
                        ${overdue}
                        day${overdue > 1 ? "s" : ""}
                        </span>
                        `;
                    }
                    return "";
                })()
                : ""
            }
        </div>


            </div>


            <div class="task-actions">
            <button
                class="edit-btn"
                onclick="editTask(${task.id})"
                 >
                 ✏️ Edit
            </button>


                <button
                    class="complete-btn"
                    onclick="toggleTask(${task.id})"
                >
                    ${task.completed ? "↩ Undo" : "✓ Complete"}
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteTask(${task.id})"
                >
                    🗑 Delete
                </button>

            </div>
        `;


        taskList.appendChild(taskCard);
    });


    // Update statistics
    updateStatistics();
}

// ==========================================
// EDIT TASK
// ==========================================

function editTask(id) {

    const task = tasks.find(task => task.id === id);

    if (!task) {
        return;
    }

    taskInput.value = task.title;
    category.value = task.category;
    priority.value = task.priority;
    dueDate.value = task.dueDate;
    assignedDate.value = task.assignedDate || "";
    task.assignedDate = assignedDate.value || task.assignedDate || getTodayDate();
    assignedDate.value = "";

    addBtn.textContent = "Update Task";

    addBtn.onclick = function () {

        const newTitle = taskInput.value.trim();

        if (newTitle === "") {
            alert("Please enter a task.");
            taskInput.focus();
            return;
        }

        task.title = newTitle;
        task.category = category.value;
        task.priority = priority.value;
        task.dueDate = dueDate.value;

        saveTasks();

        taskInput.value = "";
        category.value = "Personal";
        priority.value = "Low";
        dueDate.value = "";

        addBtn.textContent = "+ Add Task";

        addBtn.onclick = addTask;

        displayTasks();

        taskInput.focus();
    };

    taskInput.focus();
}
// ==========================================
// TOGGLE TASK
// ==========================================


/* ==========================================
   COMPLETE / UNDO TASK
========================================== */

function toggleTask(id) {

    const task = tasks.find(
        task => task.id === id
    );

    if (!task) {
        return;
    }

    if (!task.completed) {

        // Mark task as completed
        task.completed = true;

        // Store completion date
        task.completedDate = getTodayDate();

    } else {

        // Undo completed task
        task.completed = false;

        // Remove completion date
        task.completedDate = null;
    }

    saveTasks();

    displayTasks();
}



// ==========================================
// DELETE TASK
// ==========================================

function deleteTask(id) {

    const task = tasks.find(task => task.id === id);

    if (!task) {
        return;
    }


    const confirmDelete = confirm(
        `Are you sure you want to delete "${task.title}"?`
    );


    if (!confirmDelete) {
        return;
    }


    tasks = tasks.filter(task => task.id !== id);

    saveTasks();

    displayTasks();
}


// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStatistics() {

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const pending = total - completed;


    totalTasks.textContent = total;

    completedTasks.textContent = completed;

    pendingTasks.textContent = pending;
}


// ==========================================
// SEARCH TASKS
// ==========================================

searchInput.addEventListener(
    "input",
    displayTasks
);


// ==========================================
// FILTER TASKS
// ==========================================

filter.addEventListener(
    "change",
    displayTasks
);


// ==========================================
// ADD TASK BUTTON
// ==========================================

addBtn.onclick = addTask;

// ==========================================
// PRESS ENTER TO ADD OR UPDATE TASK
// ==========================================

taskInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        event.preventDefault();
        addBtn.click();
    }

});


// ==========================================
// DARK / LIGHT MODE
// ==========================================

function loadTheme() {

    const savedTheme = localStorage.getItem("taskflowTheme");

    if (savedTheme === "dark") {

        document.body.classList.add("dark");

        themeBtn.textContent = "☀️";

    } else {

        document.body.classList.remove("dark");

        themeBtn.textContent = "🌙";
    }
}


// ==========================================
// CHANGE THEME
// ==========================================

themeBtn.addEventListener(
    "click",
    function () {

        document.body.classList.toggle("dark");


        if (document.body.classList.contains("dark")) {

            localStorage.setItem(
                "taskflowTheme",
                "dark"
            );

            themeBtn.textContent = "☀️";

        } else {

            localStorage.setItem(
                "taskflowTheme",
                "light"
            );

            themeBtn.textContent = "🌙";
        }

    }
);


// ==========================================
// ESCAPE HTML
// Prevents HTML from being inserted
// into the task title.
// ==========================================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}

/* ==========================================
   DATE TRACKING FUNCTIONS
========================================== */

// Get today's date in YYYY-MM-DD format
function getTodayDate() {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// Format date for display
function formatDate(dateString) {

    if (!dateString) {
        return "Not recorded";
    }

    const date = new Date(
        dateString + "T00:00:00"
    );

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


// Calculate delayed days for completed tasks
function calculateDelay(dueDate, completedDate) {

    if (!dueDate || !completedDate) {
        return 0;
    }

    const due = new Date(
        dueDate + "T00:00:00"
    );

    const completed = new Date(
        completedDate + "T00:00:00"
    );

    const difference = completed - due;

    const days = Math.floor(
        difference / (1000 * 60 * 60 * 24)
    );

    return Math.max(0, days);
}


// Calculate overdue days for pending tasks
function calculateOverdueDays(dueDate) {

    if (!dueDate) {
        return 0;
    }

    const today = new Date(
        getTodayDate() + "T00:00:00"
    );

    const due = new Date(
        dueDate + "T00:00:00"
    );

    const difference = today - due;

    const days = Math.floor(
        difference / (1000 * 60 * 60 * 24)
    );

    return Math.max(0, days);
}


// ==========================================
// INITIAL LOAD
// ==========================================

loadTheme();

displayTasks();

updateStatistics();