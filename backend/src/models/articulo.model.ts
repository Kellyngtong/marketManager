import { DataTypes, Model, Sequelize } from 'sequelize';

export class Articulo extends Model {
  public idarticulo!: number;
  public idcategoria!: number;
  public codigo?: string;
  public nombre!: string;
  public tipo!: string;
  public precio_venta!: number;
  public stock!: number;
  public oferta!: boolean;
  public descripcion?: string;
  public imagen?: string;
  public condicion!: boolean;
  public id_tenant?: number;
  public id_store?: number;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  Articulo.init(
    {
      idarticulo: {
        type: dataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      idcategoria: {
        type: dataTypes.INTEGER,
        allowNull: false,
      },
      codigo: {
        type: dataTypes.STRING(50),
        allowNull: true,
        unique: true,
      },
      nombre: {
        type: dataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      tipo: {
        type: dataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'general',
      },
      precio_venta: {
        type: dataTypes.DECIMAL(11, 2),
        allowNull: false,
      },
      stock: {
        type: dataTypes.INTEGER,
        defaultValue: 0,
      },
      oferta: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      descripcion: {
        type: dataTypes.STRING(256),
        allowNull: true,
      },
      imagen: {
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
      tableName: 'articulo',
      modelName: 'Articulo',
    }
  );

  return Articulo;
};
