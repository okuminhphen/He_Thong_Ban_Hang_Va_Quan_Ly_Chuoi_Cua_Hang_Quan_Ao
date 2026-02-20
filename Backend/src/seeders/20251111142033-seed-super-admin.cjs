"use strict";
const bcrypt = require("bcryptjs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync("123456", salt);

        // 1. Tạo role SUPER_ADMIN nếu chưa có
        const [role] = await queryInterface.sequelize.query(
            `SELECT id FROM role WHERE name='SUPER_ADMIN' LIMIT 1;`
        );

        let roleId;
        if (role.length > 0) {
            roleId = role[0].id;
        } else {
            await queryInterface.bulkInsert("role", [
                {
                    name: "SUPER_ADMIN",
                    description: "Admin tổng hệ thống",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ]);

            // Lấy lại id mới insert
            const [newRole] = await queryInterface.sequelize.query(
                `SELECT id FROM role WHERE name='SUPER_ADMIN' LIMIT 1;`
            );
            roleId = newRole[0].id;
        }

        // 2. Thêm admin mặc định
        await queryInterface.bulkInsert("Admins", [
            {
                fullname: "Admin Tổng",
                username: "admin",
                email: "leminhphung8282003@gmail.com",
                password: hashPassword,
                phone: "0962511569",
                roleId: roleId,
                status: "ACTIVE",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete(
            "Admins",
            { email: "leminhphung8282003@gmail.com" },
            {}
        );
        await queryInterface.bulkDelete("role", { name: "SUPER_ADMIN" }, {});
    },
};
