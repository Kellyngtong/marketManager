import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export async function discoverAndRunMigrations(): Promise<void> {
  try {
    // Conectar a MySQL
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true,
    });

    console.log('✅ Conectado a MySQL');

    // Leer archivos de migración
    const migrationsDir = path.join(__dirname, '../../migrations');

    if (!fs.existsSync(migrationsDir)) {
      console.warn('⚠️  Carpeta de migraciones no encontrada:', migrationsDir);
      await connection.end();
      return;
    }

    // Obtener archivos SQL ordenados
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    if (migrationFiles.length === 0) {
      console.warn('⚠️  No se encontraron archivos de migración');
      await connection.end();
      return;
    }

    console.log(`📁 Encontradas ${migrationFiles.length} migraciones`);
    console.log('📝 Ejecutando migraciones en orden...\n');

    let successCount = 0;

    // Ejecutar cada migración
    for (const migrationFile of migrationFiles) {
      const migrationPath = path.join(migrationsDir, migrationFile);
      const sqlContent = fs.readFileSync(migrationPath, 'utf8');

      try {
        console.log(`⏳ Ejecutando: ${migrationFile}`);
        await connection.query(sqlContent);
        successCount++;
        console.log(`✅ ${migrationFile} completada\n`);
      } catch (error: any) {
        if (
          error.message.includes('Duplicate column') ||
          error.message.includes('already exists') ||
          error.message.includes('Duplicate key')
        ) {
          console.log(`⚠️  ${migrationFile} - Columnas/índices ya existen (ignorado)\n`);
          successCount++;
        } else {
          console.error(`❌ Error en ${migrationFile}:`, error.message);
          throw error;
        }
      }
    }

    console.log(
      `\n✅ Todas las migraciones completadas (${successCount}/${migrationFiles.length})`
    );
    console.log('📦 Base de datos actualizada exitosamente');

    await connection.end();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error al ejecutar migraciones:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  discoverAndRunMigrations();
}

export { discoverAndRunMigrations as runMigrations };
