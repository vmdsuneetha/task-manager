// Task Manager Application
class TaskManager {
    constructor() {
        this.tasks = this.getTasksFromStorage();
        this.currentFilter = 'all';
        this.currentCategoryFilter = 'all';
        this.searchTerm = '';
        
        this.initializeEventListeners();
        this.renderTasks();
        this.updateStats();
    }

    // Get tasks from localStorage
    getTasksFromStorage() {
        const tasks = localStorage.getItem('tasks');
        return tasks ? JSON.parse(tasks) : [];
    }

    // Save tasks to localStorage
    saveTasksToStorage() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Add task form
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderTasks();
            });
        });

        // Category filter
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.currentCategoryFilter = e.target.value;
            this.renderTasks();
        });

        // Search input
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.renderTasks();
        });

        // Modal events
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('editTaskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateTask();
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('editModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    // Add new task
    addTask() {
        const taskInput = document.getElementById('taskInput');
        const taskCategory = document.getElementById('taskCategory');
        const taskPriority = document.getElementById('taskPriority');
        const taskDueDate = document.getElementById('taskDueDate');

        const task = {
            id: this.generateId(),
            text: taskInput.value.trim(),
            category: taskCategory.value,
            priority: taskPriority.value,
            dueDate: taskDueDate.value,
            completed: false,
            createdAt: new Date().toISOString()
        };

        if (task.text) {
            this.tasks.unshift(task);
            this.saveTasksToStorage();
            this.renderTasks();
            this.updateStats();
            
            // Reset form
            taskInput.value = '';
            taskDueDate.value = '';
            taskInput.focus();

            // Show success message
            this.showNotification('Task added successfully!', 'success');
        }
    }

    // Delete task
    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasksToStorage();
            this.renderTasks();
            this.updateStats();
            this.showNotification('Task deleted successfully!', 'success');
        }
    }

    // Toggle task completion
    toggleTaskCompletion(taskId) {
        this.tasks = this.tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        this.saveTasksToStorage();
        this.renderTasks();
        this.updateStats();
    }

    // Open edit modal
    openEditModal(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            document.getElementById('editTaskId').value = task.id;
            document.getElementById('editTaskInput').value = task.text;
            document.getElementById('editTaskCategory').value = task.category;
            document.getElementById('editTaskPriority').value = task.priority;
            document.getElementById('editTaskDueDate').value = task.dueDate;
            
            document.getElementById('editModal').style.display = 'block';
        }
    }

    // Close modal
    closeModal() {
        document.getElementById('editModal').style.display = 'none';
    }

    // Update task
    updateTask() {
        const taskId = document.getElementById('editTaskId').value;
        const taskText = document.getElementById('editTaskInput').value.trim();
        const taskCategory = document.getElementById('editTaskCategory').value;
        const taskPriority = document.getElementById('editTaskPriority').value;
        const taskDueDate = document.getElementById('editTaskDueDate').value;

        if (taskText) {
            this.tasks = this.tasks.map(task => {
                if (task.id === taskId) {
                    return {
                        ...task,
                        text: taskText,
                        category: taskCategory,
                        priority: taskPriority,
                        dueDate: taskDueDate
                    };
                }
                return task;
            });

            this.saveTasksToStorage();
            this.renderTasks();
            this.closeModal();
            this.showNotification('Task updated successfully!', 'success');
        }
    }

    // Filter and search tasks
    getFilteredTasks() {
        return this.tasks.filter(task => {
            const matchesFilter = this.currentFilter === 'all' || 
                                (this.currentFilter === 'pending' && !task.completed) ||
                                (this.currentFilter === 'completed' && task.completed);
            
            const matchesCategory = this.currentCategoryFilter === 'all' || 
                                  task.category === this.currentCategoryFilter;
            
            const matchesSearch = task.text.toLowerCase().includes(this.searchTerm);

            return matchesFilter && matchesCategory && matchesSearch;
        });
    }

    // Render tasks
    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            tasksList.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            tasksList.style.display = 'block';
            emptyState.style.display = 'none';
            
            tasksList.innerHTML = filteredTasks.map(task => `
                <div class="task-item ${task.completed ? 'completed' : ''}">
                    <div class="task-content">
                        <div class="task-text">${this.escapeHtml(task.text)}</div>
                        <div class="task-meta">
                            <span class="task-category ${task.category}">
                                <i class="fas fa-tag"></i> ${task.category}
                            </span>
                            <span class="task-priority ${task.priority}">
                                <i class="fas fa-exclamation-circle"></i> ${task.priority}
                            </span>
                            ${task.dueDate ? `
                                <span class="task-due">
                                    <i class="fas fa-calendar"></i> ${this.formatDate(task.dueDate)}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    <div class="task-actions">
                        <button onclick="taskManager.toggleTaskCompletion('${task.id}')" 
                                class="${task.completed ? 'btn btn-warning' : 'btn btn-success'}">
                            <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
                            ${task.completed ? 'Undo' : 'Complete'}
                        </button>
                        <button onclick="taskManager.openEditModal('${task.id}')" class="btn btn-primary">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button onclick="taskManager.deleteTask('${task.id}')" class="btn btn-danger">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    // Update statistics
    updateStats() {
        const totalTasks = this.tasks.length;
        const pendingTasks = this.tasks.filter(task => !task.completed).length;
        const completedTasks = this.tasks.filter(task => task.completed).length;

        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('pendingTasks').textContent = pendingTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
    }

    // Format date
    formatDate(dateString) {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    // Escape HTML to prevent XSS
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Show notification
    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1001;
            display: flex;
            align-items: center;
            gap: 1rem;
            animation: slideIn 0.3s ease;
        `;

        notification.querySelector('button').style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 0;
        `;

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }
}

// Add CSS for notification animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Initialize Task Manager when DOM is loaded
let taskManager;
document.addEventListener('DOMContentLoaded', () => {
    taskManager = new TaskManager();
    
    // Set minimum date for due date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('taskDueDate').min = today;
    document.getElementById('editTaskDueDate').min = today;
});