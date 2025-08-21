// src/services/kanban.service.ts
import { ITask, Task } from '../models/task.model';
import { IColumn, Column } from '../models/column.model';
import { IKanbanBoard, KanbanBoard } from '../models/kanbanboard.model';
import  IBoard from '../models/board.model'; // Adicione a importação do modelo Board

// Funções de CRUD para os Quadros (Boards)
export const createBoard = async (name: string): Promise<IKanbanBoard> => {
    const newBoard = new KanbanBoard({ name });
    return newBoard.save();
};

export const getBoards = async (): Promise<IKanbanBoard[]> => {
    return KanbanBoard.find().populate('columns');
};

export const updateBoard = async (id: string, name: string): Promise<IKanbanBoard | null> => {
    return KanbanBoard.findByIdAndUpdate(id, { name }, { new: true });
};

export const deleteBoard = async (id: string): Promise<IKanbanBoard | null> => {
    // Apaga o quadro e todas as colunas e tarefas associadas
    const board = await KanbanBoard.findById(id);
    if (!board) return null;
    
    // Deleta as colunas do quadro
    await Column.deleteMany({ boardId: id });
    
    // Deleta o quadro
    return KanbanBoard.findByIdAndDelete(id);
};

// Funções de CRUD para as Colunas
export const createColumn = async (name: string, boardId: string): Promise<IColumn> => {
    const newColumn = new Column({ name, boardId });
    await newColumn.save();
    
    // Adicionar a coluna ao quadro Kanban
    await KanbanBoard.findByIdAndUpdate(boardId, { $push: { columns: newColumn._id } });

    return newColumn;
};

export const updateColumn = async (id: string, name: string): Promise<IColumn | null> => {
    return Column.findByIdAndUpdate(id, { name }, { new: true });
};

export const deleteColumn = async (id: string): Promise<IColumn | null> => {
    // Apaga a coluna e todas as tarefas associadas
    await Task.deleteMany({ columnId: id });
    const deletedColumn = await Column.findByIdAndDelete(id);
    
    // Remover a referência da coluna no quadro
    if (deletedColumn) {
        await KanbanBoard.findByIdAndUpdate(deletedColumn.boardId, { $pull: { columns: deletedColumn._id } });
    }

    return deletedColumn;
};

export const getColumnsByBoard = async (boardId: string): Promise<IColumn[]> => {
    return Column.find({ boardId });
};

// Funções de CRUD para as Tarefas
export const createTask = async (
    title: string,
    tipo: string,
    prioridade: string,
    dataInicio: Date,
    prazo: Date,
    status: string,
    responsavel: string,
    observacoes: string,
    link: string,
    columnId: string
): Promise<ITask> => {
    const newTask = new Task({
        title,
        tipo,
        prioridade,
        dataInicio,
        prazo,
        status,
        responsavel,
        observacoes,
        link,
        columnId,
    });
    return newTask.save();
};

export const updateTask = async (id: string, updates: Partial<ITask>): Promise<ITask | null> => {
    return Task.findByIdAndUpdate(id, updates, { new: true });
};

export const deleteTask = async (id: string): Promise<ITask | null> => {
    return Task.findByIdAndDelete(id);
};

export const moveTask = async (taskId: string, newColumnId: string): Promise<ITask | null> => {
    const targetColumn = await Column.findById(newColumnId);
    if (!targetColumn) {
        throw new Error('Coluna de destino não encontrada.');
    }
    return Task.findByIdAndUpdate(taskId, { columnId: newColumnId }, { new: true });
};

export const getTasksByColumn = async (columnId: string): Promise<ITask[]> => {
    return Task.find({ columnId });
};