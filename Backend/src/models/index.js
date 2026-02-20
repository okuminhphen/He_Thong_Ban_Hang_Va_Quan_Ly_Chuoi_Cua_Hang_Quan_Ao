"use strict";

import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { Sequelize } from "sequelize";
import { fileURLToPath } from "url";
import { dirname } from "path";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";

// Đọc config.json
const configJson = JSON.parse(
    fs.readFileSync(new URL("../config/config.json", import.meta.url))
);
const config = configJson[env];

const db = {};

let sequelize;
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    sequelize = new Sequelize(
        config.database,
        config.username,
        config.password,
        config
    );
}

// Load models
const modelFiles = fs
    .readdirSync(__dirname)
    .filter((file) => file.endsWith(".js") && file !== basename);

async function loadModels() {
    // 1️⃣ Khởi tạo models trước
    for (const file of modelFiles) {
        const { default: modelFn } = await import(
            `file://${path.join(__dirname, file)}`
        );
        const modelInstance = modelFn(sequelize, Sequelize.DataTypes); // Gọi hàm để lấy model instance

        db[modelInstance.name] = modelInstance; // Lưu vào db với tên instance
    }

    // 2️⃣ Gọi associate sau khi tất cả models đã khởi tạo
    Object.keys(db).forEach((modelName) => {
        if (db[modelName].associate) {
            db[modelName].associate(db);
        }
    });

    db.sequelize = sequelize;
    db.Sequelize = Sequelize;
}

await loadModels();

export default db;
