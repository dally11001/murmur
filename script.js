// === Элементы DOM ===
const form       = document.getElementById('task-form');
const input      = document.getElementById('task-input');
const list       = document.getElementById('task-list');
const emptyMsg   = document.getElementById('empty-message');
const counter    = document.getElementById('counter');
const clearDone  = document.getElementById('clear-done');
const filterBtns = document.querySelectorAll('.filters__btn');

// === Состояние ===
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// === Сохранение в localStorage ===
function save() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// === Отрисовка списка ===
function render() {
    list.innerHTML = '';

    const filtered = tasks.filter(task => {
        if (currentFilter === 'active') return !task.done;
        if (currentFilter === 'done')   return task.done;
        return true;
    });

    filtered.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item' + (task.done ? ' task-item--done' : '');
        li.dataset.id = task.id;

        li.innerHTML = `
            <input type="checkbox" class="task-item__checkbox" ${task.done ? 'checked' : ''}>
            <span class="task-item__text">${escapeHtml(task.title)}</span>
            <button class="task-item__delete" title="Удалить">✕</button>
        `;

        list.appendChild(li);
    });

    // Пустое состояние
    emptyMsg.classList.toggle('empty-message--visible', filtered.length === 0);

    // Счётчик
    const doneCount = tasks.filter(t => t.done).length;
    counter.textContent = `Всего: ${tasks.length} · Выполнено: ${doneCount}`;
}

// === Защита от XSS ===
function escapeHtml(str) {
    return str.replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[ch]);
}

// === Добавление задачи ===
form.addEventListener('submit', e => {
    e.preventDefault();
    const title = input.value.trim();
    if (!title) return;

    tasks.push({
        id: Date.now().toString(),
        title,
        done: false
    });
    input.value = '';
    save();
    render();
});

// === Действия со списком (делегирование событий) ===
list.addEventListener('click', e => {
    const li = e.target.closest('.task-item');
    if (!li) return;
    const id = li.dataset.id;

    if (e.target.classList.contains('task-item__checkbox')) {
        const task = tasks.find(t => t.id === id);
        if (task) task.done = e.target.checked;
        save();
        render();
    }

    if (e.target.classList.contains('task-item__delete')) {
        tasks = tasks.filter(t => t.id !== id);
        save();
        render();
    }
});

// === Фильтры ===
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('filters__btn--active'));
        btn.classList.add('filters__btn--active');
        currentFilter = btn.dataset.filter;
        render();
    });
});

// === Удалить выполненные ===
clearDone.addEventListener('click', () => {
    tasks = tasks.filter(t => !t.done);
    save();
    render();
});

// === Старт ===
render();
