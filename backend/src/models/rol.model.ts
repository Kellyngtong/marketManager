import { DataTypes, Model, Sequelize } from 'sequelize';

export class Rol extends Model {
  public idrol!: number;
  public nombre!: string;
  public descripcion?: string;
  public condicion!: boolean;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  Rol.init(
    {
      idrol: {
        type: dataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: dataTypes.STRING(30),
        allowNull: false,
        unique: true,
      },
      descripcion: {
        type: dataTypes.STRING(256),
        allowNull: true,
      },
      condicion: {
        type: dataTypes.BOOLEAN,
        defaultValue: 1,
      },
    },
    {
      sequelize,
      timestamps: false,
      tableName: 'rol',
      modelName: 'Rol',
    }
  );

  return Rol;
};
