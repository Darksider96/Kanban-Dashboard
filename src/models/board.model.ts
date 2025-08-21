// src/models/board.model.ts
import { Schema, model, Document } from 'mongoose';

export interface IBoard extends Document {
    name: string;
}

const BoardSchema = new Schema<IBoard>({
    name: { type: String, required: true }
});

export default model<IBoard>('Board', BoardSchema);