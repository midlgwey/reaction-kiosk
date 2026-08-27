import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';       
import { dirname, join } from 'path';

//importando rutas
import adminRoutes from './routes/adminRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import reactionRoutes from './routes/reactionRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import suggestionsRoutes from './routes/suggestionsRoutes.js';
import waiterStatsRoutes from './routes/waiterStatsRoutes.js';
import waiterRoutes from './routes/waiterRoutes.js';
import alertsRoutes from './routes/alertsRoutes.js';
import declineRoutes from './routes/declineRoutes.js';
import realTablesRoutes from './routes/realTablesRoutes.js';
import employeesRoutes from './routes/employeesRoutes.js'; 
import attendanceRoutes from './routes/attendanceRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js'; 

import { errorHandlerMiddleware } from './middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);  
const __dirname = dirname(__filename);   

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173", 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"] 
}));

app.use(cookieParser());

// Middleware para JSON
app.use(express.json());

//Ruta para que no se desactive la alarma para cron-job
app.get('/', (req, res) => {
  res.status(200).send('Servidor Kiosco Activo');
});

app.use('/uploads', express.static(join(__dirname, 'uploads')));

app.use('/admin', adminRoutes);

app.use('/dashboard', dashboardRoutes);

app.use('/stats', statsRoutes);

app.use('/reactions', reactionRoutes );

app.use('/suggestions', suggestionsRoutes)

app.use('/waiter-stats', waiterStatsRoutes)

app.use('/waiter', waiterRoutes)

app.use('/alerts', alertsRoutes) 

app.use('/declines', declineRoutes)

app.use('/real-tables', realTablesRoutes);

app.use('/employees', employeesRoutes); 

app.use('/attendance', attendanceRoutes);

app.use('/schedules', scheduleRoutes);


app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});