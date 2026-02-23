import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import db, { initializeDatabase } from "./index";
import bcrypt from "bcrypt";

async function seedDatabase(): Promise<void> {
  try {
    console.log("🌱 Iniciando seeder de datos multitenant...");

    // Inicializar BD
    await initializeDatabase();

    // Crear tablas si no existen
    await db.sequelize.sync();
    console.log("✅ Base de datos sincronizada");

    // 0. TENANTS Y STORES BASE (IDEMPOTENTE)
    await db.sequelize.query(
      `INSERT IGNORE INTO tenant (id_tenant, nombre, email, plan, estado)
       VALUES
       (1, 'MarketManager Admin', 'admin@marketmanager.local', 'enterprise', 1),
       (2, 'Supermercado García', 'garcia@supermercado.local', 'pro', 1),
       (3, 'Tienda López', 'lopez@tienda.local', 'free', 1)`
    );

    await db.sequelize.query(
      `INSERT IGNORE INTO store (id_store, id_tenant, nombre, direccion, telefono, estado)
       VALUES
       (1, 1, 'Tienda Principal Admin', 'Calle Principal 123', '555-0001', 1),
       (3, 2, 'García - Sucursal Centro', 'Centro 456', '555-0002', 1),
       (4, 3, 'López - Única', 'Avenida López 100', '555-0004', 1)`
    );

    console.log("✅ Tenants y stores base creados/actualizados");

    // 1. ROLES
    await db.rol.bulkCreate(
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

    // 2. CATEGORÍAS
    await db.categoria.bulkCreate(
      [
        {
          idcategoria: 1,
          nombre: "Frutas",
          descripcion: "Frutas frescas variadas",
        },
        {
          idcategoria: 2,
          nombre: "Verduras",
          descripcion: "Vegetales y hortalizas",
        },
        {
          idcategoria: 3,
          nombre: "Bebidas",
          descripcion: "Bebidas diversas",
        },
        {
          idcategoria: 4,
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

    // 3. USUARIOS (ADMIN Y EMPLEADO POR TENANT)
      // 3. USUARIOS DE PRUEBA POR ROL (IDEMPOTENTE)
      const requiredUsers = [
        {
          nombre: "Admin Sistema",
          email: "admin@test.com",
          clave: "admin123",
          idrol: 4,
          id_tenant: 1,
          id_store: 1,
        },
        {
          nombre: "Empleado García Centro",
          email: "empleado@test.com",
          clave: "emp123",
          idrol: 3,
          id_tenant: 2,
          id_store: 3,
        },
        {
          nombre: "Juan Cliente García",
          email: "cliente@test.com",
          clave: "cli123",
          idrol: 1,
          id_tenant: 2,
          id_store: 3,
        },
        {
          nombre: "María Premium López",
          email: "premium@test.com",
          clave: "pre123",
          idrol: 2,
          id_tenant: 3,
          id_store: 4,
        },
      ];

      for (const testUser of requiredUsers) {
        const existingUser = await (db.usuario as any).findOne({
          where: { email: testUser.email },
        });

        const hashedPassword = await bcrypt.hash(testUser.clave, 10);

        if (existingUser) {
          await existingUser.update({
            nombre: testUser.nombre,
            clave: hashedPassword,
            idrol: testUser.idrol,
            id_tenant: testUser.id_tenant,
            id_store: testUser.id_store,
            condicion: true,
          });
        } else {
          await (db.usuario as any).create({
            nombre: testUser.nombre,
            email: testUser.email,
            clave: hashedPassword,
            idrol: testUser.idrol,
            id_tenant: testUser.id_tenant,
            id_store: testUser.id_store,
            condicion: true,
          });
        }
      }

      console.log("✅ Usuarios de prueba por rol creados/actualizados");

    // 4. ARTÍCULOS (19 productos por tenant)
    const articuloData = [
      {
        nombre: "Manzana Roja",
        codigo: "ART001",
        idcategoria: 1,
        precio_venta: 2.5,
        stock: 100,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: "Plátano",
        codigo: "ART002",
        idcategoria: 1,
        precio_venta: 1.5,
        stock: 150,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: "Naranja",
        codigo: "ART003",
        idcategoria: 1,
        precio_venta: 2.0,
        stock: 120,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: "Tomate",
        codigo: "ART004",
        idcategoria: 2,
        precio_venta: 3.0,
        stock: 80,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: "Lechuga",
        codigo: "ART005",
        idcategoria: 2,
        precio_venta: 2.5,
        stock: 90,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: "Coca Cola 330ml",
        codigo: "ART006",
        idcategoria: 3,
        precio_venta: 1.8,
        stock: 200,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: "Agua Mineral 1L",
        codigo: "ART007",
        idcategoria: 3,
        precio_venta: 1.0,
        stock: 300,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: "Pan Blanco",
        codigo: "ART008",
        idcategoria: 4,
        precio_venta: 2.0,
        stock: 50,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: "Jamón Serrano",
        codigo: "ART009",
        idcategoria: 5,
        precio_venta: 12.0,
        stock: 20,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: "Queso Manchego",
        codigo: "ART010",
        idcategoria: 9,
        precio_venta: 10.0,
        stock: 15,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: "Filete de Ternera",
        codigo: "ART011",
        idcategoria: 6,
        precio_venta: 15.0,
        stock: 30,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: "Salmón Fresco",
        codigo: "ART012",
        idcategoria: 7,
        precio_venta: 18.0,
        stock: 10,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: "Vino Tinto Reserva",
        codigo: "ART013",
        idcategoria: 8,
        precio_venta: 25.0,
        stock: 25,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: "Yogur Natural",
        codigo: "ART014",
        idcategoria: 9,
        precio_venta: 2.5,
        stock: 100,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: "Leche Entera",
        codigo: "ART015",
        idcategoria: 9,
        precio_venta: 1.5,
        stock: 150,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: "Huevos (docena)",
        codigo: "ART016",
        idcategoria: 9,
        precio_venta: 3.5,
        stock: 80,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: "Aceite de Oliva",
        codigo: "ART017",
        idcategoria: 3,
        precio_venta: 8.0,
        stock: 40,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: "Arroz Blanco",
        codigo: "ART018",
        idcategoria: 3,
        precio_venta: 2.0,
        stock: 120,
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: "Pasta Integral",
        codigo: "ART019",
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
      codigo: art.codigo + "-T2",
      id_tenant: 2,
      id_store: 3,
    }));
    await db.articulo.bulkCreate(articurosT2, { ignoreDuplicates: true });

    console.log("✅ Artículos creados (19 x 2 tenants = 38 total)");

    // 8. CLIENTES DE PRUEBA (PERSISTIR NOMBRE, TELÉFONO, DIRECCIÓN)
    const clienteSeeds = [
      {
        nombre: 'Juan Cliente García',
        email: 'cliente@test.com',
        telefono: '555-0003',
        direccion: 'Calle Principal 123',
      },
      {
        nombre: 'María Premium López',
        email: 'premium@test.com',
        telefono: '555-0004',
        direccion: 'Avenida Central 456',
      },
      {
        nombre: 'Empleado García Centro',
        email: 'empleado@test.com',
        telefono: '555-0002',
        direccion: 'García Centro',
      },
    ];

    for (const clienteSeed of clienteSeeds) {
      const existingCliente = await (db.cliente as any).findOne({
        where: { email: clienteSeed.email },
      });

      if (existingCliente) {
        await existingCliente.update({
          nombre: clienteSeed.nombre,
          telefono: clienteSeed.telefono,
          direccion: clienteSeed.direccion,
        });
      } else {
        await (db.cliente as any).create(clienteSeed);
      }
    }

    // 9. PEDIDOS DE PRUEBA (TODOS EN NUEVO)
    const userByEmail: Record<string, any> = {};
    const clienteByEmail: Record<string, any> = {};

    for (const email of ['cliente@test.com', 'premium@test.com', 'empleado@test.com']) {
      userByEmail[email] = await (db.usuario as any).findOne({ where: { email } });
      clienteByEmail[email] = await (db.cliente as any).findOne({ where: { email } });
    }

    const articuloByCodigo: Record<string, any> = {};
    for (const codigo of ['ART001', 'ART004', 'ART007', 'ART010']) {
      articuloByCodigo[codigo] = await (db.articulo as any).findOne({ where: { codigo } });
    }

    const testVentas = [
      {
        key: '000001',
        emailUsuario: 'cliente@test.com',
        emailCliente: 'cliente@test.com',
        fecha: new Date('2026-02-15T10:30:00'),
        items: [
          { codigo: 'ART001', cantidad: 2 },
          { codigo: 'ART004', cantidad: 1 },
        ],
      },
      {
        key: '000002',
        emailUsuario: 'premium@test.com',
        emailCliente: 'premium@test.com',
        fecha: new Date('2026-02-16T12:10:00'),
        items: [
          { codigo: 'ART007', cantidad: 3 },
          { codigo: 'ART010', cantidad: 1 },
        ],
      },
      {
        key: '000003',
        emailUsuario: 'empleado@test.com',
        emailCliente: 'empleado@test.com',
        fecha: new Date('2026-02-16T17:45:00'),
        items: [
          { codigo: 'ART004', cantidad: 2 },
          { codigo: 'ART001', cantidad: 1 },
        ],
      },
    ];

    for (const ventaSeed of testVentas) {
      const usuario = userByEmail[ventaSeed.emailUsuario];
      const cliente = clienteByEmail[ventaSeed.emailCliente];
      if (!usuario || !cliente) {
        continue;
      }

      let subtotal = 0;
      const detalleRows: Array<{ idarticulo: number; cantidad: number; precio: number; descuento: number }> = [];

      for (const item of ventaSeed.items) {
        const articulo = articuloByCodigo[item.codigo];
        if (!articulo) {
          continue;
        }
        const precio = Number(articulo.precio_venta || 0);
        subtotal += precio * item.cantidad;
        detalleRows.push({
          idarticulo: articulo.idarticulo,
          cantidad: item.cantidad,
          precio,
          descuento: 0,
        });
      }

      if (!detalleRows.length) {
        let fallbackArticulo = await (db.articulo as any).findOne({
          where: { id_tenant: usuario.id_tenant || 1 },
          order: [['idarticulo', 'ASC']],
        });

        if (!fallbackArticulo) {
          fallbackArticulo = await (db.articulo as any).findOne({
            order: [['idarticulo', 'ASC']],
          });
        }

        if (fallbackArticulo) {
          const fallbackPrecio = Number(fallbackArticulo.precio_venta || 0);
          subtotal = fallbackPrecio;
          detalleRows.push({
            idarticulo: fallbackArticulo.idarticulo,
            cantidad: 1,
            precio: fallbackPrecio,
            descuento: 0,
          });
        }
      }

      const impuesto = Number((subtotal * 0.18).toFixed(2));
      const total = Number((subtotal + impuesto).toFixed(2));

      const existingVenta = await (db.venta as any).findOne({
        where: { num_comprobante: ventaSeed.key },
      });

      let ventaRecord = existingVenta;
      if (existingVenta) {
        await existingVenta.update({
          idcliente: cliente.idcliente,
          idusuario: usuario.idusuario,
          fecha_hora: ventaSeed.fecha,
          impuesto,
          total,
          estado: 'NUEVO',
          cliente_nombre: String(cliente.nombre || usuario.nombre || '').trim() || null,
          cliente_telefono: String(cliente.telefono || usuario.telefono || '').trim() || null,
          cliente_direccion: String(cliente.direccion || usuario.direccion || '').trim() || null,
        });
      } else {
        ventaRecord = await (db.venta as any).create({
          idcliente: cliente.idcliente,
          idusuario: usuario.idusuario,
          tipo_comprobante: 'FACTURA',
          serie_comprobante: 'F001',
          num_comprobante: ventaSeed.key,
          fecha_hora: ventaSeed.fecha,
          impuesto,
          total,
          estado: 'NUEVO',
          cliente_nombre: String(cliente.nombre || usuario.nombre || '').trim() || null,
          cliente_telefono: String(cliente.telefono || usuario.telefono || '').trim() || null,
          cliente_direccion: String(cliente.direccion || usuario.direccion || '').trim() || null,
        });
      }

      if (!ventaRecord) {
        continue;
      }

      await (db.detalle_venta as any).destroy({ where: { idventa: ventaRecord.idventa } });
      if (detalleRows.length) {
        await (db.detalle_venta as any).bulkCreate(
          detalleRows.map((row) => ({
            ...row,
            idventa: ventaRecord.idventa,
          })),
        );
      }
    }

    console.log('✅ Pedidos de prueba creados/actualizados (estado NUEVO)');

    console.log("\n✅ ¡Seeder completado exitosamente!");
    console.log("\n📝 Credenciales para pruebas:");
    console.log("   Admin: admin@test.com / admin123 (Tenant 1, Store 1)");
    console.log("   Empleado: empleado@test.com / emp123 (Tenant 2, Store 3)");
    console.log("   Cliente: cliente@test.com / cli123 (Tenant 2, Store 3)");
    console.log("   Premium: premium@test.com / pre123 (Tenant 3, Store 4)");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error en seeder:", error);
    process.exit(1);
  }
}

// Ejecutar seeder
seedDatabase();
