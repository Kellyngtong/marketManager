const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

/**
 * Descubre y ejecuta migraciones en orden secuencial
 * Las migraciones deben estar nombradas con formato: NN_nombre.sql (01_, 02_, etc.)
 */
async function discoverAndRunMigrations() {
  try {
    // Conectar a MySQL sin especificar BD
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      multipleStatements: true,
    });

    console.log("✅ Conectado a MySQL");

    // Leer archivos de migración
    const migrationsDir = path.join(__dirname, "..", "migrations");

    if (!fs.existsSync(migrationsDir)) {
      console.warn("⚠️  Carpeta de migraciones no encontrada:", migrationsDir);
      await connection.end();
      return;
    }

    // Obtener todos los archivos .sql y ordenarlos
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort(); // Ordena por nombre: 01_, 02_, etc.

    if (migrationFiles.length === 0) {
      console.warn("⚠️  No se encontraron archivos de migración");
      await connection.end();
      return;
    }

    console.log(`📁 Encontradas ${migrationFiles.length} migraciones`);
    console.log("📝 Ejecutando migraciones en orden...\n");

    let successCount = 0;

    // Ejecutar cada migración en orden
    for (const migrationFile of migrationFiles) {
      const migrationPath = path.join(migrationsDir, migrationFile);
      const sqlContent = fs.readFileSync(migrationPath, "utf8");

      try {
        console.log(`⏳ Ejecutando: ${migrationFile}`);
        await connection.query(sqlContent);
        successCount++;
        console.log(`✅ ${migrationFile} completada\n`);
      } catch (error) {
        // Ignorar algunos errores comunes durante ALTER TABLE
        if (
          error.message.includes("Duplicate column") ||
          error.message.includes("already exists") ||
          error.message.includes("Duplicate key")
        ) {
          console.log(
            `⚠️  ${migrationFile} - Columnas/índices ya existen (ignorado)\n`,
          );
          successCount++;
        } else {
          console.error(`❌ Error en ${migrationFile}:`, error.message);
          throw error;
        }
      }
    }

    console.log(
      `\n✅ Todas las migraciones completadas (${successCount}/${migrationFiles.length})`,
    );
    console.log("📦 Base de datos actualizada exitosamente");

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
  discoverAndRunMigrations();
}

module.exports = {
  discoverAndRunMigrations,
  runMigrations: discoverAndRunMigrations,
};
