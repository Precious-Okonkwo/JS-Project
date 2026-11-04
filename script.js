
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
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
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
  [titleInput, descInput, priorityInput, dueDateInput].forEach((el) => showError(el, ""));
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