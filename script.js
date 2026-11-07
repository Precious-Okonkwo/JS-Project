
const STORAGE_KEY = "personalTaskManager.tasks";

let tasks = [];
let currentStatus = "all";

//---------- Accessing the DOM Elements ----------
const form = document.getElementById("task-form");
const idInput = document.getElementById("task-id");
const titleInput = document.getElementById("task-title");
const descriptionInput = document.getElementById("task-description");
const priorityInput = document.getElementById("task-priority");
const dueDateInput = document.getElementById("task-due-date");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const formHeader = document.getElementById("form-header");
const taskFlow = document.getElementById("task-flow");
const emptyTask = document.getElementById("empty-task");
const summary = document.getElementById("summary");
const statusButtons = document.querySelectorAll(".select-status-btn");
const searchInputb = document.getElementById("search-input")


//-------- Load And Save Tasks In LocalStorage --------
function loadTasks() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.log("Could not read saved tasks:", error);
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.log("Could not save tasks:", error);
    alert("Your tasks could not be saved. Storage may be full or disabled.");
  }
}


function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function todayString() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "No due date"
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj)) return "Invalid Date";
  return dateObj.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}


//----------- Form Validation-------------
function showError(input, message) {
  document.getElementById(`${input.id}-error`).textContent = message;
  input.classList.toggle("invalid", Boolean(message));
}


function clearErrors() {
  [titleInput, descriptionInput, priorityInput, dueDateInput].forEach((el) => showError(el, ""));
}

function validateForm() {
  clearErrors();
  let valid = true;

  const title = titleInput.value.trim();
  if (!title) {
    showError(titleInput, "Title is required.");
    valid = false;
  } else if (title.length < 3) {
    showError(titleInput, "Title must be at least 3 characters.");
    valid = false;
  }

  const description = descriptionInput.value.trim()
  if (!description) {
    showError(descriptionInput, "description is required.");
    valid = false;
  } else if (descriptionInput.value.trim().length > 200) {
    showError(descriptionInput, "Description cannot exceed 200 characters.");
    valid = false;
  }

  const priority = priorityInput.valid
  if (!priority) {
    showError(priorityInput, "Please choose a priority.");
    valid = false;
  }

  const due = dueDateInput.value;
  if (!due) {
    showError(dueDateInput, "Due date is required.");
    valid = false;
  } else {
    const existing = tasks.find((t) => t.id === idInput.value);
    const dateChanged = !existing || existing.dueDate !== due;
    if (dateChanged && due < todayString()) {
      showError(dueDateInput, "Due date cannot be in the past.");
      valid = false;
    }
  }

  return valid;
}


//--------- Task Operations ------------
function addTask(data) {
  tasks.push({ id: generateId(), completed: false, createdAt: Date.now(), ...data });
}

function updateTask(id, data) {
  const task = tasks.find((t) => t.id === id);
  if (task) Object.assign(task, data);
}

function deleteTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  if (confirm(`Delete "${task.title}"?`)) {
    tasks = tasks.filter((t) => t.id !== id);
    if (idInput.value === id) resetForm();
    saveTasks();
    renderTasks();
    updateTaskCount();
  }
}

function toggleComplete(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
    updateTaskCount();
  }
}

function updateTaskCount() {
  const completedCount = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingCount = tasks.length - completedCount;

  document.getElementById("all-tasks-count").textContent = tasks.length;
  document.getElementById("pending-tasks-count").textContent = pendingCount;
  document.getElementById("completed-tasks-count").textContent = completedCount;
}




//----------- Form Handling ----------------
function startEdit(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  idInput.value = task.id;
  titleInput.value = task.title;
  descriptionInput.value = task.description;
  priorityInput.value = task.priority;
  dueDateInput.value = task.dueDate;

  formHeader.textContent = "Edit Task";
  submitBtn.textContent = "Update Task";
  cancelBtn.hidden = false;
  clearErrors();
  form.scrollIntoView({ behavior: "smooth", block: "start" });
  titleInput.focus();
}

function resetForm() {
  form.reset();
  idInput.value = "";
  formHeader.textContent = "&plus; Add a New Task";
  submitBtn.textContent = "Add Task";
  cancelBtn.hidden = true;
  clearErrors();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateForm()) return;

  const data = {
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim(),
    priority: priorityInput.value,
    dueDate: dueDateInput.value,
    completed: false
  };

  if (idInput.value) {
    updateTask(idInput.value, data);
  } else {
    addTask(data);
  }

  saveTasks();
  resetForm();
  renderTasks();
  updateTaskCount();
});

cancelBtn.addEventListener("click", resetForm);

// This Clears an error as soon as the user fixes the field
[titleInput, descriptionInput, priorityInput, dueDateInput].forEach((el) => {
  el.addEventListener("input", () => showError(el, ""));
});

//----------- Task Status Control -------------
statusButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentStatus = btn.dataset.status;
    statusButtons.forEach((b) => b.classList.toggle("active", b === btn));
    renderTasks();
  });
});

if (searchInputb) {
  searchInputb.addEventListener("input", () => {
    renderTasks();
  });
}



function getVisibleTasks() {
  let list = tasks;
  if (currentStatus === "pending") list = list.filter((t) => !t.completed);
  if (currentStatus === "completed") list = list.filter((t) => t.completed);

  if (searchInputb && searchInputb.value) {
    const query = searchInputb.value.toLowerCase().trim();
    list = list.filter(t =>
      t.title.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query)
    );
  }

  // Pending first, then by due date
  return [...list].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
}

// ---------- Creating Elements ----------
function createButton(text, className, onClick) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = className;
  btn.textContent = text;
  btn.addEventListener("click", onClick);
  return btn;
}

function createTaskElement(task) {
  const li = document.createElement("li");
  li.className = `task priority-${task.priority}${task.completed ? " completed" : ""}`;

  // Left side: checkbox + details
  const content = document.createElement("div");
  content.className = "task-content";

  const top = document.createElement("div");
  top.className = "task-top";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  checkbox.setAttribute("aria-label", `Mark "${task.title}" as completed`);
  checkbox.addEventListener("change", () => toggleComplete(task.id));

  const text = document.createElement("div");
  const title = document.createElement("p");
  title.className = "task-title";
  title.textContent = task.title;
  text.appendChild(title);

  if (task.description) {
    const description = document.createElement("p");
    description.className = "task-description";
    description.textContent = task.description;
    text.appendChild(description);
  }

  top.append(checkbox, text);

  // Meta info
  const taskMeta = document.createElement("div");
  taskMeta.className = "task-meta";

  const tag = document.createElement("span");
  tag.className = `tag ${task.priority}`;
  tag.textContent = task.priority;

  const due = document.createElement("span");
  const overdue = !task.completed && task.dueDate < todayString();
  due.className = `due${overdue ? " overdue" : ""}`;
  due.textContent = `Due: ${formatDate(task.dueDate)}${overdue ? " (overdue)" : ""}`;

  const status = document.createElement("span");
  status.className = `status${task.completed ? " done" : ""}`;
  status.textContent = task.completed ? "Completed" : "Pending";

  taskMeta.append(tag, due, status);
  content.append(top, taskMeta);

  // Right side: actions
  const actions = document.createElement("div");
  actions.className = "task-actions";
  actions.append(
    createButton("Edit", "small-btn", () => startEdit(task.id)),
    createButton("Delete", "small-btn delete", () => deleteTask(task.id))
  );

  li.append(content, actions);
  return li;
}


function renderTasks() {
  taskFlow.innerHTML = "";

  updateTaskCount();

  const visible = getVisibleTasks();

  visible.forEach((task) => taskFlow.appendChild(createTaskElement(task)));

  emptyTask.hidden = visible.length > 0;
  emptyTask.textContent =
    tasks.length === 0
      ? "No tasks yet. Add one above!"
      : `No ${currentStatus} tasks to show.`;

  const done = tasks.filter((t) => t.completed).length;
  summary.textContent = tasks.length
    ? `${done} of ${tasks.length} completed`
    : "";
}

// ---------- Init ----------
function init() {
  tasks = loadTasks();
  dueDateInput.min = todayString();
  renderTasks();
}

init();