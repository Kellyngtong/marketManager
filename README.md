# 🛒 La Tiendita - Sistema de Comercio Online

Una aplicación web de comercio electrónico para supermercado que permite gestionar productos, realizar compras y administrar el inventario de forma simple e intuitiva.

## Comenzando 🚀

Estas instrucciones te permitirán obtener una copia del proyecto en funcionamiento en tu máquina local para propósitos de desarrollo y pruebas.

### Pre-requisitos 📋

Necesitas tener instalado lo siguiente en tu sistema:

```bash
Node.js (v14 o superior)
npm (v6 o superior)
MySQL (v5.7 o superior)
Angular CLI (v20 o superior)
```

Verifica que tienes Node.js instalado:

```bash
node --version
npm --version
```

### Instalación 🔧

Sigue estos pasos para configurar el entorno de desarrollo:

#### 1. Clona el repositorio

```bash
git clone <url-del-repositorio>
cd Proyecto1
```

#### 2. Configura la base de datos

Crea una base de datos MySQL:

```sql
CREATE DATABASE db_ionic;
```

#### 3. Configura el Backend

```bash
cd backend
npm install
```

Crea un archivo `.env` en la carpeta `backend` con la siguiente configuración:

```env
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=db_ionic
PORT=4800
```

Inicia el servidor backend:

```bash
node index.js
```

El servidor estará corriendo en `http://localhost:4800`

#### 4. Configura el Frontend

```bash
cd frontend
npm install
```

Inicia el servidor de desarrollo:

```bash
ionic serve
```

La aplicación estará disponible en `http://localhost:8100`

#### 5. Prueba la instalación

Accede a `http://localhost:8100` y deberías ver la lista de productos del supermercado.

## Ejecutando el proyecto ⚙️

### Backend (API REST)

```bash
cd backend
node index.js
```

Esto iniciará:

- El servidor Express en el puerto 4800
- La conexión a la base de datos MySQL
- La creación automática de 7 productos de ejemplo
- La documentación Swagger en `http://localhost:4800/api-docs`

### Frontend (Aplicación Angular + Ionic)

```bash
cd frontend
ng serve --port 49469
```

Esto iniciará:

- El servidor de desarrollo de Angular
- Hot reload para cambios en tiempo real
- La aplicación en `http://localhost:8100`

### Documentación de la API 📚

La documentación interactiva de la API está disponible en:

```
http://localhost:4800/api-docs
```

Aquí puedes:

- Ver todos los endpoints disponibles
- Probar cada endpoint directamente
- Ver los esquemas de request/response
- Consultar los códigos de respuesta HTTP

## Funcionalidades ✨

### Para Usuarios

- ✅ **Ver productos**: Lista completa de productos del supermercado
- ✅ **Ver detalles**: Información detallada de cada producto
- ✅ **Carrito de compras**: Agregar, modificar cantidades y eliminar productos
- ✅ **Checkout**: Vista de finalización de compra (próximamente)

### Para Administradores

- ✅ **Crear productos**: Añadir nuevos productos al catálogo
- ✅ **Editar productos**: Modificar nombre, precio y stock
- ✅ **Eliminar productos**: Borrar productos del inventario
- ✅ **Gestión visual**: Botones intuitivos en cada tarjeta de producto

## API Endpoints 🔌

### Productos

GET | `/api/products` | Obtener todos los productos
GET | `/api/products/:id` | Obtener un producto por ID
POST | `/api/products` | Crear un nuevo producto
PUT | `/api/products/:id` | Actualizar un producto
DELETE | `/api/products/:id` | Eliminar un producto

### Ejemplo de uso:

```bash
# Obtener todos los productos
curl http://localhost:4800/api/products

# Crear un nuevo producto
curl -X POST http://localhost:4800/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Café 250g",
    "description": "Café molido premium",
    "price": 4.50,
    "stock": 15,
    "image": "https://images.unsplash.com/photo-1..."
  }'
```

## Construido con 🛠️

### Backend

- **Node.js** - Entorno de ejecución para JavaScript
- **Express.js** - Framework web para Node.js
- **MySQL** - Sistema de gestión de base de datos
- **Sequelize** - ORM para Node.js
- **Swagger UI Express** - Documentación interactiva de API
- **swagger-jsdoc** - Generación de especificaciones OpenAPI
- **dotenv** - Gestión de variables de entorno
- **CORS** - Manejo de peticiones cross-origin

### Frontend

- **Angular 16+** - Framework de desarrollo web
- **Ionic Framework** - Componentes UI móviles
- **TypeScript** - Superset tipado de JavaScript
- **RxJS** - Programación reactiva
- **Capacitor** - Runtime nativo para apps híbridas

## Características Técnicas 🔧

- **Arquitectura**: Cliente-Servidor (API REST)
- **Patrón de diseño**: MVC (Model-View-Controller)
- **Base de datos**: Relacional (MySQL)
- **ORM**: Sequelize con sincronización automática
- **Componentes**: Angular Modules (no standalone)
- **Estado**: LocalStorage para persistencia del carrito
- **Estilos**: SCSS con variables de Ionic
- **API Docs**: OpenAPI 3.0.0 (Swagger)

## Configuración de Entorno 🔐

### Backend (.env)

```env
# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=db_ionic

# Servidor
PORT=4800
NODE_ENV=development
```

### Frontend (environment.ts)

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:4800/api",
};
```

## Productos de Ejemplo 🥫

El sistema se inicializa con 7 productos de supermercado:

1. Leche Entera 1L - €1.25
2. Pan Integral 500g - €2.50
3. Huevos Docena - €3.20
4. Tomates 1kg - €2.80
5. Manzanas Golden 1kg - €2.30
6. Aceite de Oliva 1L - €8.50
7. Arroz Blanco 1kg - €1.80

## Autores ✒️

- **Aitor Aridane Peña Sánchez** - _Desarrollo completo_ - Proyectito de tienda online para supermercado
