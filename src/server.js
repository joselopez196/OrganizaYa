import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import syncRoutes from './routes/sync.routes.js';
import tasksRoutes from './routes/tasks.routes.js';
import projectsRoutes from './routes/projects.routes.js';
import backupRoutes from './routes/backup.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Configuración de CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : ['https://joselopez196.github.io', 'http://localhost:3000', 'http://localhost:8080', 'http://127.0.0.1:5500'];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir solicitudes sin origen (como Postman o curl) o si está en la lista permitida
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.github.io')) {
      callback(null, true);
    } else {
      callback(null, true); // Permisivo en desarrollo para facilitar pruebas
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey']
}));

// Middlewares para procesar JSON (hasta 50mb para sincronización y backups)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging simple
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  }
  next();
});

// Endpoint de Salud
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'OrganizaYa API',
    version: '1.0.0',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/backup', backupRoutes);

// Manejador de rutas no encontradas 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    endpoint: `${req.method} ${req.url}`
  });
});

// Manejador de errores global
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 OrganizaYa Backend API activo en el puerto ${PORT}`);
  console.log(`🔗 Healthcheck: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Orígenes permitidos: ${allowedOrigins.join(', ')}`);
  console.log(`====================================================`);
});

export default app;
