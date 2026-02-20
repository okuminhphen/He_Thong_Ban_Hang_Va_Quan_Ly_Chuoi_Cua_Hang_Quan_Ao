"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        // 🔹 Chỉ thêm adminId — không xóa userId nữa
        await queryInterface.addColumn("Employee", "adminId", {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: "admins", // tên bảng chính xác
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        });
    },

    async down(queryInterface, Sequelize) {
        // rollback → xóa cột adminId
        await queryInterface.removeColumn("Employee", "adminId");
    },
};
