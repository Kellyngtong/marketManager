const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function runMigrations() {
  try {
    // Conectar a MySQL sin especificar BD
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      multipleStatements: true,
    });

    console.log("✅ Conectado a MySQL");

    // Leer archivo SQL
    const sqlPath = path.join(__dirname, "..", "sql", "01_schema_mvp.sql");
    const sqlContent = fs.readFileSync(sqlPath, "utf8");

    console.log("📝 Ejecutando migraciones...");
    
    // Ejecutar todas las sentencias SQL
    await connection.query(sqlContent);

    console.log("✅ Migraciones completadas exitosamente");
    console.log("📦 Base de datos 'market_manager' recreada");

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al ejecutar migraciones:", error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
  runMigrations();
}

module.exports = { runMigrations };
