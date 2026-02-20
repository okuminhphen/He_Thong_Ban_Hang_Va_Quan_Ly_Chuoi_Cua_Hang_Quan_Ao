"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
    class Cart extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Cart.belongsTo(models.User, { foreignKey: "userId" });

            Cart.belongsToMany(models.ProductSize, {
                through: "CartProductSize",
                foreignKey: "cartId",
            });
        }
    }
    Cart.init(
        {
            name: DataTypes.STRING,
            description: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: "Cart",
        }
    );
    return Cart;
};
