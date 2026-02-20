import redisClient from "../config/redis.js";

export const cache = (keyPrefix) => async (req, res, next) => {
    try {
        // Tạo cache key dựa trên prefix và params/query
        let key = keyPrefix;
        if (req.params.id) {
            key = `${keyPrefix}:${req.params.id}`;
        } else if (req.params.userId) {
            key = `${keyPrefix}:${req.params.userId}`;
        } else if (req.params.branchId) {
            key = `${keyPrefix}:${req.params.branchId}`;
        } else if (req.params.productId) {
            key = `${keyPrefix}:${req.params.productId}`;
        } else if (req.params.categoryId) {
            key = `${keyPrefix}:${req.params.categoryId}`;
        } else if (req.params.adminId) {
            key = `${keyPrefix}:${req.params.adminId}`;
        } else if (req.params.employeeId) {
            key = `${keyPrefix}:${req.params.employeeId}`;
        } else if (req.query.userId) {
            key = `${keyPrefix}:${req.query.userId}`;
        } else {
            key = `${keyPrefix}:all`;
        }

        const cachedData = await redisClient.get(key);

        if (cachedData) {
            return res.json(JSON.parse(cachedData));
        }

        // Lưu response gốc
        const originalJson = res.json.bind(res);

        // Override res.json để cache response
        res.json = async (body) => {
            try {
                await redisClient.set(key, JSON.stringify(body), { EX: 300 }); // TTL 5 phút
            } catch (error) {
                console.error("Error caching data:", error);
            }
            originalJson(body);
        };

        next();
    } catch (error) {
        console.error("Cache middleware error:", error);
        next();
    }
};
