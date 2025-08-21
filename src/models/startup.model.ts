// src/models/startup.model.ts
import { Schema, model, Document } from 'mongoose';

export interface IStartup extends Document {
    name: string;
    description: string;
}

const StartupSchema = new Schema<IStartup>({
    name: { type: String, required: true, unique: true }, // Aqui está a restrição de unicidade
    description: { type: String }
});

export const Startup = model<IStartup>('Startup', StartupSchema);