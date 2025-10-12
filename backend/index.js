const express = require("express");
const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger.config");

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
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
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to FIRS PROYECT application." });
});

require("./routes/products.routes")(app);

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
