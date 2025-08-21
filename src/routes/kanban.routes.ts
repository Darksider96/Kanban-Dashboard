// src/routes/kanban.routes.ts
import { Router } from 'express';
import * as kanbanController from '../controllers/kanban.controller';

const router = Router();

// Rota de "boas-vindas" para a URL base /api/kanban
router.get('/', (req, res) => {
    res.status(200).send('Bem-vindo à API Kanban!');
});

// Rotas para Startups
router.post('/startups', kanbanController.createStartup);
router.get('/startups', kanbanController.getStartups);

// Rotas para o Kanban Board e Dashboard
router.get('/boards/:startupId', kanbanController.getBoardByStartupId);
router.post('/columns', kanbanController.createColumn);
router.put('/columns/:id', kanbanController.updateColumn);
router.delete('/columns/:id', kanbanController.deleteColumn);

router.post('/tasks', kanbanController.createTask);
router.put('/tasks/:id', kanbanController.updateTask);
router.delete('/tasks/:id', kanbanController.deleteTask);
router.put('/tasks/:id/move', kanbanController.moveTask);

// Rota para o Dashboard
router.get('/dashboard/:startupId/tasks', kanbanController.getTasksByStartupId);

export default router;