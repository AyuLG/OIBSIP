const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const pendingTasks = document.getElementById('pendingTasks');
const completedTasks = document.getElementById('completedTasks');
const pendingCount = document.getElementById('pendingCount');
const completedCount = document.getElementById('completedCount');

let tasks = [];
let editingId = null;

function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 5);
}

function createTask(text) {
    return {
        id: generateId(),
        text: text.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
    };
}

function addTask() {
    const text = taskInput.value.trim();
    if (!text) {
        taskInput.focus();
        return;
    }

    tasks.unshift(createTask(text));
    taskInput.value = '';
    taskInput.focus();
    saveTasks();
    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    if (editingId === id) editingId = null;
    saveTasks();
    renderTasks();
}

function toggleComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date().toISOString() : null;
        if (editingId === id) editingId = null;
        saveTasks();
        renderTasks();
    }
}

function startEdit(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (editingId !== null && editingId !== id) cancelEdit(editingId);

    const item = document.querySelector(`[data-id="${id}"]`);
    if (!item) return;

    const text = item.querySelector('.task-text');
    const input = item.querySelector('.task-edit-input');
    const editBtn = item.querySelector('.btn-edit');
    const delBtn = item.querySelector('.btn-delete');
    const saveBtn = item.querySelector('.btn-save');
    const cancelBtn = item.querySelector('.btn-cancel');

    text.classList.add('hidden');
    input.classList.add('visible');
    input.value = task.text;
    input.focus();
    input.select();

    editBtn.style.display = 'none';
    delBtn.style.display = 'none';
    saveBtn.style.display = 'inline-flex';
    cancelBtn.style.display = 'inline-flex';

    editingId = id;
}

function saveEdit(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const item = document.querySelector(`[data-id="${id}"]`);
    if (!item) return;

    const input = item.querySelector('.task-edit-input');
    const newText = input.value.trim();

    if (!newText) {
        cancelEdit(id);
        return;
    }

    task.text = newText;
    saveTasks();
    renderTasks();
    editingId = null;
}

function cancelEdit(id) {
    const item = document.querySelector(`[data-id="${id}"]`);
    if (!item) return;

    const text = item.querySelector('.task-text');
    const input = item.querySelector('.task-edit-input');
    const editBtn = item.querySelector('.btn-edit');
    const delBtn = item.querySelector('.btn-delete');
    const saveBtn = item.querySelector('.btn-save');
    const cancelBtn = item.querySelector('.btn-cancel');

    text.classList.remove('hidden');
    input.classList.remove('visible');

    editBtn.style.display = 'inline-flex';
    delBtn.style.display = 'inline-flex';
    saveBtn.style.display = 'none';
    cancelBtn.style.display = 'none';

    editingId = null;
}

function handleEditKey(e, id) {
    if (e.key === 'Enter') {
        e.preventDefault();
        saveEdit(id);
    } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelEdit(id);
    }
}

function renderTasks() {
    const pending = tasks.filter(t => !t.completed);
    const completed = tasks.filter(t => t.completed);

    renderList(pendingTasks, pending);
    renderList(completedTasks, completed);

    pendingCount.textContent = `${pending.length} task${pending.length !== 1 ? 's' : ''}`;
    completedCount.textContent = `${completed.length} task${completed.length !== 1 ? 's' : ''}`;

    updateEmptyStates(pending.length, completed.length);
}

function renderList(container, taskList) {
    container.innerHTML = '';

    taskList.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item${task.completed ? ' completed' : ''}`;
        li.dataset.id = task.id;

        const checkbox = document.createElement('div');
        checkbox.className = `task-checkbox${task.completed ? ' completed' : ''}`;
        checkbox.innerHTML = task.completed ? '<i class="fas fa-check"></i>' : '';
        checkbox.addEventListener('click', () => toggleComplete(task.id));

        const text = document.createElement('span');
        text.className = 'task-text';
        text.textContent = task.text;

        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.className = 'task-edit-input';
        editInput.placeholder = 'Edit task...';
        editInput.maxLength = 100;
        editInput.addEventListener('keydown', (e) => handleEditKey(e, task.id));

        const time = document.createElement('span');
        time.className = 'task-time';
        if (task.completed && task.completedAt) {
            time.textContent = '✅ ' + formatDate(task.completedAt);
        } else if (task.createdAt) {
            time.textContent = '📌 ' + formatDate(task.createdAt);
        }

        const actions = document.createElement('div');
        actions.className = 'task-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn-edit';
        editBtn.innerHTML = '<i class="fas fa-pen"></i>';
        editBtn.addEventListener('click', () => startEdit(task.id));

        const delBtn = document.createElement('button');
        delBtn.className = 'btn-delete';
        delBtn.innerHTML = '<i class="fas fa-trash"></i>';
        delBtn.addEventListener('click', () => deleteTask(task.id));

        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn-save';
        saveBtn.textContent = 'Save';
        saveBtn.addEventListener('click', () => saveEdit(task.id));

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn-cancel';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', () => cancelEdit(task.id));

        actions.appendChild(editBtn);
        actions.appendChild(delBtn);
        actions.appendChild(saveBtn);
        actions.appendChild(cancelBtn);

        li.appendChild(checkbox);
        li.appendChild(text);
        li.appendChild(editInput);
        li.appendChild(time);
        li.appendChild(actions);

        container.appendChild(li);
    });
}

function updateEmptyStates(pending, completed) {
    const emptyPending = document.getElementById('emptyPending');
    if (pending === 0) {
        if (!emptyPending) {
            const empty = document.createElement('li');
            empty.className = 'empty-state';
            empty.id = 'emptyPending';
            empty.innerHTML = `
                <i class="fas fa-inbox"></i>
                <p>No pending tasks</p>
                <span>Add a task to get started!</span>
            `;
            pendingTasks.appendChild(empty);
        }
    } else if (emptyPending) emptyPending.remove();

    const emptyCompleted = document.getElementById('emptyCompleted');
    if (completed === 0) {
        if (!emptyCompleted) {
            const empty = document.createElement('li');
            empty.className = 'empty-state';
            empty.id = 'emptyCompleted';
            empty.innerHTML = `
                <i class="fas fa-check-double"></i>
                <p>No completed tasks</p>
                <span>Complete a task to see it here!</span>
            `;
            completedTasks.appendChild(empty);
        }
    } else if (emptyCompleted) emptyCompleted.remove();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
        return 'Today ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
           date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function saveTasks() {
    try {
        localStorage.setItem('todoTasks', JSON.stringify(tasks));
    } catch (e) {
        console.warn('Could not save tasks');
    }
}

function loadTasks() {
    try {
        const saved = localStorage.getItem('todoTasks');
        if (saved) tasks = JSON.parse(saved);
    } catch (e) {
        tasks = [];
    }
}

addBtn.addEventListener('click', addTask);

taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addTask();
    }
});

document.addEventListener('click', (e) => {
    if (editingId !== null) {
        const item = document.querySelector(`[data-id="${editingId}"]`);
        if (item && !item.contains(e.target)) {
            cancelEdit(editingId);
        }
    }
});

loadTasks();
renderTasks();