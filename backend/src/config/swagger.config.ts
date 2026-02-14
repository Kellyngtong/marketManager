import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MarketManager API',
      version: '1.0.0',
      description: 'API REST para plataforma SaaS multitenant de gestión de tiendas',
      contact: {
        name: 'Aitor Peña Sánchez',
      },
    },
    servers: [
      {
        url: 'http://localhost:4800',
        description: 'Servidor de desarrollo',
      },
      {
        url: 'http://localhost:8100',
        description: 'Servidor ionic',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      {
        name: 'Autenticación',
        description: 'Endpoints para autenticación y perfil',
      },
      {
        name: 'Artículos',
        description: 'Endpoints para gestionar artículos/productos',
      },
      {
        name: 'Categorías',
        description: 'Endpoints para gestionar categorías',
      },
      {
        name: 'Carrito',
        description: 'Endpoints para gestionar carrito de compras',
      },
      {
        name: 'Ventas',
        description: 'Endpoints para gestionar ventas',
      },
      {
        name: 'Pagos',
        description: 'Endpoints para procesar pagos con Stripe',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
