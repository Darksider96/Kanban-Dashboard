// src/models/kanbanboard.model.ts
import { Schema, model, Document } from 'mongoose';
import { IColumn } from './column.model';
import { IStartup } from './startup.model';

export interface IKanbanBoard extends Document {
    startupId: Schema.Types.ObjectId | IStartup;
    columns: Schema.Types.ObjectId[] | IColumn[];
}

const KanbanBoardSchema = new Schema<IKanbanBoard>({
    startupId: { type: Schema.Types.ObjectId, ref: 'Startup', required: true, unique: true },
    columns: [{ type: Schema.Types.ObjectId, ref: 'Column' }]
});

export const KanbanBoard = model<IKanbanBoard>('KanbanBoard', KanbanBoardSchema);