import cartService from "../service/cartService.js";
const readFunc = async (req, res) => {
    try {
        let userId = req.params.userId;

        let data = await cartService.getUserCartById(userId);
        if (data) {
            return res.status(200).json({
                EM: data.EM, // error message
                EC: data.EC, //error code
                DT: data.DT, // Date
            });
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: "error read cart", // error message
            EC: "-1", //error code
            DT: "", // Date
        });
    }
};

const addFunc = async (req, res) => {
    try {
        let cartItem = req.body;
        let data = await cartService.addProductToCart(cartItem);
        if (data) {
            return res.status(200).json({
                EM: data.EM, // error message
                EC: data.EC, //error code
                DT: data.DT, // Date
            });
        } else {
            return res.status(500).json({
                EM: "fail add to cart", // error message
                EC: "2", //error code
                DT: "", // Date
            });
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: "error add to cart", // error message
            EC: "-1", //error code
            DT: "", // Date
        });
    }
};
const updateFunc = async (req, res) => {
    try {
        let cartItem = req.body;

        let data = await cartService.updateProductInCart(cartItem);
        if (data) {
            return res.status(200).json({
                EM: data.EM, // error message
                EC: data.EC, //error code
                DT: data.DT, // Date
            });
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: "error update cart", // error message
            EC: "-1", //error code
            DT: "", // Date
        });
    }
};
const deleteFunc = async (req, res) => {
    try {
        let cartProductSizeId = req.params.cartProductSizeId;

        let data = await cartService.deleteProductInCart(cartProductSizeId);

        return res.status(200).json({
            EM: data.EM, // error message
            EC: data.EC, //error code
            DT: data.DT, // Date
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: "error delete cart", // error message
            EC: "-1", //error code
            DT: "", // Date
        });
    }
};
export default { readFunc, addFunc, updateFunc, deleteFunc };
