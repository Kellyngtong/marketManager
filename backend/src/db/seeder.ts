import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import db, { initializeDatabase } from './index';
import bcrypt from 'bcrypt';

async function seedDatabase(): Promise<void> {
  try {
    console.log('🌱 Iniciando seeder de datos multitenant...');

    // Inicializar BD
    await initializeDatabase();

    // Crear tablas si no existen
    await db.sequelize.sync();
    console.log('✅ Base de datos sincronizada');

    // 1. ROLES
    await db.rol.bulkCreate(
      [
        { idrol: 1, nombre: 'Cliente', descripcion: 'Cliente estándar' },
        { idrol: 2, nombre: 'Premium', descripcion: 'Cliente premium' },
        { idrol: 3, nombre: 'Empleado', descripcion: 'Personal del supermercado' },
        { idrol: 4, nombre: 'Admin', descripcion: 'Administrador del sistema' },
      ],
      { ignoreDuplicates: true }
    );
    console.log('✅ Roles creados');

    // 2. CATEGORÍAS
    await db.categoria.bulkCreate(
      [
        {
          idcategoria: 1,
          nombre: 'Frutas',
          descripcion: 'Frutas frescas variadas',
        },
        {
          idcategoria: 2,
          nombre: 'Verduras',
          descripcion: 'Vegetales y hortalizas',
        },
        {
          idcategoria: 3,
          nombre: 'Bebidas',
          descripcion: 'Bebidas diversas',
        },
        {
          idcategoria: 4,
          nombre: 'Panadería',
          descripcion: 'Pan y productos horneados',
        },
        {
          idcategoria: 5,
          nombre: 'Embutidos',
          descripcion: 'Jamones y fiambres',
        },
        { idcategoria: 6, nombre: 'Carnes', descripcion: 'Carnes frescas' },
        {
          idcategoria: 7,
          nombre: 'Pescados',
          descripcion: 'Productos del mar',
        },
        {
          idcategoria: 8,
          nombre: 'Alcohólicas',
          descripcion: 'Vinos y licores',
        },
        { idcategoria: 9, nombre: 'Lácteos', descripcion: 'Productos lácteos' },
      ],
      { ignoreDuplicates: true }
    );
    console.log('✅ Categorías creadas');

    // 3. USUARIOS (ADMIN Y EMPLEADO POR TENANT)
    const hashedAdminPass = await bcrypt.hash('admin123', 10);
    const hashedEmpleadoPass = await bcrypt.hash('empleado123', 10);

    // Admin global
    await db.usuario.create(
      {
        nombre: 'Admin Global',
        email: 'admin@test.com',
        clave: hashedAdminPass,
        idrol: 4,
        id_tenant: 1,
        id_store: 1,
        condicion: true,
      },
      { ignoreDuplicates: true }
    );

    // Empleado tenant 2
    await db.usuario.create(
      {
        nombre: 'Empleado García',
        email: 'empleado@test.com',
        clave: hashedEmpleadoPass,
        idrol: 3,
        id_tenant: 2,
        id_store: 3,
        condicion: true,
      },
      { ignoreDuplicates: true }
    );

    console.log('✅ Usuarios creados');

    // 4. ARTÍCULOS (19 productos por tenant)
    const articuloData = [
      {
        nombre: 'Manzana Roja',
        codigo: 'ART001',
        idcategoria: 1,
        precio_venta: 2.5,
        stock: 100,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: 'Plátano',
        codigo: 'ART002',
        idcategoria: 1,
        precio_venta: 1.5,
        stock: 150,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: 'Naranja',
        codigo: 'ART003',
        idcategoria: 1,
        precio_venta: 2.0,
        stock: 120,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: 'Tomate',
        codigo: 'ART004',
        idcategoria: 2,
        precio_venta: 3.0,
        stock: 80,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: 'Lechuga',
        codigo: 'ART005',
        idcategoria: 2,
        precio_venta: 2.5,
        stock: 90,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: 'Coca Cola 330ml',
        codigo: 'ART006',
        idcategoria: 3,
        precio_venta: 1.8,
        stock: 200,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: 'Agua Mineral 1L',
        codigo: 'ART007',
        idcategoria: 3,
        precio_venta: 1.0,
        stock: 300,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: 'Pan Blanco',
        codigo: 'ART008',
        idcategoria: 4,
        precio_venta: 2.0,
        stock: 50,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: 'Jamón Serrano',
        codigo: 'ART009',
        idcategoria: 5,
        precio_venta: 12.0,
        stock: 20,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: 'Queso Manchego',
        codigo: 'ART010',
        idcategoria: 9,
        precio_venta: 10.0,
        stock: 15,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: 'Filete de Ternera',
        codigo: 'ART011',
        idcategoria: 6,
        precio_venta: 15.0,
        stock: 30,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: 'Salmón Fresco',
        codigo: 'ART012',
        idcategoria: 7,
        precio_venta: 18.0,
        stock: 10,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: 'Vino Tinto Reserva',
        codigo: 'ART013',
        idcategoria: 8,
        precio_venta: 25.0,
        stock: 25,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: 'Yogur Natural',
        codigo: 'ART014',
        idcategoria: 9,
        precio_venta: 2.5,
        stock: 100,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: 'Leche Entera',
        codigo: 'ART015',
        idcategoria: 9,
        precio_venta: 1.5,
        stock: 150,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: 'Huevos (docena)',
        codigo: 'ART016',
        idcategoria: 9,
        precio_venta: 3.5,
        stock: 80,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: 'Aceite de Oliva',
        codigo: 'ART017',
        idcategoria: 3,
        precio_venta: 8.0,
        stock: 40,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: 'Arroz Blanco',
        codigo: 'ART018',
        idcategoria: 3,
        precio_venta: 2.0,
        stock: 120,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: 'Pasta Integral',
        codigo: 'ART019',
        idcategoria: 3,
        precio_venta: 1.8,
        stock: 100,
        id_tenant: 1,
        id_store: 1,
      },
    ];

    // Crear artículos para tenant 1
    await db.articulo.bulkCreate(articuloData, { ignoreDuplicates: true });

    // Duplicar para tenant 2 (con mismo id_store=3)
    const articurosT2 = articuloData.map((art) => ({
      ...art,
      codigo: art.codigo + '-T2',
      id_tenant: 2,
      id_store: 3,
    }));
    await db.articulo.bulkCreate(articurosT2, { ignoreDuplicates: true });

    console.log('✅ Artículos creados (19 x 2 tenants = 38 total)');

    console.log('\n✅ ¡Seeder completado exitosamente!');
    console.log('\n📝 Credenciales para pruebas:');
    console.log('   Admin: admin@test.com / admin123 (Tenant 1, Store 1)');
    console.log('   Empleado: empleado@test.com / empleado123 (Tenant 2, Store 3)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seeder:', error);
    process.exit(1);
  }
}

// Ejecutar seeder
seedDatabase();
