
const STORAGE_KEY = "personalTaskManager.tasks";

let tasks = [];
let currentFilter = "all";

//---------- Accessing the DOM Elements ----------
const form = document.getElementById("task-form");
const titleInput = document.getElementById("task-title");
const descriptionInput = document.getElementById("task-description");
const priorityInput = document.getElementById("task-priority");
const dueDateInput = document.getElementById("task-due-date");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const formHeader = document.getElementById("form-header");
const taskFlow = document.getElementById("task-flow");
const emptytask = document.getElementById("empty-task");
const summary = document.getElementById("summary");
const statusButtons = document.querySelectorAll(".select-status-btn");

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
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });
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

  if (descInput.value.trim().length > 200) {
    showError(descInput, "Description cannot exceed 200 characters.");
    valid = false;
  }

  if (!priorityInput.value) {
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
  }
}

function toggleComplete(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }
}


//----------- Form Handling ----------------
function startEdit(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  idInput.value = task.id;
  titleInput.value = task.title;
  descInput.value = task.description;
  priorityInput.value = task.priority;
  dueDateInput.value = task.dueDate;

  formTitle.textContent = "Edit Task";
  submitBtn.textContent = "Update Task";
  cancelBtn.hidden = false;
  clearErrors();
  form.scrollIntoView({ behavior: "smooth", block: "start" });
  titleInput.focus();
}

function resetForm() {
  form.reset();
  idInput.value = "";
  formTitle.textContent = "Add a Task";
  submitBtn.textContent = "Add Task";
  cancelBtn.hidden = true;
  clearErrors();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateForm()) return;

  const data = {
    title: titleInput.value.trim(),
    description: descInput.value.trim(),
    priority: priorityInput.value,
    dueDate: dueDateInput.value,
  };

  if (idInput.value) {
    updateTask(idInput.value, data);
  } else {
    addTask(data);
  }

  saveTasks();
  resetForm();
  renderTasks();
});

cancelBtn.addEventListener("click", resetForm);

// This Clears an error as soon as the user fixes the field
[titleInput, descInput, priorityInput, dueDateInput].forEach((el) => {
  el.addEventListener("input", () => showError(el, ""));
});

//----------- Task Filter Control -------------
statusButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentStatus = btn.dataset.status;
    statusButtons.forEach((b) => b.classList.toggle("active", b === btn));
    renderTasks();
  });
});

function getVisibleTasks() {
  let list = tasks;
  if (currentStatus === "pending") list = tasks.status((t) => !t.completed);
  if (currentStatus === "completed") list = tasks.status((t) => t.completed);

  // Pending first, then by due date
  return [...list].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return a.dueDate.localeCompare(b.dueDate);
  });
}