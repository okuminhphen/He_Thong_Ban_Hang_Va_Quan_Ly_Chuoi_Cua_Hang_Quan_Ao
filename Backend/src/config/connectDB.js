const { Sequelize } = require("sequelize");
const sequelize = new Sequelize("btl_tmdt", "root", null, {
    host: "localhost",
    dialect: "mysql",
    timezone: "+07:00",
});
const connection = async () => {
    console.log("Connecting to the database...");
    try {
        await sequelize.authenticate();
        console.log("Connection has been established successfully.");
        await sequelize.sync({ alter: true });
        console.log("✅ Đồng bộ models thành công");
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
};
export default connection;
