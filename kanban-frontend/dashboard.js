// dashboard.js
const API_BASE_URL = 'http://localhost:3000/api/kanban';
const urlParams = new URLSearchParams(window.location.search);
const startupId = urlParams.get('startupId');

const tasksByPriorityChartCanvas = document.getElementById('tasksByPriorityChart');
const tasksByTypeChartCanvas = document.getElementById('tasksByTypeChart');
const tasksByStatusChartCanvas = document.getElementById('tasksByStatusChart');

async function fetchAllTasksForStartup(startupId) {
    if (!startupId) {
        console.error('ID da startup não fornecido.');
        return [];
    }
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/${startupId}/tasks`);
        if (!response.ok) throw new Error('Não foi possível buscar as tarefas.');
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar todas as tarefas:', error);
        return [];
    }
}

function renderTasksByPriorityChart(tasks) {
    const priorityCounts = {};
    tasks.forEach(task => {
        priorityCounts[task.priority] = (priorityCounts[task.priority] || 0) + 1;
    });

    new Chart(tasksByPriorityChartCanvas, {
        type: 'pie',
        data: {
            labels: Object.keys(priorityCounts),
            datasets: [{
                data: Object.values(priorityCounts),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(54, 162, 235, 0.7)'
                ],
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: false }
            }
        }
    });
}

function renderTasksByTypeChart(tasks) {
    const typeCounts = {};
    tasks.forEach(task => {
        typeCounts[task.type] = (typeCounts[task.type] || 0) + 1;
    });

    new Chart(tasksByTypeChartCanvas, {
        type: 'bar',
        data: {
            labels: Object.keys(typeCounts),
            datasets: [{
                label: 'Número de Tarefas',
                data: Object.values(typeCounts),
                backgroundColor: 'rgba(75, 192, 192, 0.7)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function renderTasksByStatusChart(tasks) {
    const statusCounts = {};
    tasks.forEach(task => {
        statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
    });
    
    new Chart(tasksByStatusChartCanvas, {
        type: 'doughnut',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)'
                ],
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: false }
            }
        }
    });
}

async function initDashboard() {
    const tasks = await fetchAllTasksForStartup(startupId);
    if (tasks.length > 0) {
        renderTasksByPriorityChart(tasks);
        renderTasksByTypeChart(tasks);
        renderTasksByStatusChart(tasks);
    } else {
        alert('Nenhuma tarefa encontrada para esta startup.');
    }
}

initDashboard();