import express from "express";
import { cache } from "../middleware/cache.js";
import { checkRole } from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadCloudinary.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import loginRegisterController from "../controller/loginRegisterController.js";
import productController from "../controller/productController.js";
import cartController from "../controller/cartController.js";
import orderController from "../controller/orderController.js";
import paymentController from "../controller/paymentController.js";
import voucherController from "../controller/voucherController.js";
import userController from "../controller/userController.js";
import reviewController from "../controller/reviewController.js";
import chatBotController from "../controller/chatBotController.js";
import authController from "../controller/authController.js";
import bannerController from "../controller/bannerController.js";
import branchController from "../controller/branchController.js";
import employeeController from "../controller/employeeController.js";
import inventoryController from "../controller/inventoryController.js";
import userBehaviorController from "../controller/userBehaviorController.js";
import roleController from "../controller/roleController.js";
import categoryController from "../controller/categoryController.js";
import adminController from "../controller/adminController.js";
import sizeController from "../controller/sizeController.js";
import stockRequestController from "../controller/stockRequestController.js";
import conversationController from "../controller/conversationController.js";
import messageController from "../controller/messageController.js";
import addressController from "../controller/addressController.js";
import transferReceiptController from "../controller/transferReceiptController.js";
import notificationController from "../controller/notificationController.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

/**
 *
 * @param {*} app express app
 */

const initApiRouter = (app) => {
    //test thử api
    router.get("/test-api", loginRegisterController.testApi);
    router.post("/register", loginRegisterController.handleRegister);
    router.post("/login", loginRegisterController.handleLogin);
    router.post("/logout", loginRegisterController.handleLogout);
    //auth route
    router.post("/auth/google", loginRegisterController.handleGoogleLogin);
    //admin route
    router.post("/admin/login", authController.handleAdminLoginController);
    //router.post("/auth/facebook", loginRegisterController.handleFacebookLogin);
    router.post(
        "/auth/verify-captcha",
        loginRegisterController.handleVerifyCaptcha
    );

    router.post("/auth/send-otp", authController.handleSendOTP);
    router.post("/auth/verify-otp", authController.handleVerifyOTPFunc);
    //review route
    router.post("/review/add", reviewController.addReviewFunc);
    router.get(
        "/review/product/:productId",
        reviewController.getReviewsByProductIdFunc
    );
    //chatbot route
    router.post("/bot/chat", chatBotController.sendMessageFunc);

    // user

    router.get("/profile", verifyToken, (req, res) => {
        res.json({
            message: "Welcome!",
            user: req.user, // { id, role, branchId }
        });
    });
    router.get(
        "/user/read",
        verifyToken,
        checkRole("SUPER_ADMIN", "BRANCH_MANAGER"),
        cache("user:all"),
        userController.readFunc
    );
    router.get(
        "/user/:id",
        verifyToken,
        cache("user"),
        userController.getUserFunc
    );
    router.post(
        "/user/create",
        verifyToken,
        checkRole("SUPER_ADMIN", "BRANCH_MANAGER"),
        userController.createFunc
    );
    router.put(
        "/user/update/:userId",
        verifyToken,
        checkRole("SUPER_ADMIN", "BRANCH_MANAGER"),
        userController.updateFunc
    );
    router.delete(
        "/user/delete/:userId",
        verifyToken,
        checkRole("SUPER_ADMIN", "BRANCH_MANAGER"),
        userController.deleteFunc
    );
    router.put("/user/update-password/:id", userController.updatePasswordFunc);
    router.put(
        "/admin/user/update/:userId",
        userController.updateUserByAdminFunc
    );
    router.get(
        "/user/read-all",
        verifyToken,
        checkRole("SUPER_ADMIN", "BRANCH_MANAGER"),
        cache("user:all"),
        userController.getAllUsersFunc
    );

    //product route
    router.get(
        "/product/read",
        cache("product:all"),
        productController.readFunc
    );

    router.get(
        "/category/read",
        cache("category:all"),
        productController.readCategoryFunc
    );
    router.get(
        "/product/recommend/:productId",
        cache("product:recommend"),
        productController.getRecommendProductsFunc
    );
    router.get(
        "/recommend-product",
        cache("product:recommend-user"),
        productController.getRecommendProductsForUserFunc
    );

    router.get(
        "/product/:id",
        cache("product"),
        productController.getProductFunc
    );
    router.post(
        "/product/create",
        verifyToken,
        checkRole("SUPER_ADMIN", "BRANCH_MANAGER"),
        upload.array("images", 5),
        productController.createFunc
    );
    router.put(
        "/product/update/:id",
        verifyToken,
        checkRole("SUPER_ADMIN", "BRANCH_MANAGER"),
        upload.array("images", 5),
        productController.updateFunc
    );
    router.delete(
        "/product/delete",
        verifyToken,
        checkRole("SUPER_ADMIN", "BRANCH_MANAGER"),
        productController.deleteFunc
    );
    router.get(
        "/product-by-category/read",
        cache("product:category"),
        productController.getProductByCategoryFunc
    );

    //size route
    router.get("/size/read", cache("size:all"), sizeController.readSizeFunc);
    router.post("/size/create", sizeController.createSizeFunc);
    router.put("/size/update", sizeController.updateSizeFunc);
    router.delete("/size/delete", sizeController.deleteSizeFunc);

    //cart route
    router.get("/cart/read/:userId", verifyToken, cartController.readFunc);
    router.post("/cart/add", verifyToken, cartController.addFunc);
    router.put("/cart/update", verifyToken, cartController.updateFunc);
    router.delete(
        "/cart/delete/:cartProductSizeId",
        verifyToken,
        cartController.deleteFunc
    );

    //order route
    router.get(
        "/order/read",
        verifyToken,
        cache("order:all"),
        orderController.readFunc
    );
    router.get(
        "/order/read/:userId",
        verifyToken,
        cache("order:user"),
        orderController.readByUserIdFunc
    );
    router.post("/order/create", verifyToken, orderController.createFunc);
    router.put("/order/update", verifyToken, orderController.updateFunc);
    router.put(
        "/order/details/update/:orderId",
        verifyToken,
        orderController.updateStatusFunc
    );
    router.delete("/order/delete", verifyToken, orderController.deleteFunc);
    router.get(
        "/order/branch/:branchId",
        verifyToken,
        checkRole("SUPER_ADMIN", "BRANCH_MANAGER"),
        cache("order:branch"),
        orderController.readByBranchIdFunc
    );
    router.post(
        "/order/in-store",
        verifyToken,
        orderController.createAtBranchFunc
    );
    //payment route
    router.get(
        "/payment-methods",
        verifyToken,
        paymentController.readPaymentMethodsFunc
    );
    router.post(
        "/create-payment-url",
        verifyToken,
        paymentController.createPaymentUrlFunc
    );

    router.get(
        "/payment-return",
        verifyToken,
        paymentController.getPaymentReturnFunc
    );
    router.post("/webhook", paymentController.webhookFunc);
    router.get(
        "/voucher/read",
        verifyToken,
        cache("voucher:all"),
        voucherController.readVoucherFunc
    );
    router.post(
        "/voucher/create",
        verifyToken,
        checkRole("SUPER_ADMIN", "BRANCH_MANAGER"),
        voucherController.createVoucherFunc
    );
    router.put(
        "/voucher/update/:voucherId",
        verifyToken,
        checkRole("SUPER_ADMIN", "BRANCH_MANAGER"),
        voucherController.updateVoucherFunc
    );
    router.delete(
        "/voucher/delete/:voucherId",
        verifyToken,
        checkRole("SUPER_ADMIN", "BRANCH_MANAGER"),
        voucherController.deleteVoucherFunc
    );
    router.post(
        "/voucher/check",
        verifyToken,
        voucherController.checkVoucherFunc
    );

    //banner
    router.get(
        "/banner/read",
        cache("banner:all"),
        bannerController.getActiveBanner
    );
    router.post(
        "/banner/create",
        verifyToken,
        checkRole("SUPER_ADMIN", "BRANCH_MANAGER"),
        upload.single("banner"),
        bannerController.handleCreateBanner
    );
    router.put(
        "/banner/update/:bannerId",
        verifyToken,
        checkRole("SUPER_ADMIN", "BRANCH_MANAGER"),
        upload.single("banner"),
        bannerController.handleUpdateBanner
    );
    router.delete(
        "/banner/delete/:bannerId",
        verifyToken,
        checkRole("SUPER_ADMIN", "BRANCH_MANAGER"),
        bannerController.handleDeleteBanner
    );
    router.get(
        "/banner/read/active",
        cache("banner:active"),
        bannerController.getRealActiveBanner
    );
    // branch route
    router.get("/branch/read", cache("branch:all"), branchController.readFunc);
    router.post(
        "/branch/create",
        verifyToken,
        checkRole("SUPER_ADMIN", "BRANCH_MANAGER"),
        branchController.createFunc
    );
    router.put(
        "/branch/update/:branchId",
        verifyToken,
        checkRole("SUPER_ADMIN", "BRANCH_MANAGER"),
        branchController.updateFunc
    );
    router.delete(
        "/branch/delete/:branchId",
        verifyToken,
        checkRole("SUPER_ADMIN", "BRANCH_MANAGER"),
        branchController.deleteFunc
    );
    router.get(
        "/branch/:branchId",
        verifyToken,
        checkRole("SUPER_ADMIN", "BRANCH_MANAGER"),
        cache("branch"),
        branchController.getDetailFunc
    );

    // employee route
    router.get(
        "/employee/read",
        verifyToken,
        checkRole("SUPER_ADMIN", "BRANCH_MANAGER"),
        cache("employee:all"),
        employeeController.readFunc
    );
    router.get(
        "/employee/read/:branchId",
        verifyToken,
        checkRole("SUPER_ADMIN", "BRANCH_MANAGER"),
        cache("employee:branch"),
        employeeController.getEmployeesByBranchIdFunc
    );
    router.post(
        "/employee/create",
        verifyToken,
        checkRole("SUPER_ADMIN", "BRANCH_MANAGER"),
        employeeController.createFunc
    );
    router.put(
        "/employee/update/:employeeId",
        verifyToken,
        checkRole("SUPER_ADMIN", "BRANCH_MANAGER"),
        employeeController.updateFunc
    );
    router.delete(
        "/employee/delete/:employeeId",
        verifyToken,
        checkRole("SUPER_ADMIN", "BRANCH_MANAGER"),
        employeeController.deleteFunc
    );

    // inventory route
    router.get(
        "/inventory/:branchId",
        verifyToken,
        checkRole("SUPER_ADMIN", "BRANCH_MANAGER"),
        inventoryController.getInventoryByBranchController
    );

    //user behavior route
    router.post(
        "/behavior/view/:productId",
        userBehaviorController.addViewFunc
    );
    router.post(
        "/behavior/like/:productId",
        userBehaviorController.toggleLikeFunc
    );
    router.get(
        "/behavior/like-status/:productId",
        userBehaviorController.getLikeStatusFunc
    );
    //role
    router.post("/role/check", roleController.checkRoleFunc);

    router.get(
        "/role/read",
        verifyToken,
        checkRole("SUPER_ADMIN", "BRANCH_MANAGER"),
        cache("role:all"),
        roleController.readRoleFunc
    );
    router.post(
        "/role/create",
        verifyToken,
        checkRole("SUPER_ADMIN", "BRANCH_MANAGER"),
        roleController.createRoleFunc
    );
    router.put(
        "/role/update/:roleId",
        verifyToken,
        checkRole("SUPER_ADMIN", "BRANCH_MANAGER"),
        roleController.updateRoleFunc
    );
    router.delete(
        "/role/delete/:roleId",
        verifyToken,
        checkRole("SUPER_ADMIN", "BRANCH_MANAGER"),
        roleController.deleteRoleFunc
    );

    //category
    router.post("/category/check", categoryController.checkCategoryFunc);

    router.get(
        "/category/read",
        cache("category:all"),
        categoryController.readCategoryFunc
    );
    router.post("/category/create", categoryController.createCategoryFunc);
    router.put(
        "/category/update/:categoryId",
        categoryController.updateCategoryFunc
    );
    router.delete(
        "/category/delete/:categoryId",
        categoryController.deleteCategoryFunc
    );

    router.get("/admin/read", cache("admin:all"), adminController.readFunc);
    router.get("/admin/:adminId", cache("admin"), adminController.getAdminFunc);
    router.post("/admin/create", adminController.createFunc);
    router.put("/admin/update/:adminId", adminController.updateFunc);
    router.delete("/admin/delete/:adminId", adminController.deleteFunc);

    // ================= STOCK REQUEST - BRANCH ADMIN =================

    // Lấy danh sách request của chi nhánh
    router.get(
        "/stock-requests/my/:branchId",
        verifyToken,
        checkRole("BRANCH_MANAGER", "SUPER_ADMIN"),
        cache("stock-request:branch"),
        stockRequestController.getMyStockRequests
    );

    // Tạo yêu cầu tồn kho
    router.post(
        "/stock-requests",
        verifyToken,
        checkRole("BRANCH_MANAGER", "SUPER_ADMIN"),
        stockRequestController.createStockRequest
    );

    // Sửa yêu cầu (chỉ pending)
    router.put(
        "/stock-requests/:id",
        verifyToken,
        checkRole("BRANCH_MANAGER", "SUPER_ADMIN"),
        stockRequestController.updateStockRequestInfo
    );

    // Xóa yêu cầu (chỉ pending)
    router.delete(
        "/stock-requests/:id",
        verifyToken,
        checkRole("BRANCH_MANAGER", "SUPER_ADMIN"),
        stockRequestController.deleteStockRequest
    );

    // Lấy danh sách yêu cầu chờ duyệt
    router.get(
        "/admin/stock-requests/pending",
        verifyToken,
        checkRole("SUPER_ADMIN"),
        stockRequestController.getPendingStockRequests
    );

    // Duyệt yêu cầu → tạo TransferReceipt
    router.post(
        "/admin/stock-requests/:id/approve",
        verifyToken,
        checkRole("SUPER_ADMIN"),
        stockRequestController.approveStockRequest
    );

    // Từ chối yêu cầu
    router.post(
        "/admin/stock-requests/:id/reject",
        verifyToken,
        checkRole("SUPER_ADMIN"),
        stockRequestController.rejectStockRequest
    );

    //conservation route
    router.post("/conversation/create", conversationController.createFunc);
    router.get(
        "/conversation/user/:userId",
        conversationController.getByUserFunc
    );
    router.get("/conversation/admin", conversationController.readAdminFunc);

    //message route
    router.post("/message/send/:conversationId", messageController.sendFunc);
    router.get("/message/get/:conversationId", messageController.getFunc);

    router.get("/address/provinces", addressController.getProvinces);
    router.get("/address/districts", addressController.getDistricts);
    router.get("/address/wards", addressController.getWards);

    //transfer receipt route
    router.get(
        "/transfer-receipts",
        transferReceiptController.getAllTransferReceipts
    );
    router.get(
        "/transfer-receipts/:id",
        transferReceiptController.getTransferReceiptDetail
    );
    router.post(
        "/transfer-receipts/:id/complete",
        transferReceiptController.completeTransferReceipt
    );
    router.post(
        "/transfer-receipts/:id/approve",
        transferReceiptController.approveTransferReceipt
    );
    router.post(
        "/transfer-receipts/:id/reject",
        transferReceiptController.rejectTransferReceipt
    );
    router.post(
        "/transfer-receipts/:id/cancel",
        verifyToken,
        transferReceiptController.cancelTransferReceipt
    );

    //notification route
    router.get(
        "/notifications/my",
        verifyToken,
        checkRole("SUPER_ADMIN", "BRANCH_MANAGER"),
        notificationController.getMyNotificationsFunc
    );

    router.patch(
        "/notifications/:id/read",
        verifyToken,
        checkRole("SUPER_ADMIN", "BRANCH_MANAGER"),
        notificationController.markAsReadFunc
    );

    router.get(
        "/notifications/count",
        verifyToken,
        checkRole("SUPER_ADMIN", "BRANCH_MANAGER"),
        notificationController.countUnreadFunc
    );
    return app.use("/api/v1/", router);
};

export default initApiRouter;
