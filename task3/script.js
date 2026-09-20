




let tasks = [];


let currentFilter = 'all';


let nextId = 1;


const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const warningMsg = document.getElementById('warningMsg');
const counterEl = document.getElementById('counter');
const todoList = document.getElementById('todoList');
const filterBtns = document.querySelectorAll('.filter-btn');




function updateCounter() {
  const total = tasks.length;
  const completedCount = tasks.filter(task => task.completed).length;
  const remainingCount = total - completedCount;
  counterEl.textContent = `Осталось: ${remainingCount}, Выполнено: ${completedCount}`;
}


function showWarning(msg) {
  warningMsg.textContent = msg;

  if (warningMsg._timer) clearTimeout(warningMsg._timer);
  warningMsg._timer = setTimeout(() => {
    warningMsg.textContent = '';
  }, 2500);
}


function clearInput() {
  taskInput.value = '';
  warningMsg.textContent = '';
  if (warningMsg._timer) clearTimeout(warningMsg._timer);
}


function getFilteredTasks() {
  if (currentFilter === 'active') {
    return tasks.filter(task => !task.completed);
  }
  if (currentFilter === 'completed') {
    return tasks.filter(task => task.completed);
  }

  return tasks;
}


function toggleTaskCompleted(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    render();
  }
}


function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  render();
}


function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = 'todo-item';
  if (task.completed) {
    li.classList.add('completed');
  }

  li.dataset.id = task.id;


  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;

  checkbox.addEventListener('change', (e) => {
    e.stopPropagation();
    toggleTaskCompleted(task.id);
  });


  const span = document.createElement('span');
  span.className = 'todo-text';
  span.textContent = task.text;


  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = 'Удалить';
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteTask(task.id);
  });

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(deleteBtn);
  return li;
}


function render() {
  todoList.innerHTML = '';
  const filtered = getFilteredTasks();
  const elements = filtered.map(task => createTaskElement(task));
  elements.forEach(el => todoList.appendChild(el));
  updateCounter();
}


function addTask() {
  const text = taskInput.value.trim();

  if (text === '') {
    showWarning('Введите текст задачи');
    return;
  }

  const newTask = {
    id: nextId++,
    text: text,
    completed: false,
  };

  tasks.push(newTask);
  clearInput();
  render();
}

function setFilter(filter) {
  currentFilter = filter;


  filterBtns.forEach(btn => {
    const btnFilter = btn.dataset.filter;
    if (btnFilter === filter) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  render();
}


function init() {
  addBtn.addEventListener('click', addTask);
  taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTask();
    }
  });


  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      if (filter) {
        setFilter(filter);
      }
    });
  });


  render();
}

init()
