import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Tạo __dirname theo chuẩn ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../uploads");

// Kiểm tra nếu thư mục không tồn tại thì tạo mới
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình lưu file vào thư mục uploads/
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

// Bộ lọc file (chỉ chấp nhận ảnh JPG, JPEG, PNG)
const fileFilter = (req, file, cb) => {
    console.log("📂 File nhận được:", file);
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        return cb(new Error("❌ Chỉ hỗ trợ ảnh JPG, JPEG, PNG!"), false);
    }
};

// Cấu hình multer
const upload = multer({ storage, fileFilter });

export default upload;
