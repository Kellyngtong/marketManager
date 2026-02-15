import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express, { Express } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { discoverAndRunMigrations } from './db/migrate';
import { initializeDatabase } from './db/index';
import swaggerSpec from './config/swagger.config';

// Import routes
import authRoutes from './routes/auth.routes';
import articulosRoutes from './routes/articulos.routes';
import carritoRoutes from './routes/carrito.routes';
import pagosRoutes from './routes/pagos.routes';

const app: Express = express();

// Verificar si se debe ejecutar migraciones
const shouldMigrate = process.argv.includes('--revert-db');

// Función para ejecutar migraciones y luego iniciar el servidor
const initializeApp = async (): Promise<void> => {
  if (shouldMigrate) {
    console.log('🔄 Relanzando migraciones de base de datos...');
    try {
      await discoverAndRunMigrations();
    } catch (error) {
      console.error('❌ Error al ejecutar migraciones:', error);
      process.exit(1);
    }
  }

  startServer();
};

const startServer = (): void => {
  const defaultOrigins = [
    'http://localhost:8100',
    'http://localhost:8101',
    'http://localhost:4200',
    'http://127.0.0.1:8100',
    'http://127.0.0.1:8101',
    'capacitor://localhost',
  ];

  const allowedOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const origins = allowedOrigins.length ? allowedOrigins : defaultOrigins;
  const allowAll = origins.includes('*');

  const corsOptions: cors.CorsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowAll || origins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Blocked by CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'x-access-token',
    ],
    optionsSuccessStatus: 204,
  };

  app.use(cors(corsOptions));

  // Middleware para confiar en ngrok headers
  app.use((req, res, next) => {
    const host = req.get('host') || '';
    // Permitir ngrok, localhost y desarrollo
    if (host.includes('ngrok') || host.includes('localhost') || host.includes('127.0.0.1')) {
      return next();
    }
    // En desarrollo, confiar en todos los hosts
    if (process.env.NODE_ENV === 'development') {
      return next();
    }
    next();
  });

  // Webhook de Stripe ANTES de body parsers (debe recibir raw body)
  app.post(
    '/api/pagos/webhook',
    express.raw({ type: 'application/json' }),
    (req, res, next) => {
      // Convertir buffer a string si es necesario
      if (Buffer.isBuffer(req.body)) {
        (req as any).rawBody = req.body.toString('utf8');
      } else {
        (req as any).rawBody = req.body;
      }
      next();
    }
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Inicializar base de datos
  initializeDatabase()
    .then(() => {
      // Swagger documentation
      app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

      // Routes
      authRoutes(app);
      articulosRoutes(app);
      carritoRoutes(app);
      pagosRoutes(app);

      // Health check
      app.get('/api/health', (req, res) => {
        res.json({ status: 'OK', timestamp: new Date().toISOString() });
      });

      // Error handling middleware
      app.use(
        (
          err: Error,
          req: express.Request,
          res: express.Response,
          next: express.NextFunction
        ) => {
          console.error('Error:', err.message);
          res.status(500).json({
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined,
          });
        }
      );

      const PORT = process.env.PORT || 4800;
      app.listen(PORT, () => {
        console.log(`✅ Server is running on port ${PORT}.`);
        console.log(`📚 Documentación disponible en http://localhost:${PORT}/api-docs`);
      });
    })
    .catch((error) => {
      console.error('❌ Error al inicializar base de datos:', error);
      process.exit(1);
    });
};

// Iniciar aplicación
initializeApp().catch((error) => {
  console.error('❌ Error al inicializar aplicación:', error);
  process.exit(1);
});

export default app;
