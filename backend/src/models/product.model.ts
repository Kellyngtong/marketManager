import { DataTypes, Model, Sequelize } from 'sequelize';

export class Product extends Model {
  public id?: number;
  public name!: string;
  public description?: string;
  public price!: number;
  public stock!: number;
  public image?: string;
  public filename?: string;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  Product.init(
    {
      name: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: dataTypes.TEXT,
      },
      price: {
        type: dataTypes.FLOAT,
        allowNull: false,
      },
      stock: {
        type: dataTypes.INTEGER,
        defaultValue: 0,
      },
      image: {
        type: dataTypes.STRING,
      },
      filename: {
        type: dataTypes.STRING,
      },
    },
    {
      sequelize,
      timestamps: false,
      tableName: 'product',
      modelName: 'Product',
    }
  );

  return Product;
};
