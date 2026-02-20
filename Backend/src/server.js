import express from "express";
import configViewEngine from "./config/viewEngine.js";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import initApiRouter from "./routes/api.js";
import bodyParser from "body-parser";
import configCors from "./config/cors.js";
import dotenv from "dotenv";
import http from "http";
import { initSocket } from "./socket.js";

dotenv.config();

// Tạo __dirname trong ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cookieParser());

// Tạo http server và khởi tạo socket
const server = http.createServer(app);
initSocket(server); // 👈 SOCKET.IO ĐƯỢC KHỞI TẠO Ở ĐÂY

// Cấu hình
configCors(app);
configViewEngine(app);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

initApiRouter(app);

const PORT = process.env.PORT || 8080;

// Middleware xử lý 404
app.use((req, res) => {
    return res.status(404).send("404 Not Found from Backend");
});

// 👇 CHỈNH DÒNG NÀY
server.listen(PORT, () => {
    console.log(`>>> ✅ Server is running on http://localhost:${PORT}`);
});
