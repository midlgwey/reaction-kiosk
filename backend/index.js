import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
//importando rutas
import adminRoutes from './routes/adminRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import reactionRoutes from './routes/reactionRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import suggestionsRoutes from './routes/suggestionsRoutes.js';

import { errorHandlerMiddleware } from './middlewares/errorHandler.js';

const app = express();


app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173", 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"] 
}));

app.use(cookieParser());

// Middleware para JSON
app.use(express.json());

//Ruta para que no se desactive la alarma para cron-job
app.get('/', (req, res) => {
  res.status(200).send('Servidor Kiosco Activo');
});

app.use('/admin', adminRoutes);

app.use('/dashboard', dashboardRoutes);

app.use('/stats', statsRoutes);

app.use('/reactions', reactionRoutes );

app.use('/suggestions', suggestionsRoutes)

app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});