import { DataTypes, Model, Sequelize } from 'sequelize';

export class Categoria extends Model {
  public idcategoria!: number;
  public nombre!: string;
  public descripcion?: string;
  public condicion!: boolean;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  Categoria.init(
    {
      idcategoria: {
        type: dataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: dataTypes.STRING(50),
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
      tableName: 'categoria',
      modelName: 'Categoria',
    }
  );

  return Categoria;
};
