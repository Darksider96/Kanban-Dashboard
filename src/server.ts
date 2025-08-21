// src/server.ts
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import kanbanRoutes from './routes/kanban.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexão com o banco de dados
mongoose.connect(process.env.MONGO_URI as string)
    .then(() => console.log('MongoDB conectado com sucesso!'))
    .catch(err => console.error('Erro de conexão:', err));

// Rotas
app.use('/api/kanban', kanbanRoutes);

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});