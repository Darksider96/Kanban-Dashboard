// script.js
const API_BASE_URL = 'http://localhost:3000/api/kanban';
const kanbanBoard = document.querySelector('.kanban-board');
const addColumnBtn = document.getElementById('addColumnBtn');
const startupSelect = document.getElementById('startupSelect');
const addStartupBtn = document.getElementById('addStartupBtn');
const loadBoardBtn = document.getElementById('loadBoardBtn');
const goToDashboardBtn = document.getElementById('goToDashboardBtn');
const taskModal = document.getElementById('taskModal');
const closeButton = document.querySelector('.close-button');
const taskForm = document.getElementById('taskForm');
let currentBoardId = null;

// Funções de Interação com a API
async function fetchStartups() {
    try {
        const response = await fetch(`${API_BASE_URL}/startups`);
        if (!response.ok) throw new Error('Não foi possível buscar as startups.');
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar startups:', error);
        return [];
    }
}

async function createNewStartup() {
    const name = prompt('Digite o nome da nova startup:');
    if (!name) return;
    try {
        const response = await fetch(`${API_BASE_URL}/startups`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        if (!response.ok) throw new Error('Falha ao criar a startup.');
        await renderStartupSelect();
        alert('Startup criada com sucesso!');
    } catch (error) {
        console.error('Erro ao criar startup:', error);
        alert('Erro ao criar startup.');
    }
}

async function fetchBoard() {
    try {
        const response = await fetch(`${API_BASE_URL}/boards`);
        if (!response.ok) {
            // Se a resposta não for OK, lance um erro com a mensagem do servidor
            const errorData = await response.json();
            throw new Error(errorData.message || 'Não foi possível buscar os quadros.');
        }
        const boardData = await response.json();
        // Assumimos que a API retorna apenas um quadro por padrão, ou você seleciona o primeiro
        return boardData[0] || null;
    } catch (error) {
        console.error('Erro ao buscar o quadro:', error.message);
        return null;
    }
}
async function createNewColumn(name, boardId) {
    try {
        const response = await fetch(`${API_BASE_URL}/columns`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, boardId }),
        });
        if (!response.ok) throw new Error('Falha ao criar coluna.');
        return await response.json();
    } catch (error) {
        console.error('Erro ao criar coluna:', error);
    }
}

async function moveTask(taskId, newColumnId) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/move`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newColumnId }),
        });
        if (!response.ok) throw new Error('Falha ao mover a tarefa.');
        return await response.json();
    } catch (error) {
        console.error('Erro ao mover a tarefa:', error);
    }
}

async function createNewTask(taskData) {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData),
        });
        if (!response.ok) throw new Error('Falha ao criar a tarefa.');
        return await response.json();
    } catch (error) {
        console.error('Erro ao criar a tarefa:', error);
        return null;
    }
}

// Funções de Renderização
async function renderStartupSelect() {
    const startups = await fetchStartups();
    startupSelect.innerHTML = '';
    if (startups.length === 0) {
        startupSelect.disabled = true;
        loadBoardBtn.disabled = true;
        addStartupBtn.style.display = 'block';
        return;
    }
    
    startupSelect.disabled = false;
    loadBoardBtn.disabled = false;

    startups.forEach(startup => {
        const option = document.createElement('option');
        option.value = startup._id;
        option.textContent = startup.name;
        startupSelect.appendChild(option);
    });
}

async function renderBoard(startupId) {
    kanbanBoard.innerHTML = ''; // Limpa o quadro
    const board = await fetchBoard(startupId);

    if (!board) {
        // Se o quadro não for encontrado, exibe uma mensagem para o usuário
        kanbanBoard.innerHTML = '<p>Nenhum quadro encontrado. Por favor, adicione colunas para começar.</p>';
        currentBoardId = null; // Zera o ID do quadro atual
        return;
    }

    currentBoardId = board._id;

    for (const column of board.columns) {
        const columnElement = createColumnElement(column);
        kanbanBoard.appendChild(columnElement);

        const tasksContainer = columnElement.querySelector('.kanban-tasks');
        column.tasks.forEach(task => {
            tasksContainer.appendChild(createTaskElement(task));
        });
    }
}

function createColumnElement(column) {
    const columnDiv = document.createElement('div');
    columnDiv.className = 'kanban-column';
    columnDiv.setAttribute('data-column-id', column._id);

    columnDiv.innerHTML = `
        <div class="column-header">
            <h2>${column.name}</h2>
            <button class="delete-column-btn" data-column-id="${column._id}">X</button>
        </div>
        <div class="kanban-tasks" ondrop="drop(event, this)" ondragover="allowDrop(event)"></div>
        <button class="add-task-btn" data-column-id="${column._id}">Adicionar Tarefa</button>
    `;
    return columnDiv;
}

function createTaskElement(task) {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'kanban-card';
    taskDiv.draggable = true;
    taskDiv.id = `task-${task._id}`;
    taskDiv.setAttribute('ondragstart', 'drag(event)');

    taskDiv.innerHTML = `
        <strong>${task.title}</strong>
        <p><strong>Tipo:</strong> ${task.type}</p>
        <p><strong>Prioridade:</strong> ${task.priority}</p>
        <p><strong>Responsável:</strong> ${task.responsible}</p>
        <p><strong>Prazo:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
        <button class="delete-task-btn" data-task-id="${task._id}">Deletar</button>
    `;
    return taskDiv;
}

// Lógica de Drag and Drop
function allowDrop(event) { event.preventDefault(); }
function drag(event) { event.dataTransfer.setData("text/plain", event.target.id); }

async function drop(event, targetElement) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text/plain").replace('task-', '');
    const newColumnId = targetElement.closest('.kanban-column').getAttribute('data-column-id');

    if (newColumnId) {
        await moveTask(taskId, newColumnId);
        await renderBoard(startupSelect.value);
    }
}

// Manipuladores de Eventos
addStartupBtn.addEventListener('click', createNewStartup);

loadBoardBtn.addEventListener('click', () => {
    const selectedStartupId = startupSelect.value;
    if (selectedStartupId) {
        renderBoard(selectedStartupId);
        kanbanBoard.style.display = 'flex';
        addColumnBtn.style.display = 'block';
    } else {
        alert('Por favor, selecione ou crie uma startup.');
    }
});

goToDashboardBtn.addEventListener('click', () => {
    const selectedStartupId = startupSelect.value;
    if (selectedStartupId) {
        window.location.href = `dashboard.html?startupId=${selectedStartupId}`;
    } else {
        alert('Selecione uma startup para ir ao dashboard.');
    }
});

addColumnBtn.addEventListener('click', async () => {
    if (!currentBoardId) {
        alert('Por favor, selecione uma startup e carregue o quadro primeiro.');
        return;
    }
    const name = prompt('Digite o nome da nova coluna:');
    if (name) {
        await createNewColumn(name, currentBoardId);
        await renderBoard(startupSelect.value);
    }
});

kanbanBoard.addEventListener('click', async (event) => {
    if (event.target.classList.contains('add-task-btn')) {
        const columnId = event.target.getAttribute('data-column-id');
        document.getElementById('columnId').value = columnId;
        taskModal.style.display = 'block';
    }
    
    if (event.target.classList.contains('delete-column-btn')) {
        const columnId = event.target.getAttribute('data-column-id');
        if (confirm('Tem certeza que deseja deletar esta coluna e todas as suas tarefas?')) {
            await fetch(`${API_BASE_URL}/columns/${columnId}`, { method: 'DELETE' });
            await renderBoard(startupSelect.value);
        }
    }

    if (event.target.classList.contains('delete-task-btn')) {
        const taskId = event.target.getAttribute('data-task-id');
        if (confirm('Tem certeza que deseja deletar esta tarefa?')) {
            await fetch(`${API_BASE_URL}/tasks/${taskId}`, { method: 'DELETE' });
            await renderBoard(startupSelect.value);
        }
    }
});

closeButton.addEventListener('click', () => {
    taskModal.style.display = 'none';
    taskForm.reset();
});

window.addEventListener('click', (event) => {
    if (event.target === taskModal) {
        taskModal.style.display = 'none';
        taskForm.reset();
    }
});

taskForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const taskData = {
        title: document.getElementById('taskTitle').value,
        type: document.getElementById('taskType').value,
        priority: document.getElementById('taskPriority').value,
        startDate: document.getElementById('taskStartDate').value,
        dueDate: document.getElementById('taskDueDate').value,
        responsible: document.getElementById('taskAssignee').value,
        observations: document.getElementById('taskObservations').value,
        link: document.getElementById('taskLink').value,
        columnId: document.getElementById('columnId').value,
    };
    await createNewTask(taskData);
    taskModal.style.display = 'none';
    taskForm.reset();
    await renderBoard(startupSelect.value);
});

// Iniciar a aplicação
renderStartupSelect();