import conversationService from "../service/conversationService.js";

const createFunc = async (req, res) => {
    try {
        let { userId, adminId } = req.body;

        let data = await conversationService.createConversation(
            userId,
            adminId
        );

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: "error",
            EC: -1,
            DT: null,
        });
    }
};

const getByUserFunc = async (req, res) => {
    try {
        let { userId } = req.params;

        let data = await conversationService.getUserConversation(userId);

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: "error",
            EC: -1,
            DT: null,
        });
    }
};

const readAdminFunc = async (req, res) => {
    try {
        let data = await conversationService.getAllConversations();

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            EM: "error",
            EC: -1,
            DT: null,
        });
    }
};

export default {
    createFunc,
    getByUserFunc,
    readAdminFunc,
};
