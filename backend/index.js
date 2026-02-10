require("dotenv").config();
const express = require("express");
const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger.config");

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const db = require("./models");
db.sequelize.sync({ force: true }).then(() => {
  console.log("Drop and re-sync db.");

  const Product = db.products;
  Product.bulkCreate([
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
  ]).then(() => {
    console.log("Productos de supermercado creados correctamente.");
  });
  // Optional: create a default admin user for convenience
  const bcrypt = require("bcrypt");
  const User = db.users;
  (async () => {
    try {
      const existing = await User.findOne({ where: { email: "admin@local" } });
      if (!existing) {
        const hashed = await bcrypt.hash("admin123", 10);
        await User.create({ username: "admin", email: "admin@local", password: hashed });
        console.log("Default admin user created: admin@local / admin123");
      }
    } catch (err) {
      console.error("Error creating default user:", err);
    }
  })();
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to FIRS PROYECT application." });
});

require("./routes/products.routes")(app);
require("./routes/auth.routes")(app);
require("./routes/users.routes")(app);
require("./routes/categorias.routes")(app);
require("./routes/articulos.routes")(app);

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

const PORT = process.env.PORT || 4800;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to FIRST PROYECT application." });
});


const path = require("path");
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
