import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import adminRoutes from './routes/adminRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import reactionRoutes from './routes/reactionRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

import { errorHandlerMiddleware } from './middlewares/errorHandler.js';

const app = express();

app.use(cookieParser());

// Middleware para JSON
app.use(express.json());

app.use(cors({
  origin: true,
  credentials: true
}));

// Rutas para administradores
app.use('/admin', adminRoutes);

app.use('/dashboard', dashboardRoutes);

app.use('/stats', statsRoutes);

app.use('/reactions', reactionRoutes );

app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});