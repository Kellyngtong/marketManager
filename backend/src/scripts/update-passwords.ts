import bcrypt from 'bcrypt';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { initializeDatabase } from '@db/index';
import db from '@db/index';

const updatePasswordsForUsers = async (): Promise<void> => {
  try {
    // Inicializar base de datos
    await initializeDatabase();
    const Usuario = (db.usuario as any);

    // Usuarios a actualizar con sus nuevas contraseñas
    const usersToUpdate = [
      { email: 'empleado@marketmanager.com', newPassword: 'empleado123' },
      { email: 'admin@test.com', newPassword: 'admin123' },
      { email: 'admin@marketmanager.com', newPassword: 'admin123' },
    ];

    for (const { email, newPassword } of usersToUpdate) {
      const user = await Usuario.findOne({ where: { email } });
      
      if (!user) {
        console.log(`❌ Usuario no encontrado: ${email}`);
        continue;
      }

      // Hash la nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Actualizar en la base de datos
      await user.update({ clave: hashedPassword });
      
      console.log(`✅ Contraseña actualizada para: ${email}`);
    }

    console.log('\n✅ Todas las contraseñas han sido actualizadas correctamente.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al actualizar contraseñas:', error);
    process.exit(1);
  }
};

updatePasswordsForUsers();
