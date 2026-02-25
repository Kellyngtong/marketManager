import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express, { Express } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { discoverAndRunMigrations } from "./db/migrate";
import { initializeDatabase } from "./db/index";
import swaggerSpec from "./config/swagger.config";

// Import routes
import authRoutes from "./routes/auth.routes";
import articulosRoutes from "./routes/articulos.routes";
import carritoRoutes from "./routes/carrito.routes";
import pagosRoutes from "./routes/pagos.routes";
import adminRoutes from "./routes/admin.routes";
import ventasRoutes from "./routes/ventas.routes";
import uploadRoutes from "./routes/upload.routes";

const app: Express = express();

// Verificar si se debe ejecutar migraciones
const shouldMigrate = process.argv.includes("--revert-db");

// Función para ejecutar migraciones y luego iniciar el servidor
const initializeApp = async (): Promise<void> => {
  if (shouldMigrate) {
    console.log("Relanzando migraciones de base de datos...");
    try {
      await discoverAndRunMigrations();
    } catch (error) {
      console.error("Error al ejecutar migraciones:", error);
      process.exit(1);
    }
  }

  await startServer();
};

const startServer = async (): Promise<void> => {
  const defaultOrigins = [
    "http://localhost:8100",
    "http://localhost:8101",
    "http://localhost:4200",
    "http://127.0.0.1:8100",
    "http://127.0.0.1:8101",
    "capacitor://localhost",
  ];

  const allowedOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const origins = allowedOrigins.length ? allowedOrigins : defaultOrigins;
  const allowAll = origins.includes("*");

  const corsOptions: cors.CorsOptions = {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || allowAll || origins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Blocked by CORS: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "x-access-token",
    ],
    optionsSuccessStatus: 204,
  };

  app.use(cors(corsOptions));

  // Middleware para confiar en ngrok headers
  app.use((req, res, next) => {
    const host = req.get("host") || "";
    // Permitir ngrok, localhost y desarrollo
    if (
      host.includes("ngrok") ||
      host.includes("localhost") ||
      host.includes("127.0.0.1")
    ) {
      return next();
    }
    // En desarrollo, confiar en todos los hosts
    if (process.env.NODE_ENV === "development") {
      return next();
    }
    next();
  });

  // Webhook de Stripe ANTES de body parsers (debe recibir raw body)
  app.post(
    "/api/pagos/webhook",
    express.raw({ type: "application/json" }),
    (req, res, next) => {
      // Convertir buffer a string si es necesario
      if (Buffer.isBuffer(req.body)) {
        (req as any).rawBody = req.body.toString("utf8");
      } else {
        (req as any).rawBody = req.body;
      }
      next();
    },
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Manejador de promesas rechazadas no capturadas
  process.on("unhandledRejection", (reason, promise) => {
    console.error("Promesa rechazada no capturada:", reason);
    console.error("Promise:", promise);
  });

  // Manejador de excepciones no capturadas
  process.on("uncaughtException", (error) => {
    console.error("Excepción no capturada:", error);
    // No salir del proceso, continuar ejecutando
  });

  // Inicializar base de datos
  try {
    await initializeDatabase();

    // Swagger documentation
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Routes
    try {
      authRoutes(app);
      articulosRoutes(app);
      carritoRoutes(app);
      pagosRoutes(app);
      adminRoutes(app);
      ventasRoutes(app);
      uploadRoutes(app);
    } catch (routeError) {
      console.error("Error al registrar rutas:", routeError);
    }

    // Servir imágenes de productos en la raíz `/imagenesProductos` para
    // mantener compatibilidad con el frontend que espera `/imagenesProductos/<name>.jpg`.
    // Proporcionar una ruta explícita que devuelva una imagen por defecto
    // cuando el fichero solicitado no exista, evitando así 404 repetidos.
    const imagesDir = path.resolve(__dirname, "../public/imagenesProductos");
    const defaultImagePath = path.join(imagesDir, "leche.jpg");

    app.get("/imagenesProductos/:file", (req, res) => {
      try {
        const requested = path.join(imagesDir, req.params.file);
        // Evitar path traversal
        if (!requested.startsWith(imagesDir)) {
          return res.sendFile(defaultImagePath);
        }

        res.sendFile(requested, (err) => {
          if (err) {
            // Si hay cualquier error (no existe), enviar imagen por defecto
            return res.sendFile(defaultImagePath);
          }
        });
      } catch (error) {
        return res.sendFile(defaultImagePath);
      }
    });

    // También mantener el static para rendimiento/headers automáticos
    app.use(
      "/imagenesProductos",
      express.static(path.resolve(__dirname, "../public/imagenesProductos")),
    );

    // Mantener la carpeta pública completa disponible en `/public` por compatibilidad
    app.use("/public", express.static(path.resolve(__dirname, "../public")));

    // Health check
    app.get("/api/health", (req, res) => {
      try {
        res.json({ status: "OK", timestamp: new Date().toISOString() });
      } catch (error) {
        console.error("Error en health check:", error);
        res.status(500).json({ message: "Error en health check" });
      }
    });

    // Middleware de envolvimiento para rutas
    app.use(
      (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ) => {
        try {
          next();
        } catch (error) {
          console.error("Error en middleware:", error);
          if (!res.headersSent) {
            res.status(500).json({
              message: "Error interno del servidor",
              error:
                process.env.NODE_ENV === "development"
                  ? error instanceof Error
                    ? error.message
                    : String(error)
                  : undefined,
            });
          }
        }
      },
    );

    // Global error handling middleware (DEBE estar al final)
    app.use(
      (
        err: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ) => {
        try {
          console.error("Error capturado en handler global:");
          console.error("  Mensaje:", err.message);
          console.error("  Stack:", err.stack);
          console.error("  URL:", req.url);
          console.error("  Método:", req.method);

          if (!res.headersSent) {
            res.status(500).json({
              message: "Error interno del servidor",
              error:
                process.env.NODE_ENV === "development"
                  ? err.message
                  : undefined,
            });
          }
        } catch (handlerError) {
          console.error("Error en el mismo error handler:", handlerError);
        }
      },
    );

    const PORT = process.env.PORT || 4800;
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
      console.log(
        `Documentación disponible en http://localhost:${PORT}/api-docs`,
      );
    });

    // Manejador de errores del servidor
    server.on("error", (error) => {
      console.error("Error en servidor HTTP:", error);
    });
  } catch (error) {
    console.error("Error al inicializar base de datos:", error);
    // No salir del proceso, esperar a que se estabilice
    setTimeout(() => {
      console.log("Reintentando inicialización...");
      process.emit("SIGTERM");
    }, 5000);
  }
};

// Iniciar aplicación
initializeApp().catch((error) => {
  console.error("Error fatal al inicializar aplicación:", error);
  // No hacer exit, dejar el proceso corriendo para debugging
  console.error("El servidor continuará intentando operar...");
});

export default app;
