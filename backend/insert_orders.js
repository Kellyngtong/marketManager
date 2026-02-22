const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, ".env") });

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Insertar pedidos
    const ventas = [
      {
        id_tenant: 1,
        id_store: 1,
        idcliente: 1,
        idusuario: 100,
        tipo_comprobante: "FACTURA",
        serie_comprobante: "F001",
        num_comprobante: "000001",
        fecha_hora: "2026-02-15 10:30:00",
        impuesto: 21.5,
        total: 125.5,
        estado: "COMPLETADO",
      },
      {
        id_tenant: 1,
        id_store: 1,
        idcliente: 2,
        idusuario: 101,
        tipo_comprobante: "FACTURA",
        serie_comprobante: "F001",
        num_comprobante: "000002",
        fecha_hora: "2026-02-16 14:15:00",
        impuesto: 18.9,
        total: 95.5,
        estado: "COMPLETADO",
      },
      {
        id_tenant: 1,
        id_store: 1,
        idcliente: 3,
        idusuario: 102,
        tipo_comprobante: "FACTURA",
        serie_comprobante: "F001",
        num_comprobante: "000003",
        fecha_hora: "2026-02-16 16:45:00",
        impuesto: 25.2,
        total: 156.8,
        estado: "PENDIENTE",
      },
      {
        id_tenant: 1,
        id_store: 1,
        idcliente: 1,
        idusuario: 101,
        tipo_comprobante: "FACTURA",
        serie_comprobante: "F001",
        num_comprobante: "000004",
        fecha_hora: "2026-02-17 09:00:00",
        impuesto: 15.3,
        total: 78.5,
        estado: "COMPLETADO",
      },
      {
        id_tenant: 1,
        id_store: 1,
        idcliente: 2,
        idusuario: 100,
        tipo_comprobante: "FACTURA",
        serie_comprobante: "F001",
        num_comprobante: "000005",
        fecha_hora: "2026-02-17 11:20:00",
        impuesto: 32.4,
        total: 189.75,
        estado: "ENVIADO",
      },
    ];

    for (const venta of ventas) {
      try {
        await connection.execute(
          `INSERT INTO venta (id_tenant, id_store, idcliente, idusuario, tipo_comprobante, serie_comprobante, num_comprobante, fecha_hora, impuesto, total, estado)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            venta.id_tenant,
            venta.id_store,
            venta.idcliente,
            venta.idusuario,
            venta.tipo_comprobante,
            venta.serie_comprobante,
            venta.num_comprobante,
            venta.fecha_hora,
            venta.impuesto,
            venta.total,
            venta.estado,
          ],
        );
      } catch (err) {
        if (!err.message.includes("Duplicate entry")) {
          throw err;
        }
      }
    }

    connection.end();
  } catch (error) {
    console.error("Error:", error.message);
  }
})();
