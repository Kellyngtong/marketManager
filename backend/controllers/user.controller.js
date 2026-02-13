const db = require('../models');
const User = db.users;
const Usuario = db.usuario;

exports.updateAvatar = async (req, res) => {
  try {
    const userId = req.userId;
    const { avatar } = req.body;
    if (!avatar) return res.status(400).json({ message: 'avatar is required' });

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.avatar = avatar;
    await user.save();

    // Return updated public user info (without password)
    return res.json({ id: user.id, username: user.username, email: user.email, avatar: user.avatar });
  } catch (err) {
    console.error('Error updating avatar:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ id: user.id, username: user.username, email: user.email, avatar: user.avatar });
  } catch (err) {
    console.error('Error fetching profile:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateUsuario = async (req, res) => {
  try {
    const requesterId = req.idusuario;
    const requesterRol = req.idrol;
    const { id } = req.params;
    const targetId = parseInt(id, 10);

    if (Number.isNaN(targetId)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    if (!requesterId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    if (requesterId !== targetId && requesterRol !== 4) {
      return res.status(403).json({ message: 'Solo el propio usuario o un Admin puede actualizar este perfil' });
    }

    const { nombre, email, telefono, direccion, avatar } = req.body;
    if (!nombre && !email && telefono === undefined && direccion === undefined && avatar === undefined) {
      return res.status(400).json({ message: 'No hay cambios para aplicar' });
    }

    const usuario = await Usuario.findByPk(targetId);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (email && email !== usuario.email) {
      const emailExists = await Usuario.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ message: 'El email ya está en uso' });
      }
      usuario.email = email;
    }

    if (nombre) usuario.nombre = nombre;
    if (telefono !== undefined) usuario.telefono = telefono;
    if (direccion !== undefined) usuario.direccion = direccion;
    if (avatar !== undefined) usuario.avatar = avatar;

    await usuario.save();

    return res.json({
      message: 'Perfil actualizado correctamente',
      usuario: {
        idusuario: usuario.idusuario,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono,
        direccion: usuario.direccion,
        avatar: usuario.avatar,
      },
    });
  } catch (err) {
    console.error('Error en updateUsuario:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};
