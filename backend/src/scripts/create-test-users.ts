import bcrypt from 'bcrypt';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { initializeDatabase } from '@db/index';
import db from '@db/index';

const createMissingUsers = async (): Promise<void> => {
  try {
    // Inicializar base de datos
    await initializeDatabase();
    const Usuario = (db.usuario as any);
    const Rol = (db.rol as any);

    // Obtener roles
    const roleMap: any = {};
    const roles = await Rol.findAll();
    roles.forEach((role: any) => {
      roleMap[role.nombre.toLowerCase()] = role.idrol;
    });

    console.log('Roles disponibles:', roleMap);

    // Usuarios a crear/actualizar
    const usersToCreate = [
      {
        nombre: 'Empleado Test',
        email: 'empleado@test.com',
        clave: 'emp123',
        rolName: 'empleado',
        idrol: roleMap['empleado'],
        id_tenant: 1,
        id_store: 1,
      },
      {
        nombre: 'Premium User',
        email: 'premium@test.com',
        clave: 'pre123',
        rolName: 'premium',
        idrol: roleMap['premium'],
        id_tenant: 1,
        id_store: 1,
      },
    ];

    for (const userData of usersToCreate) {
      // Buscar si el usuario ya existe
      let user = await Usuario.findOne({ where: { email: userData.email } });

      const hashedPassword = await bcrypt.hash(userData.clave, 10);

      if (user) {
        // Actualizar usuario existente
        await user.update({
          clave: hashedPassword,
          idusuario: user.idusuario,
        });
        console.log(`✅ Contraseña actualizada para: ${userData.email}`);
      } else {
        // Crear nuevo usuario
        await Usuario.create({
          nombre: userData.nombre,
          email: userData.email,
          clave: hashedPassword,
          idusuario: undefined, // Auto increment
          idrol: userData.idrol,
          id_tenant: userData.id_tenant,
          id_store: userData.id_store,
        });
        console.log(`✅ Usuario creado: ${userData.email}`);
      }
    }

    console.log('\n✅ Usuarios configurados correctamente.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createMissingUsers();
