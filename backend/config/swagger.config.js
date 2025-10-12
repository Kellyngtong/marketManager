const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "LaTienditaApi",
      version: "1.0.0",
      description:
        "API REST para una tienda online de productos de supermercado",
      contact: {
        name: "Tiburcio",
        email: "tiburcio@example.com",
      },
    },
    servers: [
      {
        url: "http://localhost:4800",
        description: "Servidor de desarrollo",
      },
    ],
    tags: [
      {
        name: "Productos",
        description: "Endpoints para gestionar productos",
      },
    ],
  },
  apis: ["./routes/*.js", "./controllers/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
