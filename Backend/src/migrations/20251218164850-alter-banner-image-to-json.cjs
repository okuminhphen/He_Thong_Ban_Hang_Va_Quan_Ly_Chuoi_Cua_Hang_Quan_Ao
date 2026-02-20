"use strict";

/** @type {import('sequelize-cli').Migration} */
"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn("Banner", "image", {
            type: Sequelize.JSON,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn("Banner", "image", {
            type: Sequelize.STRING,
            allowNull: true,
        });
    },
};
