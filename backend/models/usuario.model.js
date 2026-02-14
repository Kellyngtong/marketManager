module.exports = (sequelize, Sequelize) => {
  const Usuario = sequelize.define("usuario", {
    idusuario: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idrol: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    nombre: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
    tipo_documento: {
      type: Sequelize.STRING(20),
      allowNull: true,
    },
    num_documento: {
      type: Sequelize.STRING(20),
      allowNull: true,
    },
    direccion: {
      type: Sequelize.STRING(70),
      allowNull: true,
    },
    telefono: {
      type: Sequelize.STRING(20),
      allowNull: true,
    },
    email: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true,
    },
    clave: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    avatar: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    condicion: {
      type: Sequelize.BOOLEAN,
      defaultValue: 1,
    },
    id_tenant: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    id_store: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
  }, {
    timestamps: false,
    tableName: "usuario",
  });

  return Usuario;
};
