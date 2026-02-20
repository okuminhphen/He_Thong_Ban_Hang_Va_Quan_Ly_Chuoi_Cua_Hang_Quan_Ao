import orderService from "../service/orderService.js";
import { clearCacheByPattern } from "../utils/cacheHelper.js";
const readFunc = async (req, res) => {
    try {
        let data = await orderService.getAllOrders();
        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            EM: "Error from controller",
            EC: "-1",
            DT: "",
        });
    }
};
const createFunc = async (req, res) => {
    try {
        let orderData = req.body;
        let data = await orderService.createOrder(orderData);

        // Xóa cache liên quan đến orders
        await clearCacheByPattern("order:*");
        if (orderData.userId) {
            await clearCacheByPattern(`order:user:${orderData.userId}*`);
        }

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            EM: "Error from controller",
            EC: "-1",
            DT: "",
        });
    }
};
const updateFunc = async (req, res) => {
    try {
        let orderId = req.body.id;
        let orderData = req.body;
        let data = await orderService.updateOrder(orderId, orderData);

        // Xóa cache liên quan đến orders
        await clearCacheByPattern("order:*");
        if (orderId) {
            await clearCacheByPattern(`order:${orderId}*`);
        }

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            EM: "Error from controller",
            EC: "-1",
            DT: "",
        });
    }
};
const deleteFunc = async (req, res) => {
    try {
        let orderId = req.body.id;

        let data = await orderService.deleteOrder(orderId);

        // Xóa cache liên quan đến orders
        await clearCacheByPattern("order:*");
        if (orderId) {
            await clearCacheByPattern(`order:${orderId}*`);
        }

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            EM: "Error from controller",
            EC: "-1",
            DT: "",
        });
    }
};
const readByUserIdFunc = async (req, res) => {
    try {
        let userId = req.params.userId;
        console.log(userId);
        let data = await orderService.getOrdersByUserId(userId);
        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            EM: "Error from controller",
            EC: "-1",
            DT: "",
        });
    }
};
const updateStatusFunc = async (req, res) => {
    try {
        let orderId = req.params.orderId;
        let updatedData = req.body.status;

        let data = await orderService.updateOrderStatus(orderId, updatedData);

        // Xóa cache liên quan đến orders
        await clearCacheByPattern("order:*");
        if (orderId) {
            await clearCacheByPattern(`order:${orderId}*`);
        }

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            EM: "Error from controller",
            EC: "-1",
            DT: "",
        });
    }
};

const readByBranchIdFunc = async (req, res) => {
    try {
        let branchId = req.params.branchId;
        let data = await orderService.getOrdersByBranchId(branchId);
        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            EM: "Error from controller",
            EC: "-1",
            DT: "",
        });
    }
};
const createAtBranchFunc = async (req, res) => {
    try {
        let orderData = req.body;
        let data = await orderService.createOrderAtBranch(orderData);

        // Xóa cache liên quan đến orders
        await clearCacheByPattern("order:*");
        if (orderData.branchId) {
            await clearCacheByPattern(`order:branch:${orderData.branchId}*`);
        }

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            EM: "Error from controller",
            EC: "-1",
            DT: "",
        });
    }
};

export default {
    readFunc,
    createFunc,
    updateFunc,
    deleteFunc,
    readByUserIdFunc,
    updateStatusFunc,
    readByBranchIdFunc,
    createAtBranchFunc,
};
