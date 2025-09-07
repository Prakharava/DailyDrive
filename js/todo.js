const STORAGE_KEY = 'dd:todos:v1';
const FILTER_KEY = 'dd:todos:filter';

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch { return []; }
}

function saveTodos(items) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
}

function render(listEl, items, filter = 'all') {
  listEl.innerHTML = '';
  const frag = document.createDocumentFragment();
  for (const item of items) {
    if (filter === 'active' && item.done) continue;
    if (filter === 'completed' && !item.done) continue;
    const li = document.createElement('li');
    li.className = 'todo-item' + (item.done ? ' completed' : '');
    li.dataset.id = item.id;

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'todo-toggle';
    cb.checked = !!item.done;
    cb.setAttribute('aria-label', `Mark ${item.text} as ${item.done ? 'incomplete' : 'complete'}`);

    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = item.text;

    const editBtn = document.createElement('button');
    editBtn.className = 'todo-edit';
    editBtn.textContent = 'Edit';
    editBtn.setAttribute('aria-label', `Edit ${item.text}`);

    const delBtn = document.createElement('button');
    delBtn.className = 'todo-del';
    delBtn.textContent = 'Delete';
    delBtn.setAttribute('aria-label', `Delete ${item.text}`);

    li.append(cb, span, editBtn, delBtn);
    frag.appendChild(li);
  }
  listEl.appendChild(frag);
}

export function initTodo() {
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const list = document.getElementById('todo-list');
  if (!form || !input || !list) return;

  // Inject controls (filters + clear) if not present
  let controls = form.nextElementSibling;
  if (!controls || !controls.classList?.contains('todo-controls')) {
    controls = document.createElement('div');
    controls.className = 'todo-controls';
    controls.innerHTML = `
      <div class="todo-filters" role="group" aria-label="Filters">
        <button data-filter="all" class="is-active" type="button">All</button>
        <button data-filter="active" type="button">Active</button>
        <button data-filter="completed" type="button">Completed</button>
      </div>
      <button class="todo-clear" type="button">Clear Completed</button>
    `;
    form.insertAdjacentElement('afterend', controls);
  }

  const filtersEl = controls.querySelector('.todo-filters');
  const clearBtn = controls.querySelector('.todo-clear');

  let items = loadTodos();
  let filter = localStorage.getItem(FILTER_KEY) || 'all';
  // Update active filter button
  [...filtersEl.querySelectorAll('button')].forEach(b => b.classList.toggle('is-active', b.dataset.filter === filter));
  render(list, items, filter);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    const item = { id: uid(), text, done: false, createdAt: Date.now() };
    items.push(item);
    saveTodos(items);
    render(list, items, filter);
    input.value = '';
    input.focus();
  });

  list.addEventListener('click', (e) => {
    const target = e.target;
    const li = target.closest('li.todo-item');
    if (!li) return;
    const id = li.dataset.id;
    const idx = items.findIndex(t => t.id === id);
    if (idx === -1) return;

    if (target.classList.contains('todo-toggle')) {
      items[idx].done = !items[idx].done;
      saveTodos(items);
      render(list, items, filter);
    } else if (target.classList.contains('todo-del')) {
      items.splice(idx, 1);
      saveTodos(items);
      render(list, items, filter);
    } else if (target.classList.contains('todo-edit')) {
      const current = items[idx].text;
      const textSpan = li.querySelector('.todo-text');
      const editInput = document.createElement('input');
      editInput.type = 'text';
      editInput.className = 'todo-edit-input';
      editInput.value = current;
      textSpan.replaceWith(editInput);
      editInput.focus();
      editInput.select();

      const commit = () => {
        const next = editInput.value.trim();
        const text = next || current;
        items[idx].text = text;
        saveTodos(items);
        render(list, items, filter);
      };
      const cancel = () => { render(list, items, filter); };

      editInput.addEventListener('keydown', (ke) => {
        if (ke.key === 'Enter') { ke.preventDefault(); commit(); }
        else if (ke.key === 'Escape') { ke.preventDefault(); cancel(); }
      });
      editInput.addEventListener('blur', commit, { once: true });
    }
  });

  list.addEventListener('change', (e) => {
    const target = e.target;
    if (!target.classList.contains('todo-toggle')) return;
    const li = target.closest('li.todo-item');
    if (!li) return;
    const id = li.dataset.id;
    const idx = items.findIndex(t => t.id === id);
    if (idx === -1) return;
    items[idx].done = !!target.checked;
    saveTodos(items);
    render(list, items, filter);
  });

  filtersEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-filter]');
    if (!btn) return;
    filter = btn.dataset.filter;
    localStorage.setItem(FILTER_KEY, filter);
    [...filtersEl.querySelectorAll('button')].forEach(b => b.classList.toggle('is-active', b === btn));
    render(list, items, filter);
  });

  clearBtn.addEventListener('click', () => {
    const next = items.filter(t => !t.done);
    if (next.length !== items.length) {
      items = next;
      saveTodos(items);
      render(list, items, filter);
    }
  });
}
