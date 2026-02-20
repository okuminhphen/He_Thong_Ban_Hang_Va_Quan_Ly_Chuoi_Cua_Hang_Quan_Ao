import sizeService from "../service/sizeService.js";
import { clearCacheByPattern } from "../utils/cacheHelper.js";

const readSizeFunc = async (req, res) => {
    try {
        let data = await sizeService.getAllSizes();
        if (data) {
            return res.status(200).json({
                EM: data.EM, // error message
                EC: data.EC, //error code
                DT: data.DT, // Date
            });
        } else {
            console.log(e);
            return res.status(500).json({
                EM: "error get products", // error message
                EC: "2", //error code
                DT: "", // Date
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
const createSizeFunc = async (req, res) => {
    try {
        let data = await sizeService.createSize(req.body);

        // Xóa cache liên quan đến sizes
        await clearCacheByPattern("size:*");

        return res.status(200).json({
            EM: data.EM, // error message
            EC: data.EC, //error code
            DT: data.DT, // Date
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
const updateSizeFunc = async (req, res) => {
    try {
        let data = await sizeService.updateSize(req.body);

        // Xóa cache liên quan đến sizes
        await clearCacheByPattern("size:*");
        if (req.body.id) {
            await clearCacheByPattern(`size:${req.body.id}*`);
        }

        return res.status(200).json({
            EM: data.EM, // error message
            EC: data.EC, //error code
            DT: data.DT, // Date
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
const deleteSizeFunc = async (req, res) => {
    try {
        let data = await sizeService.deleteSize(req.params.id);

        // Xóa cache liên quan đến sizes
        await clearCacheByPattern("size:*");
        if (req.params.id) {
            await clearCacheByPattern(`size:${req.params.id}*`);
        }

        return res.status(200).json({
            EM: data.EM, // error message
            EC: data.EC, //error code
            DT: data.DT, // Date
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
export default {
    readSizeFunc,
    createSizeFunc,
    updateSizeFunc,
    deleteSizeFunc,
};
