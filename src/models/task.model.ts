// src/models/task.model.ts
import { Schema, model, Document } from 'mongoose';

export interface ITask extends Document {
    title: string;
    description?: string;
    type: string;
    priority: string;
    startDate: Date;
    dueDate: Date;
    responsible: string;
    observations: string;
    link?: string;
    status: string;
    columnId: Schema.Types.ObjectId;
}

const TaskSchema = new Schema<ITask>({
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, required: true },
    priority: { type: String, required: true },
    startDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    responsible: { type: String, required: true },
    observations: { type: String },
    link: { type: String },
    status: { type: String, required: true, default: 'Em Andamento' },
    columnId: { type: Schema.Types.ObjectId, ref: 'Column', required: true }
}, { timestamps: true });

export const Task = model<ITask>('Task', TaskSchema);