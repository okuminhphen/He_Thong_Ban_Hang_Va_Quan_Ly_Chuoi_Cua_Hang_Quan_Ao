import db from "../models/index.js";
import moment from "moment-timezone";
import { sendEmailTemplate } from "./emailService.js";
import { createOrder as createOrderGHN, getShippingFee } from "./ghnService.js";

const GHN_BRANCH_DISTRICT_ID = parseInt(process.env.GHN_BRANCH_DISTRICT_ID);

const createOrder = async (orderData) => {
    console.log(orderData);
    const t = await db.sequelize.transaction();
    try {
        const {
            userId,
            cartItems,
            customerInfo,
            totalPrice,
            paymentMethodId,
            branchId,
        } = orderData;

        if (
            !customerInfo ||
            !totalPrice ||
            !paymentMethodId ||
            !cartItems ||
            !userId
        ) {
            return {
                EM: "Missing required fields",
                EC: "-1",
                DT: "",
            };
        }

        let newOrder = await db.Orders.create({
            userId,
            branchId: branchId || null,
            orderDate: moment().tz("Asia/Ho_Chi_Minh").toDate(),
            totalPrice,
            status: "PENDING",

            customerName: customerInfo.name,
            customerPhone: customerInfo.phone,
            customerEmail: customerInfo.email,
            shippingAddress: customerInfo.address,

            
            toProvinceId: parseInt(customerInfo.provinceId),
            toDistrictId: parseInt(customerInfo.districtId),
            toWardCode: customerInfo.wardId, // string

            message: customerInfo.message,
        });

        const code = `ORD-${String(newOrder.id).padStart(6, "0")}`;
        await newOrder.update({ code });
        // console.log(
        //     "Chuyển về Việt Nam:",
        //     moment(order.orderDate)
        //         .tz("Asia/Ho_Chi_Minh")
        //         .format("YYYY-MM-DD HH:mm:ss")
        // );

        const orderDetailsData = [];

        for (const item of cartItems) {
            // 🔹 2.1 TÌM sizeId TỪ size name (VD: "L")
            const size = await db.Size.findOne({
                where: { name: item.size },
                transaction: t,
            });

            if (!size) {
                throw new Error(`Size ${item.size} không tồn tại`);
            }

            // 🔹 2.2 TÌM productSize
            const productSize = await db.ProductSize.findOne({
                where: {
                    productId: item.productId || item.id,
                    sizeId: size.id,
                },
                transaction: t,
            });

            if (!productSize) {
                throw new Error(
                    `Không tìm thấy ProductSize cho sản phẩm ${item.productId}`
                );
            }

            // 🔹 2.3 LẤY INVENTORY + LOCK
            const inventory = await db.Inventory.findOne({
                where: {
                    productSizeId: productSize.id,
                    branchId: 13,
                },
                transaction: t,
                lock: t.LOCK.UPDATE,
            });

            if (!inventory || inventory.stock < item.quantity) {
                throw new Error(`Không đủ tồn kho cho size ${item.size}`);
            }

            // 🔹 2.4 TRỪ TỒN KHO
            await inventory.update(
                {
                    stock: inventory.stock - item.quantity,
                },
                { transaction: t }
            );

            // 🔹 2.5 PREPARE ORDER DETAIL
            orderDetailsData.push({
                orderId: newOrder.id,
                productId: item.productId || item.id,
                productName: item.name,
                productImage: JSON.stringify(item.images),
                productSize: item.size, // vẫn lưu "L" cho dễ đọc
                quantity: item.quantity,
                priceAtOrder: item.price,
                totalPrice: item.price * item.quantity,
            });
        }

        // ======================
        // 3️⃣ CREATE ORDER DETAILS
        // ======================
        await db.OrdersDetails.bulkCreate(orderDetailsData, {
            transaction: t,
        });

        // ======================
        // 4️⃣ CREATE PAYMENT
        // ======================
        await db.Payment.create(
            {
                orderId: newOrder.id,
                paymentMethodId,
                amount: totalPrice,
                transactionId: "",
                status: "PENDING",
            },
            { transaction: t }
        );

        // ======================
        // 5️⃣ CLEAR CART
        // ======================
        await db.Cart.destroy({
            where: { userId },
            transaction: t,
        });

        // ======================
        // 6️⃣ COMMIT
        // ======================
        await t.commit();

        return {
            EM: "Create order successfully",
            EC: "0",
            DT: {
                orderId: newOrder.id,
                code,
            },
        };
    } catch (error) {
        console.log(error);
        return {
            EM: "Error from creat order service",
            EC: "-1",
            DT: "",
        };
    }
};
const getAllOrders = async () => {
    try {
        let orders = await db.Orders.findAll({
            include: [
                {
                    model: db.OrdersDetails,
                    as: "ordersDetails",
                    attributes: [
                        "id",
                        "orderId",
                        "productId",
                        "productName",
                        "productImage",
                        "productSize",
                        "quantity",
                        "priceAtOrder",
                        "totalPrice",
                    ],
                },
                {
                    model: db.Payment,
                    as: "payment",
                },
            ],
        });
        return {
            EM: "Get all orders successfully",
            EC: "0",
            DT: orders,
        };
    } catch (error) {
        console.log(error);
        return {
            EM: "Error from service",
            EC: "-1",
            DT: "",
        };
    }
};
const getOrdersByUserId = async (userId) => {
    try {
        let orders = await db.Orders.findAll({
            where: {
                userId: userId,
            },
            attributes: [
                "id",
                "userId",
                "code",
                "orderDate",
                "totalPrice",
                "status",
                "customerName",
                "customerPhone",
                "customerEmail",
                "shippingAddress",
                "message",
            ],
            include: [
                {
                    model: db.OrdersDetails, // Bảng chi tiết đơn hàng
                    attributes: [
                        "id",
                        "orderId",
                        "productId",
                        "productName",
                        "productImage",
                        "productSize",
                        "quantity",
                        "priceAtOrder",
                        "totalPrice",
                    ],
                    as: "ordersDetails",
                },
                {
                    model: db.Payment,
                    attributes: [
                        "id",
                        "orderId",
                        "paymentMethodId",
                        "amount",
                        "transactionId",
                        "status",
                    ],
                    as: "payment",
                    include: [
                        {
                            model: db.PaymentMethods, // Thêm bảng PaymentMethods
                            attributes: ["id", "name", "description"], // Lấy tên phương thức thanh toán
                            as: "paymentMethod",
                        },
                    ],
                },
            ],
        });

        return {
            EM: "Get orders by user id successfully",
            EC: "0",
            DT: orders,
        };
    } catch (error) {
        console.log(error);
        return {
            EM: "Error from service",
            EC: "-1",
            DT: "",
        };
    }
};

const updateOrderStatus = async (orderId, newStatus) => {
    try {
        const order = await db.Orders.findByPk(orderId, {
            include: [
                {
                    model: db.OrdersDetails,
                    as: "ordersDetails",
                },
            ],
        });

        if (!order) {
            return { EM: "Order not found", EC: -1, DT: "" };
        }

        if (order.status === "PENDING" && newStatus === "CONFIRMED") {
            order.status = "CONFIRMED";
            await order.save();

            // 1️⃣ Map items từ OrdersDetails
            const items = order.ordersDetails.map((item) => ({
                name: item.productName,
                quantity: item.quantity,
                price: item.price || 0,
                weight: item.weight || 300,
            }));

            const totalWeight = items.reduce(
                (sum, i) => sum + i.weight * i.quantity,
                0
            );

            // 2️⃣ Tính phí GHN
            const feeRes = await getShippingFee({
                fromDistrict: GHN_BRANCH_DISTRICT_ID,
                toDistrict: order.toDistrictId,
                weight: totalWeight,
            });

            const shippingFee = feeRes?.data?.total_fee || 0;

            // 3️⃣ Tạo đơn GHN
            const ghnRes = await createOrderGHN({
                to_name: order.customerName,
                to_phone: order.customerPhone,
                to_address: order.shippingAddress,

                to_district_id: order.toDistrictId,
                to_ward_code: order.toWardCode,

                cod_amount: order.totalPrice,
                weight: totalWeight,
                service_type_id: 2,
                required_note: "KHONGCHOXEMHANG",
                items,
            });

            // 4️⃣ Lưu GHN info
            order.ghnOrderId = ghnRes.data.order_code;

            order.shippingFee = shippingFee;
            order.status = "SHIPPING";
            await order.save();

            // 5️⃣ Gửi email
            await sendEmailTemplate(
                order.customerEmail,
                "Đơn hàng của bạn đã được duyệt",
                "newCus",
                {
                    fullname: order.customerName,
                    orderCode: order.code,
                    ghnOrderCode: order.ghnOrderId,
                    shippingFee,
                },
                "user"
            );

            return {
                EM: "Order approved & GHN created",
                EC: 0,
                DT: order,
            };
        }

        await db.Orders.update(
            { status: newStatus },
            { where: { id: orderId } }
        );

        return { EM: "Update order status successfully", EC: 0, DT: "" };
    } catch (error) {
        console.error(error);
        return { EM: "Error from update order status", EC: -1, DT: "" };
    }
};

const deleteOrder = async (orderId) => {
    try {
        let result = await db.Orders.destroy({ where: { id: orderId } });
        return {
            EM: "Delete order successfully",
            EC: "0",
            DT: result,
        };
    } catch (error) {
        console.log(error);
        return {
            EM: "Error from service",
            EC: "-1",
            DT: "",
        };
    }
};
const updateOrder = async (orderId, orderData) => {
    try {
        let result = await db.Orders.update(orderData, {
            where: { id: orderId },
        });
        return {
            EM: "Update order successfully",
            EC: "0",
            DT: result,
        };
    } catch (error) {
        console.log(error);
        return {
            EM: "Error from service",
            EC: "-1",
            DT: "",
        };
    }
};

const getOrdersByBranchId = async (branchId) => {
    try {
        if (!branchId) {
            return {
                EM: "Missing branchId",
                EC: "-1",
                DT: "",
            };
        }

        let orders = await db.Orders.findAll({
            where: { branchId },
            include: [
                {
                    model: db.OrdersDetails,
                    as: "ordersDetails",
                    attributes: [
                        "id",
                        "orderId",
                        "productId",
                        "productName",
                        "productImage",
                        "productSize",
                        "quantity",
                        "priceAtOrder",
                        "totalPrice",
                    ],
                },
                {
                    model: db.Payment,
                    as: "payment",
                    include: [
                        {
                            model: db.PaymentMethods,
                            as: "paymentMethod",
                            attributes: ["id", "name", "description"],
                        },
                    ],
                },
            ],
        });

        return {
            EM: "Get orders by branch successfully",
            EC: "0",
            DT: orders,
        };
    } catch (error) {
        console.log(error);
        return {
            EM: "Error from service",
            EC: "-1",
            DT: "",
        };
    }
};

const createOrderAtBranch = async (orderData) => {
    try {
        const {
            cartItems,
            customerInfo,
            totalPrice,
            paymentMethodId,
            branchId,
        } = orderData;

        if (!cartItems || !totalPrice || !paymentMethodId || !branchId) {
            return {
                EM: "Missing required fields",
                EC: "-1",
                DT: "",
            };
        }

        // Tạo đơn hàng không có userId
        let newOrder = await db.Orders.create({
            userId: null,
            branchId: branchId,
            orderDate: moment().tz("Asia/Ho_Chi_Minh").toDate(),
            totalPrice,
            status: "COMPLETED", // vì là mua trực tiếp tại cửa hàng
            customerName: customerInfo?.name || "Khách lẻ",
            customerPhone: customerInfo?.phone || "",
            customerEmail: customerInfo?.email || "",
            shippingAddress: customerInfo?.address || "",
            message: customerInfo?.message || "",
        });

        const orderId = newOrder.id;

        // Thêm chi tiết sản phẩm
        const ordersDetailsData = cartItems.map((item) => ({
            orderId,
            productId: item.id,
            productName: item.name,
            productImage: JSON.stringify(item.images),
            productSize: item.size,
            quantity: item.quantity,
            priceAtOrder: item.price,
            totalPrice: item.price * item.quantity,
        }));
        await db.OrdersDetails.bulkCreate(ordersDetailsData);

        // Tạo thanh toán
        await db.Payment.create({
            orderId,
            paymentMethodId,
            amount: totalPrice,
            transactionId: "",
            status: "COMPLETED",
        });

        return {
            EM: "Create in-store order successfully",
            EC: "0",
            DT: newOrder,
        };
    } catch (error) {
        console.log(error);
        return {
            EM: "Error from service",
            EC: "-1",
            DT: "",
        };
    }
};

export default {
    createOrder,
    getAllOrders,
    getOrdersByUserId,
    updateOrderStatus,
    deleteOrder,
    updateOrder,
    getOrdersByBranchId,
    createOrderAtBranch,
};
