import userApiService from "../service/userApiService.js";
import { clearCacheByPattern } from "../utils/cacheHelper.js";

const readFunc = async (req, res) => {
    try {
        if (req.query.page && req.query.limit) {
            let page = req.query.page;
            let limit = req.query.limit;
            console.log(`page= ${page} and limit= ${limit}`);
            let data = await userApiService.getUsersWithPagination(
                +page,
                +limit
            );
            return res.status(200).json({
                EM: data.EM, // error message
                EC: data.EC, //error code
                DT: data.DT, // Date
            });
        } else {
            let data = await userApiService.getAllUsers();
            return res.status(200).json({
                EM: data.EM, // error message
                EC: data.EC, //error code
                DT: data.DT, // Data
            });
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: "error", // error message
            EC: "-1", //error code
            DT: "", // Date
        });
    }
};
const createFunc = async (req, res) => {
    try {
        let user = req.body;
        let data = await userApiService.createNewUser(user);

        // Xóa cache liên quan đến users
        await clearCacheByPattern("user:*");

        return res.status(200).json({
            EM: data.EM, // error message
            EC: data.EC, //error code
            DT: data.DT, // Data
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: "error", // error message
            EC: "-1", //error code
            DT: "", // Data
        });
    }
};
const updateFunc = async (req, res) => {
    try {
        let userId = req.params.userId;
        let userData = req.body;
        let data = await userApiService.updateUserById(userId, userData);

        // Xóa cache liên quan đến users
        await clearCacheByPattern("user:*");
        if (userId) {
            await clearCacheByPattern(`user:${userId}*`);
        }

        return res.status(200).json({
            EM: data.EM, // error message
            EC: data.EC, //error code
            DT: data.DT, // Data
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: "error", // error message
            EC: "-1", //error code
            DT: "", // Date
        });
    }
};
const updateUserByAdminFunc = async (req, res) => {
    try {
        let userId = req.params.userId;
        let userData = req.body;
        let data = await userApiService.updateUserByAdmin(userId, userData);

        // Xóa cache liên quan đến users
        await clearCacheByPattern("user:*");
        if (userId) {
            await clearCacheByPattern(`user:${userId}*`);
        }

        return res.status(200).json({
            EM: data.EM, // error message
            EC: data.EC, //error code
            DT: data.DT, // Data
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: "error", // error message
            EC: "-1", //error code
            DT: "", // Date
        });
    }
};
const deleteFunc = async (req, res) => {
    try {
        let userId = req.params.userId;

        let data = await userApiService.deleteUser(userId);

        // Xóa cache liên quan đến users
        await clearCacheByPattern("user:*");
        if (userId) {
            await clearCacheByPattern(`user:${userId}*`);
        }

        return res.status(200).json({
            EM: data.EM, // error message
            EC: data.EC, //error code
            DT: data.DT, // Data
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: "error", // error message
            EC: "-1", //error code
            DT: "", // Date
        });
    }
};
const getUserFunc = async (req, res) => {
    try {
        let userId = req.params.id;
        let data = await userApiService.getUserById(userId);
        return res.status(200).json({
            EM: data.EM, // error message
            EC: data.EC, //error code
            DT: data.DT, // Data
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            EM: "error", // error message
            EC: "-1", //error code
            DT: "", // Date
        });
    }
};
const updatePasswordFunc = async (req, res) => {
    try {
        let userId = req.params.id;
        let passwordData = req.body;

        let data = await userApiService.updatePasswordById(
            userId,
            passwordData
        );
        return res.status(200).json({
            EM: data.EM, // error message
            EC: data.EC, //error code
            DT: data.DT, // Data
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            EM: "error", // error message
            EC: "-1", //error code
            DT: "", // Date
        });
    }
};
const getAllUsersFunc = async (req, res) => {
    try {
        let data = await userApiService.getAllUsers();
        return res.status(200).json({
            EM: data.EM, // error message
            EC: data.EC, //error code
            DT: data.DT, // Data
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            EM: "error", // error message
            EC: "-1", //error code
            DT: "", // Date
        });
    }
};

export default {
    readFunc,
    createFunc,
    updateFunc,
    deleteFunc,
    getUserFunc,
    updatePasswordFunc,
    getAllUsersFunc,
    updateUserByAdminFunc,
};
