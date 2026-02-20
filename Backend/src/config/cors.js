import dotenv from "dotenv";
dotenv.config();

const configCors = (app) => {
    app.use((req, res, next) => {
        // Website được phép truy cập API
        res.setHeader(
            "Access-Control-Allow-Origin",
            process.env.FRONTEND_URL || "*"
        );

        // Các phương thức HTTP được phép
        res.setHeader(
            "Access-Control-Allow-Methods",
            "GET, POST, OPTIONS, PUT, PATCH, DELETE"
        );

        // Các header được phép
        res.setHeader(
            "Access-Control-Allow-Headers",
            "X-Requested-With, Content-Type, Authorization"
        );

        // Cho phép gửi cookie khi request từ frontend
        res.setHeader("Access-Control-Allow-Credentials", "true");

        // Cấu hình Content Security Policy (CSP) - Chỉ cho phép tài nguyên từ 'self'
        res.setHeader(
            "Content-Security-Policy",
            "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-src 'self' https://sandbox.vnpayment.vn;"
        );

        // Cho phép tiếp tục xử lý request
        next();
    });
};

export default configCors;

