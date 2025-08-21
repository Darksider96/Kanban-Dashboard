// src/controllers/kanban.controller.ts
import { Request, Response } from 'express';
import { Startup } from '../models/startup.model';
import { KanbanBoard } from '../models/kanbanboard.model';
import { Column, IColumn } from '../models/column.model'; // Adicione IColumn aqui
import { Task } from '../models/task.model';

// Funções para Startups
export const createStartup = async (req: Request, res: Response) => {
    try {
        const newStartup = new Startup(req.body);
        await newStartup.save();
        // Cria um quadro Kanban para a nova startup
        const newBoard = new KanbanBoard({ startupId: newStartup._id });
        await newBoard.save();
        res.status(201).json(newStartup);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getStartups = async (req: Request, res: Response) => {
    try {
        const startups = await Startup.find();
        res.status(200).json(startups);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Funções para Boards
export const getBoardByStartupId = async (req: Request, res: Response) => {
    try {
        const board = await KanbanBoard.findOne({ startupId: req.params.startupId }).populate({
            path: 'columns',
            populate: {
                path: 'tasks'
            }
        });
        if (!board) {
            return res.status(404).json({ message: 'Quadro não encontrado para esta startup.' });
        }
        res.status(200).json(board);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Funções para Colunas
export const createColumn = async (req: Request, res: Response) => {
    try {
        const { name, boardId } = req.body;
        const newColumn = new Column({ name, boardId });
        await newColumn.save();

        await KanbanBoard.findByIdAndUpdate(boardId, { $push: { columns: newColumn._id } });

        res.status(201).json(newColumn);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateColumn = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const updatedColumn = await Column.findByIdAndUpdate(id, { name }, { new: true });
        if (!updatedColumn) {
            return res.status(404).json({ message: 'Coluna não encontrada.' });
        }
        res.status(200).json(updatedColumn);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteColumn = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedColumn = await Column.findByIdAndDelete(id);
        if (!deletedColumn) {
            return res.status(404).json({ message: 'Coluna não encontrada.' });
        }

        await Task.deleteMany({ columnId: id });
        await KanbanBoard.findByIdAndUpdate(deletedColumn.boardId, { $pull: { columns: deletedColumn._id } });

        res.status(200).json({ message: 'Coluna e tarefas associadas deletadas com sucesso.' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Funções para Tarefas
export const createTask = async (req: Request, res: Response) => {
    try {
        const { columnId, title, type, priority, startDate, dueDate, responsible, observations, link } = req.body;
        const newTask = new Task({
            title,
            type,
            priority,
            startDate,
            dueDate,
            responsible,
            observations,
            link,
            columnId,
            status: 'Em Andamento'
        });
        await newTask.save();
        await Column.findByIdAndUpdate(columnId, { $push: { tasks: newTask._id } });
        res.status(201).json(newTask);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedTask = await Task.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedTask) {
            return res.status(404).json({ message: 'Tarefa não encontrada.' });
        }
        res.status(200).json(updatedTask);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedTask = await Task.findByIdAndDelete(id);
        if (!deletedTask) {
            return res.status(404).json({ message: 'Tarefa não encontrada.' });
        }

        await Column.findByIdAndUpdate(deletedTask.columnId, { $pull: { tasks: deletedTask._id } });
        res.status(200).json({ message: 'Tarefa deletada com sucesso.' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const moveTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { newColumnId } = req.body;
        
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: 'Tarefa não encontrada.' });
        }

        // Remove a tarefa da coluna antiga
        await Column.findByIdAndUpdate(task.columnId, { $pull: { tasks: task._id } });
        
        // Adiciona a tarefa na nova coluna
        await Column.findByIdAndUpdate(newColumnId, { $push: { tasks: task._id } });
        
        // Atualiza a coluna da tarefa e seu status
        const updatedTask = await Task.findByIdAndUpdate(id, { columnId: newColumnId }, { new: true });

        res.status(200).json(updatedTask);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Funções para Dashboard
export const getTasksByStartupId = async (req: Request, res: Response) => {
    try {
        const { startupId } = req.params;
        // Popula as colunas do quadro para que possamos acessá-las
        const board = await KanbanBoard.findOne({ startupId }).populate('columns');
        if (!board) {
            return res.status(404).json({ message: 'Quadro não encontrado.' });
        }

        // Mapeia os _ids das colunas de forma segura, usando um type assertion para IColumn
        const columnIds = (board.columns as IColumn[]).map(col => col._id);
        const tasks = await Task.find({ columnId: { $in: columnIds } });
        res.status(200).json(tasks);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};