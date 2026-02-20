import userBehaviorService from "../service/userBehaviorService.js";

const addViewFunc = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId; // sau này lấy từ token

        const { productId } = req.params;

        const response = await userBehaviorService.addView(userId, productId);
        return res.status(200).json(response);
    } catch (error) {
        console.error("Error in addView:", error);
        return res.status(500).json({
            EM: "Internal server error",
            EC: 1,
            DT: [],
        });
    }
};

const toggleLikeFunc = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId;
        const { productId } = req.params;

        const response = await userBehaviorService.toggleLike(
            userId,
            productId
        );
        return res.status(200).json(response);
    } catch (error) {
        console.error("Error in toggleLike:", error);
        return res.status(500).json({
            EM: "Internal server error",
            EC: 1,
            DT: [],
        });
    }
};

const getLikeStatusFunc = async (req, res) => {
    try {
        const userId = req.user?.id || req.query.userId;

        const { productId } = req.params;
        if (!userId || !productId) {
            return res.status(400).json({
                EC: 1,
                EM: "Missing userId or productId",
                DT: null,
            });
        }
        const response = await userBehaviorService.getLikeStatus(
            userId,
            productId
        );
        return res.status(200).json({
            EC: 0,
            EM: "Get like status success",
            DT: response,
        });
    } catch (error) {
        console.error("Error get like status:", error);
        return res.status(500).json({
            EM: "Internal server error",
            EC: 1,
            DT: [],
        });
    }
};

export default {
    addViewFunc,
    toggleLikeFunc,
    getLikeStatusFunc,
};
