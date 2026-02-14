const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const express = require("express");
const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger.config");
const bcrypt = require("bcrypt");
const cors = require("cors");

// Verificar si se debe ejecutar migraciones
const shouldMigrate = process.argv.includes("--revert-db");

// Función para ejecutar migraciones y luego iniciar el servidor
const initializeApp = async () => {
  if (shouldMigrate) {
    console.log("🔄 Relanzando migraciones de base de datos...");
    try {
      const { runMigrations } = require("./db/migrate");
      await runMigrations();
    } catch (error) {
      console.error("❌ Error al ejecutar migraciones:", error);
      process.exit(1);
    }
  }
  
  startServer();
};

const startServer = () => {

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

const corsOptions = {
  origin: (origin, callback) => {
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

// Webhook de Stripe ANTES de body parsers
const pagoController = require("./controllers/stripe.payment.controller");
app.post("/api/pagos/webhook", express.raw({ type: "application/json" }), pagoController.stripeWebhook);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const db = require("./models");

const seedLegacyProducts = async () => {
  const Product = db.products;
  await Product.bulkCreate(
    [
      {
        name: "Leche Entera 1L",
        description: "Leche fresca entera pasteurizada",
        price: 1.25,
        stock: 50,
        image:
          "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&auto=format",
      },
      {
        name: "Pan Integral 500g",
        description: "Pan integral de trigo con semillas",
        price: 2.5,
        stock: 30,
        image:
          "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&auto=format",
      },
      {
        name: "Huevos Docena",
        description: "Huevos frescos de gallinas camperas",
        price: 3.2,
        stock: 40,
        image:
          "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&auto=format",
      },
      {
        name: "Tomates 1kg",
        description: "Tomates frescos de la huerta",
        price: 2.8,
        stock: 25,
        image:
          "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format",
      },
      {
        name: "Manzanas Golden 1kg",
        description: "Manzanas golden delicious dulces y crujientes",
        price: 2.3,
        stock: 35,
        image:
          "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=400&auto=format",
      },
      {
        name: "Aceite de Oliva 1L",
        description: "Aceite de oliva virgen extra premium",
        price: 8.5,
        stock: 20,
        image:
          "https://images.unsplash.com/photo-1608181363681-2e0a8e328863?w=400&auto=format",
      },
      {
        name: "Arroz Blanco 1kg",
        description: "Arroz blanco de grano largo",
        price: 1.8,
        stock: 45,
        image:
          "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&auto=format",
      },
    ],
    { ignoreDuplicates: true }
  );
  console.log("Productos legacy inicializados.");
};

const seedCatalog = async () => {
  await db.rol.bulkCreate(
    [
      { idrol: 1, nombre: "Cliente", descripcion: "Cliente estándar" },
      { idrol: 2, nombre: "Premium", descripcion: "Cliente premium" },
      { idrol: 3, nombre: "Empleado", descripcion: "Staff" },
      { idrol: 4, nombre: "Admin", descripcion: "Administrador" },
    ],
    { ignoreDuplicates: true }
  );

  await db.categoria.bulkCreate(
    [
      { idcategoria: 1, nombre: "Frutas", descripcion: "Frutas frescas" },
      { idcategoria: 2, nombre: "Verduras", descripcion: "Vegetales verdes" },
      { idcategoria: 3, nombre: "Bebidas", descripcion: "Bebidas y jugos" },
      { idcategoria: 4, nombre: "Panadería", descripcion: "Pan y repostería" },
      { idcategoria: 5, nombre: "Embutidos", descripcion: "Jamones y fiambres" },
      { idcategoria: 6, nombre: "Carnes", descripcion: "Res, cerdo y aves" },
      { idcategoria: 7, nombre: "Pescados", descripcion: "Productos del mar" },
      { idcategoria: 8, nombre: "Bebidas alcohólicas", descripcion: "Vinos y licores" },
      { idcategoria: 9, nombre: "Trigo", descripcion: "Cereales y harinas" },
    ],
    { ignoreDuplicates: true }
  );

  await db.articulo.bulkCreate(
    [
      {
        idcategoria: 1,
        codigo: "FRU-001",
        nombre: "Manzanas Golden 1kg",
        tipo: "fruta",
        precio_venta: 2.3,
        stock: 120,
        descripcion: "Manzanas dulces y crujientes",
        imagen: "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=400&auto=format",
      },
      {
        idcategoria: 1,
        codigo: "FRU-002",
        nombre: "Plátano Orgánico 1kg",
        tipo: "fruta",
        precio_venta: 1.95,
        stock: 150,
        descripcion: "Plátano orgánico maduro",
        imagen: "https://images.unsplash.com/photo-1574226516831-e1dff420e43e?w=400&auto=format",
      },
      {
        idcategoria: 2,
        codigo: "VER-001",
        nombre: "Tomate Cherry 500g",
        tipo: "verdura",
        precio_venta: 2.5,
        stock: 80,
        descripcion: "Tomate cherry seleccionado",
        imagen: "https://images.unsplash.com/photo-1524592733305-ffe08f62b8d9?w=400&auto=format",
      },
      {
        idcategoria: 3,
        codigo: "BEB-010",
        nombre: "Jugo de Naranja 1L",
        tipo: "bebidas",
        precio_venta: 3.1,
        stock: 60,
        descripcion: "Jugo natural sin azúcar añadida",
        imagen: "https://images.unsplash.com/photo-1502740438513-241e7d8c1f1b?w=400&auto=format",
      },
      {
        idcategoria: 4,
        codigo: "PAN-005",
        nombre: "Pan Integral Artesanal",
        tipo: "trigo",
        precio_venta: 2.8,
        stock: 70,
        descripcion: "Pan integral con semillas",
        imagen: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400&auto=format",
      },
      {
        idcategoria: 5,
        codigo: "EMB-101",
        nombre: "Jamón Serrano 200g",
        tipo: "embutidos",
        precio_venta: 4.6,
        stock: 90,
        descripcion: "Curado artesanal en montaña",
        imagen: "https://images.unsplash.com/photo-1506368083636-6defb67639c9?w=400&auto=format",
      },
      {
        idcategoria: 6,
        codigo: "CAR-210",
        nombre: "Filete de Res Angus 1kg",
        tipo: "carne",
        precio_venta: 14.5,
        stock: 45,
        descripcion: "Corte premium listo para la parrilla",
        imagen: "https://images.unsplash.com/photo-1608039829574-2c750ea1c8b5?w=400&auto=format",
      },
      {
        idcategoria: 7,
        codigo: "PES-080",
        nombre: "Salmón Fresco 500g",
        tipo: "pescado",
        precio_venta: 11.9,
        stock: 38,
        descripcion: "Origen noruego certificado",
        imagen: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&auto=format",
      },
      {
        idcategoria: 8,
        codigo: "ALC-330",
        nombre: "Vino Tinto Crianza 750ml",
        tipo: "bebidas alcoholicas",
        precio_venta: 9.9,
        stock: 55,
        descripcion: "D.O. Rioja con 12 meses en barrica",
        imagen: "https://images.unsplash.com/photo-1510626176961-4b57d4fbad03?w=400&auto=format",
      },
    ],
    { ignoreDuplicates: true }
  );

  console.log("Catálogo principal inicializado.");
};

const seedLegacyAdmin = async () => {
  try {
    const User = db.users;
    const existing = await User.findOne({ where: { email: "admin@local" } });
    if (!existing) {
      const hashed = await bcrypt.hash("admin123", 10);
      await User.create({ username: "admin", email: "admin@local", password: hashed });
      console.log("Usuario admin legacy creado: admin@local / admin123");
    }
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      console.log("ℹ️  Usuario admin ya existe, saltando...");
    } else {
      throw err;
    }
  }
};

const bootstrap = async () => {
  try {
    const forceReset = String(process.env.DB_FORCE_RESET || "false").toLowerCase() === "true";
    await db.sequelize.sync({ force: forceReset });
    if (forceReset) {
      console.log("Drop and re-sync db (DB_FORCE_RESET=true).");
    } else {
      console.log("DB synced without destructive reset.");
    }
    await seedLegacyProducts();
    await seedLegacyAdmin();
    await seedCatalog();
  } catch (err) {
    console.error("Error durante la inicialización de la BD:", err);
  }
};

bootstrap();

app.get("/", (req, res) => {
  res.json({ message: "Welcome to FIRS PROYECT application." });
});

require("./routes/products.routes")(app);
require("./routes/auth.routes")(app);
require("./routes/users.routes")(app);
require("./routes/categorias.routes")(app);
require("./routes/articulos.routes")(app);
require("./routes/carrito.routes")(app);
require("./routes/ventas.routes")(app);
require("./routes/usuarios.routes")(app);
require("./routes/pagos.routes")(app);

app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "LaTienditaApi - Documentación",
  })
);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to FIRST PROYECT application." });
});


const upload = require("./multer/upload");


app.post('/api/upload', (req, res) => {
  // use upload.single as an inner middleware so we can catch multer errors and return JSON
  upload.single('image')(req, res, function (err) {
    if (err) {
      // Multer errors contain a code like 'LIMIT_FILE_SIZE'
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large' });
      }
      return res.status(400).json({ error: err.message || 'Upload error' });
    }

    if (req.fileValidationError) {
      return res.status(400).json({ error: req.fileValidationError });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ninguna imagen' });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/public/images/${req.file.filename}`;
    res.json({ imageUrl });
  });
});


app.use("/public", express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 4800;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}.`);
  console.log(`📚 Documentación disponible en http://localhost:${PORT}/api-docs`);
});

}; // Cierre de startServer

// Iniciar la aplicación con manejo de migraciones
initializeApp();
