import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET || "jwt"; // Dùng biến môi trường

// 1️⃣ Hàm tạo token khi đăng nhập thành công
const generateToken = (user) => {
    return jwt.sign({ userId: user.userId, role: user.role }, SECRET_KEY, {
        expiresIn: "1d",
    });
};

// 2️⃣ Middleware xác thực token từ cookies
const verifyToken = (req, res, next) => {
    const token =
        req.cookies.token || req.headers["authorization"]?.split(" ")[1];

    if (!token) {
        return res
            .status(401)
            .json({ message: "Unauthorized - No token provided" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // { id, role, ... }
        next();
    } catch (error) {
        console.error("Token verification error:", error.message);
        return res
            .status(403)
            .json({ message: "Forbidden - Invalid or expired token" });
    }
};

export { generateToken, verifyToken };
