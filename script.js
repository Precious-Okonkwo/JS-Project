
const STORAGE_KEY = "personalTaskManager.tasks";

let tasks = [];
let currentFilter = "all";

//---------- Accessing the DOM Elements----------
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

//-------- Load And Save Task In LocalStorage --------
function loadTasks() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not read saved tasks:", error);
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Could not save tasks:", error);
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