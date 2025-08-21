// src/models/column.model.ts
import { Schema, model, Document } from 'mongoose';
import { ITask } from './task.model';

export interface IColumn extends Document {
    name: string;
    boardId: Schema.Types.ObjectId;
    tasks: Schema.Types.ObjectId[] | ITask[];
}

const ColumnSchema = new Schema<IColumn>({
    name: { type: String, required: true },
    boardId: { type: Schema.Types.ObjectId, ref: 'KanbanBoard', required: true },
    tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }]
});

export const Column = model<IColumn>('Column', ColumnSchema);