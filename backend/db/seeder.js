const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
const db = require("../models");
const bcrypt = require("bcrypt");

async function seedDatabase() {
  try {
    console.log("🌱 Iniciando seeder de datos multitenant...");

    // Esperar a que la BD esté sincronizada
    await db.sequelize.sync();
    console.log("✅ Base de datos sincronizada");

    // 0. TENANTS (NUEVO - MULTITENANT)
    const tenants = await db.sequelize.query(
      `INSERT IGNORE INTO tenant (nombre, email, plan) VALUES 
       ('MarketManager Admin', 'admin@marketmanager.local', 'enterprise'),
       ('Supermercado García', 'garcia@supermercado.local', 'pro'),
       ('Tienda López', 'lopez@tienda.local', 'free')`
    );
    console.log("✅ Tenants creados");

    // 0.5 STORES (NUEVO - MULTITENANT)
    const stores = await db.sequelize.query(
      `INSERT IGNORE INTO store (id_tenant, nombre, direccion, telefono) VALUES 
       (1, 'Tienda Principal Admin', 'Calle Principal 123', '555-0001'),
       (2, 'García - Sucursal Centro', 'Centro 456', '555-0002'),
       (2, 'García - Sucursal Norte', 'Norte 789', '555-0003'),
       (3, 'López - Única', 'Avenida López 100', '555-0004')`
    );
    console.log("✅ Stores creados");

    // 1. ROLES
    const roles = await db.rol.bulkCreate(
      [
        { idrol: 1, nombre: "Cliente", descripcion: "Cliente estándar" },
        { idrol: 2, nombre: "Premium", descripcion: "Cliente premium" },
        {
          idrol: 3,
          nombre: "Empleado",
          descripcion: "Personal del supermercado",
        },
        { idrol: 4, nombre: "Admin", descripcion: "Administrador del sistema" },
      ],
      { ignoreDuplicates: true },
    );
    console.log("✅ Roles creados");

    // 2. CATEGORÍAS (AHORA CON TENANT)
    const categorias = await db.categoria.bulkCreate(
      [
        {
          idcategoria: 1,
          id_tenant: 1,
          nombre: "Frutas",
          descripcion: "Frutas frescas variadas",
        },
        {
          idcategoria: 2,
          id_tenant: 1,
          nombre: "Verduras",
          descripcion: "Vegetales y hortalizas",
        },
        { 
          idcategoria: 3, 
          id_tenant: 1,
          nombre: "Bebidas", 
          descripcion: "Bebidas diversas" 
        },
        {
          idcategoria: 4,
          id_tenant: 1,
          nombre: "Panadería",
          descripcion: "Pan y productos horneados",
        },
        {
          idcategoria: 5,
          nombre: "Embutidos",
          descripcion: "Jamones y fiambres",
        },
        { idcategoria: 6, nombre: "Carnes", descripcion: "Carnes frescas" },
        {
          idcategoria: 7,
          nombre: "Pescados",
          descripcion: "Productos del mar",
        },
        {
          idcategoria: 8,
          nombre: "Alcohólicas",
          descripcion: "Vinos y licores",
        },
        { idcategoria: 9, nombre: "Lácteos", descripcion: "Productos lácteos" },
      ],
      { ignoreDuplicates: true },
    );
    console.log("✅ Categorías creadas");

    // 3. ARTÍCULOS (PRODUCTOS)
    const articulos = await db.articulo.bulkCreate(
      [
        // Frutas
        {
          idcategoria: 1,
          codigo: "FRU-001",
          nombre: "Manzanas Golden 1kg",
          tipo: "fruta",
          precio_venta: 2.3,
          stock: 150,
          descripcion: "Manzanas dulces y crujientes de origen local",
          imagen:
            "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=400&auto=format",
        },
        {
          idcategoria: 1,
          codigo: "FRU-002",
          nombre: "Plátano Orgánico 1kg",
          tipo: "fruta",
          precio_venta: 1.95,
          stock: 200,
          descripcion: "Plátanos orgánicos maduros y sin pesticidas",
          imagen:
            "https://images.unsplash.com/photo-1574226516831-e1dff420e43e?w=400&auto=format",
        },
        {
          idcategoria: 1,
          codigo: "FRU-003",
          nombre: "Naranjas Valencia 1kg",
          tipo: "fruta",
          precio_venta: 1.8,
          stock: 120,
          descripcion: "Naranjas frescas juguosas premium",
          imagen:
            "https://images.unsplash.com/photo-1414471159143-f74b3c2e8c80?w=400&auto=format",
        },

        // Verduras
        {
          idcategoria: 2,
          codigo: "VER-001",
          nombre: "Tomate Cherry 500g",
          tipo: "verdura",
          precio_venta: 2.5,
          stock: 100,
          descripcion: "Tomates cherry seleccionados de temporada",
          imagen:
            "https://images.unsplash.com/photo-1524592733305-ffe08f62b8d9?w=400&auto=format",
        },
        {
          idcategoria: 2,
          codigo: "VER-002",
          nombre: "Lechuga Romana 1 unidad",
          tipo: "verdura",
          precio_venta: 1.5,
          stock: 80,
          descripcion: "Lechuga romana fresca y crujiente",
          imagen:
            "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&auto=format",
        },
        {
          idcategoria: 2,
          codigo: "VER-003",
          nombre: "Brócoli 1 unidad",
          tipo: "verdura",
          precio_venta: 2.0,
          stock: 70,
          descripcion: "Brócoli fresco de excelente calidad",
          imagen:
            "https://images.unsplash.com/photo-1537694712202-8e73c0a4b1e7?w=400&auto=format",
        },

        // Bebidas
        {
          idcategoria: 3,
          codigo: "BEB-001",
          nombre: "Jugo Naranja Natural 1L",
          tipo: "bebida",
          precio_venta: 3.1,
          stock: 90,
          descripcion: "Jugo de naranja natural sin azúcares añadidos",
          imagen:
            "https://images.unsplash.com/photo-1502740438513-241e7d8c1f1b?w=400&auto=format",
        },
        {
          idcategoria: 3,
          codigo: "BEB-002",
          nombre: "Agua Mineral 1.5L",
          tipo: "bebida",
          precio_venta: 0.85,
          stock: 300,
          descripcion: "Agua mineral pura y refrescante",
          imagen:
            "https://images.unsplash.com/photo-1535237099380-e46fd4fee2fd?w=400&auto=format",
        },
        {
          idcategoria: 3,
          codigo: "BEB-003",
          nombre: "Café Molido 500g",
          tipo: "bebida",
          precio_venta: 5.5,
          stock: 60,
          descripcion: "Café premium molido de grano seleccionado",
          imagen:
            "https://images.unsplash.com/photo-1559056199-641a0ac8b8d5?w=400&auto=format",
        },

        // Panadería
        {
          idcategoria: 4,
          codigo: "PAN-001",
          nombre: "Pan Integral Artesanal",
          tipo: "panaderia",
          precio_venta: 2.8,
          stock: 50,
          descripcion: "Pan integral con semillas naturales",
          imagen:
            "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400&auto=format",
        },
        {
          idcategoria: 4,
          codigo: "PAN-002",
          nombre: "Croissants 4 unidades",
          tipo: "panaderia",
          precio_venta: 3.5,
          stock: 80,
          descripcion: "Croissants frescos de mantequilla auténtica",
          imagen:
            "https://images.unsplash.com/photo-1572599810256-fbf48d312ca2?w=400&auto=format",
        },

        // Embutidos
        {
          idcategoria: 5,
          codigo: "EMB-001",
          nombre: "Jamón Serrano 200g",
          tipo: "embutido",
          precio_venta: 4.6,
          stock: 40,
          descripcion: "Jamón serrano curado artesanalmente",
          imagen:
            "https://images.unsplash.com/photo-1506368083636-6defb67639c9?w=400&auto=format",
        },
        {
          idcategoria: 5,
          codigo: "EMB-002",
          nombre: "Mortadela Premium 300g",
          tipo: "embutido",
          precio_venta: 3.2,
          stock: 60,
          stock: 60,
          descripcion: "Mortadela de excelente calidad con pistacho",
          imagen:
            "https://images.unsplash.com/photo-1587570921171-2bfb2f1df87d?w=400&auto=format",
        },

        // Carnes
        {
          idcategoria: 6,
          codigo: "CAR-001",
          nombre: "Filete de Res Angus 1kg",
          tipo: "carne",
          precio_venta: 14.5,
          stock: 45,
          descripcion: "Filete premium Angus para parrilla",
          imagen:
            "https://images.unsplash.com/photo-1608039829574-2c750ea1c8b5?w=400&auto=format",
        },
        {
          idcategoria: 6,
          codigo: "CAR-002",
          nombre: "Pechuga Pollo 1kg",
          tipo: "carne",
          precio_venta: 6.8,
          stock: 100,
          descripcion: "Pechuga de pollo fresca y magra",
          imagen:
            "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&auto=format",
        },

        // Pescados
        {
          idcategoria: 7,
          codigo: "PES-001",
          nombre: "Salmón Fresco 500g",
          tipo: "pescado",
          precio_venta: 11.9,
          stock: 35,
          descripcion: "Salmón fresco noruego de primera calidad",
          imagen:
            "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&auto=format",
        },
        {
          idcategoria: 7,
          codigo: "PES-002",
          nombre: "Bacalao 600g",
          tipo: "pescado",
          precio_venta: 9.5,
          stock: 28,
          descripcion: "Bacalao deshuesado y limpio",
          imagen:
            "https://images.unsplash.com/photo-1589519160732-57fc498494f8?w=400&auto=format",
        },

        // Alcohólicas
        {
          idcategoria: 8,
          codigo: "ALC-001",
          nombre: "Vino Tinto Crianza 750ml",
          tipo: "bebida_alcoholica",
          precio_venta: 9.9,
          stock: 55,
          descripcion: "D.O. Rioja con 12 meses en barrica",
          imagen:
            "https://images.unsplash.com/photo-1510626176961-4b57d4fbad03?w=400&auto=format",
        },
        {
          idcategoria: 8,
          codigo: "ALC-002",
          nombre: "Cerveza Premium Pack 6",
          tipo: "bebida_alcoholica",
          precio_venta: 5.4,
          stock: 120,
          descripcion: "Pack de 6 cervezas premium de excelente sabor",
          imagen:
            "https://images.unsplash.com/photo-1608411334035-a52aea81e1f0?w=400&auto=format",
        },

        // Lácteos
        {
          idcategoria: 9,
          codigo: "LAC-001",
          nombre: "Leche Entera 1L",
          tipo: "lacteo",
          precio_venta: 1.2,
          stock: 200,
          descripcion: "Leche entera fresca pasteurizada",
          imagen:
            "https://images.unsplash.com/photo-1606312519494-da30588872b2?w=400&auto=format",
        },
        {
          idcategoria: 9,
          codigo: "LAC-002",
          nombre: "Queso Cheddar 300g",
          tipo: "lacteo",
          precio_venta: 3.75,
          stock: 70,
          descripcion: "Queso cheddar maduro importado",
          imagen:
            "https://images.unsplash.com/photo-1452894904938-7aae4d4e7205?w=400&auto=format",
        },
      ],
      { ignoreDuplicates: true },
    );
    console.log(`✅ ${articulos.length} Artículos creados`);

    // 3.5 ASIGNAR ARTÍCULOS A TENANTS (MULTITENANT)
    // Obtener todos los artículos creados
    const allArticulos = await db.articulo.findAll();
    
    if (allArticulos.length > 0) {
      // Separar en dos grupos: Tenant 1 (primeros 15) y Tenant 2 (últimos)
      const halfPoint = Math.ceil(allArticulos.length / 2);
      
      // Tenant 1: Tienda Principal Admin
      await db.articulo.update(
        { id_tenant: 1, id_store: 1 },
        { where: { idarticulo: allArticulos.slice(0, halfPoint).map(a => a.idarticulo) } }
      );
      
      // Tenant 2: García - Sucursal Centro (si hay más artículos)
      if (allArticulos.length > halfPoint) {
        await db.articulo.update(
          { id_tenant: 2, id_store: 3 },
          { where: { idarticulo: allArticulos.slice(halfPoint).map(a => a.idarticulo) } }
        );
      }
      
      console.log(`✅ Artículos asignados a tenants`);
    }

    // 4. USUARIOS DE PRUEBA (CON TENANT E ID_STORE)
    const usuarios = await db.usuario.bulkCreate(
      [
        {
          nombre: "Admin Sistema",
          email: "admin@test.com",
          clave: await bcrypt.hash("admin123", 10),
          idrol: 4,
          id_tenant: 1,
          id_store: 1,
          telefono: "555-0001",
          direccion: "Admin Office",
        },
        {
          nombre: "Empleado García Centro",
          email: "empleado@test.com",
          clave: await bcrypt.hash("emp123", 10),
          idrol: 3,
          id_tenant: 2,
          id_store: 3,
          telefono: "555-0002",
          direccion: "García Centro",
        },
        {
          nombre: "Juan Cliente García",
          email: "cliente@test.com",
          clave: await bcrypt.hash("cli123", 10),
          idrol: 1,
          id_tenant: 2,
          id_store: 3,
          telefono: "555-0003",
          direccion: "Calle Principal 123",
        },
        {
          nombre: "María Premium López",
          email: "premium@test.com",
          clave: await bcrypt.hash("pre123", 10),
          idrol: 2,
          id_tenant: 3,
          id_store: 4,
          telefono: "555-0004",
          direccion: "Avenida Central 456",
        },
      ],
      { ignoreDuplicates: true },
    );
    console.log(`✅ ${usuarios.length} Usuarios creados`);

    // 5. CLIENTES (VINCULADOS A USUARIOS)
    const clientes = await db.cliente.bulkCreate(
      [
        {
          nombre: "Juan Cliente",
          email: "cliente@test.com",
          telefono: "555-0003",
          direccion: "Calle Principal 123",
        },
        {
          nombre: "María Premium",
          email: "premium@test.com",
          telefono: "555-0004",
          direccion: "Avenida Central 456",
        },
      ],
      { ignoreDuplicates: true },
    );
    console.log(`✅ ${clientes.length} Clientes creados`);

    // 6. PROVEEDORES
    const proveedores = await db.proveedor.bulkCreate(
      [
        {
          nombre: "Frutas del Valle",
          contacto: "Carlos Ruiz",
          telefono: "555-1001",
          direccion: "km 5 Carretera Central",
          condicion: true,
        },
        {
          nombre: "Distribuidora Fresh",
          contacto: "Ana Martínez",
          telefono: "555-1002",
          direccion: "Zona Industrial Norte",
          condicion: true,
        },
        {
          nombre: "Carnes Premium",
          contacto: "Roberto Díaz",
          telefono: "555-1003",
          direccion: "Mercado Central, Local 42",
          condicion: true,
        },
      ],
      { ignoreDuplicates: true },
    );
    console.log(`✅ ${proveedores.length} Proveedores creados`);

    console.log("\n" + "=".repeat(50));
    console.log("🎉 SEEDER COMPLETADO EXITOSAMENTE");
    console.log("=".repeat(50));
    console.log("\n📊 DATOS INICIALES:");
    console.log(`  • Roles: 4`);
    console.log(`  • Categorías: 9`);
    console.log(`  • Artículos: ${articulos.length}`);
    console.log(`  • Usuarios: ${usuarios.length}`);
    console.log(`  • Clientes: ${clientes.length}`);
    console.log(`  • Proveedores: ${proveedores.length}`);
    console.log("\n👤 CUENTAS DE PRUEBA:");
    console.log(`  Admin:     admin@test.com / admin123`);
    console.log(`  Empleado:  empleado@test.com / emp123`);
    console.log(`  Cliente:   cliente@test.com / cli123`);
    console.log(`  Premium:   premium@test.com / pre123`);
    console.log("\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error al ejecutar seeder:", error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
