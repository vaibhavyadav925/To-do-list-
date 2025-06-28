class TodoApp {
  constructor() {
    this.tasks = this.loadTasks()
    this.taskIdCounter = this.getNextId()
    this.initializeElements()
    this.bindEvents()
    this.render()
  }

  initializeElements() {
    this.taskInput = document.getElementById("taskInput")
    this.addBtn = document.getElementById("addBtn")
    this.taskList = document.getElementById("taskList")
    this.emptyState = document.getElementById("emptyState")
    this.clearAllBtn = document.getElementById("clearAllBtn")
    this.totalTasksEl = document.getElementById("totalTasks")
    this.completedTasksEl = document.getElementById("completedTasks")
    this.pendingTasksEl = document.getElementById("pendingTasks")
  }

  bindEvents() {
    this.addBtn.addEventListener("click", () => this.addTask())
    this.taskInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.addTask()
      }
    })
    this.clearAllBtn.addEventListener("click", () => this.clearAllTasks())
  }

  addTask() {
    const taskText = this.taskInput.value.trim()

    if (taskText === "") {
      this.showInputError()
      return
    }

    const task = {
      id: this.taskIdCounter++,
      text: taskText,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    this.tasks.unshift(task) // Add to beginning of array
    this.taskInput.value = ""
    this.saveTasks()
    this.render()
    this.showSuccessAnimation()
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter((task) => task.id !== id)
    this.saveTasks()
    this.render()
  }

  toggleTask(id) {
    const task = this.tasks.find((task) => task.id === id)
    if (task) {
      task.completed = !task.completed
      this.saveTasks()
      this.render()
    }
  }

  clearAllTasks() {
    if (this.tasks.length === 0) return

    if (confirm("Are you sure you want to delete all tasks?")) {
      this.tasks = []
      this.saveTasks()
      this.render()
    }
  }

  render() {
    this.renderTasks()
    this.updateStats()
    this.toggleEmptyState()
  }

  renderTasks() {
    this.taskList.innerHTML = ""

    this.tasks.forEach((task) => {
      const taskElement = this.createTaskElement(task)
      this.taskList.appendChild(taskElement)
    })
  }

  createTaskElement(task) {
    const li = document.createElement("li")
    li.className = `task-item ${task.completed ? "completed" : ""}`
    li.setAttribute("data-id", task.id)

    li.innerHTML = `
            <div class="task-text">${this.escapeHtml(task.text)}</div>
            <div class="task-actions">
                <button class="complete-btn ${task.completed ? "completed" : ""}" 
                        onclick="window.todoApp.toggleTask(${task.id})">
                    ${task.completed ? "Undo" : "Complete"}
                </button>
                <button class="delete-btn" onclick="window.todoApp.deleteTask(${task.id})">
                    Delete
                </button>
            </div>
        `

    return li
  }

  updateStats() {
    const total = this.tasks.length
    const completed = this.tasks.filter((task) => task.completed).length
    const pending = total - completed

    this.totalTasksEl.textContent = total
    this.completedTasksEl.textContent = completed
    this.pendingTasksEl.textContent = pending
  }

  toggleEmptyState() {
    if (this.tasks.length === 0) {
      this.emptyState.classList.remove("hidden")
      this.clearAllBtn.style.display = "none"
    } else {
      this.emptyState.classList.add("hidden")
      this.clearAllBtn.style.display = "block"
    }
  }

  showInputError() {
    this.taskInput.style.borderColor = "#dc3545"
    this.taskInput.style.boxShadow = "0 0 0 3px rgba(220, 53, 69, 0.1)"
    this.taskInput.placeholder = "Please enter a task!"

    setTimeout(() => {
      this.taskInput.style.borderColor = "#e9ecef"
      this.taskInput.style.boxShadow = "none"
      this.taskInput.placeholder = "Enter a new task..."
    }, 2000)
  }

  showSuccessAnimation() {
    this.addBtn.style.transform = "scale(0.95)"
    setTimeout(() => {
      this.addBtn.style.transform = "scale(1)"
    }, 150)
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  saveTasks() {
    try {
      localStorage.setItem("todoTasks", JSON.stringify(this.tasks))
      localStorage.setItem("taskIdCounter", this.taskIdCounter.toString())
    } catch (error) {
      console.error("Failed to save tasks to localStorage:", error)
    }
  }

  loadTasks() {
    try {
      const saved = localStorage.getItem("todoTasks")
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error("Failed to load tasks from localStorage:", error)
      return []
    }
  }

  getNextId() {
    try {
      const saved = localStorage.getItem("taskIdCounter")
      return saved ? Number.parseInt(saved) : 1
    } catch (error) {
      console.error("Failed to load task counter from localStorage:", error)
      return 1
    }
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.todoApp = new TodoApp()
})

// Add some helpful keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Clear all tasks with Ctrl/Cmd + Shift + D
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "D") {
    e.preventDefault()
    window.todoApp.clearAllTasks()
  }

  // Focus input with Ctrl/Cmd + /
  if ((e.ctrlKey || e.metaKey) && e.key === "/") {
    e.preventDefault()
    window.todoApp.taskInput.focus()
  }
})
