import { DataTypes, Model, Sequelize } from 'sequelize';

export class Usuario extends Model {
  public idusuario!: number;
  public idrol!: number;
  public nombre!: string;
  public tipo_documento?: string;
  public num_documento?: string;
  public direccion?: string;
  public telefono?: string;
  public email!: string;
  public clave!: string;
  public avatar?: string;
  public condicion!: boolean;
  public id_tenant?: number;
  public id_store?: number;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  Usuario.init(
    {
      idusuario: {
        type: dataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      idrol: {
        type: dataTypes.INTEGER,
        allowNull: false,
      },
      nombre: {
        type: dataTypes.STRING(100),
        allowNull: false,
      },
      tipo_documento: {
        type: dataTypes.STRING(20),
        allowNull: true,
      },
      num_documento: {
        type: dataTypes.STRING(20),
        allowNull: true,
      },
      direccion: {
        type: dataTypes.STRING(70),
        allowNull: true,
      },
      telefono: {
        type: dataTypes.STRING(20),
        allowNull: true,
      },
      email: {
        type: dataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      clave: {
        type: dataTypes.STRING(255),
        allowNull: false,
      },
      avatar: {
        type: dataTypes.STRING(255),
        allowNull: true,
      },
      condicion: {
        type: dataTypes.BOOLEAN,
        defaultValue: 1,
      },
      id_tenant: {
        type: dataTypes.INTEGER,
        allowNull: true,
      },
      id_store: {
        type: dataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      timestamps: false,
      tableName: 'usuario',
      modelName: 'Usuario',
    }
  );

  return Usuario;
};
