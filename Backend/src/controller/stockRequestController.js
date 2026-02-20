import stockRequestService from "../service/stockRequestService.js";
import { clearCacheByPattern } from "../utils/cacheHelper.js";

const getMyStockRequests = async (req, res) => {
    try {
        const branchId = req.params.branchId;
        const data = await stockRequestService.getStockRequestsByBranch(
            branchId
        );
        return res.status(200).json(data);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: "Server error",
            EC: -1,
            DT: "",
        });
    }
};
const createStockRequest = async (req, res) => {
    try {
        const payload = {
            ...req.body,
        };

        const data = await stockRequestService.createStockRequest(payload);

        await clearCacheByPattern("stock-request:*");

        return res.status(200).json(data);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: "Server error",
            EC: -1,
            DT: "",
        });
    }
};
const updateStockRequestInfo = async (req, res) => {
    try {
        const payload = {
            ...req.body,
        };

        const data = await stockRequestService.updateStockRequestInfo(
            req.params.id,
            payload
        );

        await clearCacheByPattern("stock-request:*");
        await clearCacheByPattern(`stock-request:${req.params.id}*`);

        return res.status(200).json(data);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: "Server error",
            EC: -1,
            DT: "",
        });
    }
};
const deleteStockRequest = async (req, res) => {
    try {
        const data = await stockRequestService.deleteStockRequest(
            req.params.id,
            req.body.deletedBy
        );

        await clearCacheByPattern("stock-request:*");
        await clearCacheByPattern(`stock-request:${req.params.id}*`);

        return res.status(200).json(data);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: "Server error",
            EC: -1,
            DT: "",
        });
    }
};
const getPendingStockRequests = async (req, res) => {
    try {
        const data = await stockRequestService.getPendingStockRequests();

        return res.status(200).json(data);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: "Server error",
            EC: -1,
            DT: "",
        });
    }
};

const approveStockRequest = async (req, res) => {
    try {
        const data = await stockRequestService.approveStockRequest(
            req.params.id,
            req.user.id
        );

        await clearCacheByPattern("stock-request:*");
        await clearCacheByPattern(`stock-request:${req.params.id}*`);
        await clearCacheByPattern("transfer-receipt:*");

        return res.status(200).json(data);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: "Server error",
            EC: -1,
            DT: "",
        });
    }
};

const rejectStockRequest = async (req, res) => {
    try {
        const { note } = req.body;

        const data = await stockRequestService.rejectStockRequest(
            req.params.id,
            req.user.id,
            note
        );

        await clearCacheByPattern("stock-request:*");
        await clearCacheByPattern(`stock-request:${req.params.id}*`);

        return res.status(200).json(data);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: "Server error",
            EC: -1,
            DT: "",
        });
    }
};

export default {
    // branch admin
    getMyStockRequests,
    createStockRequest,
    updateStockRequestInfo,
    deleteStockRequest,

    // super admin
    getPendingStockRequests,
    approveStockRequest,
    rejectStockRequest,
};
