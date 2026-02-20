import messageService from "../service/messageService.js";

const sendFunc = async (req, res) => {
    try {
        let { conversationId } = req.params;
        let { senderId, senderRole, message } = req.body;

        let data = await messageService.sendMessage(
            conversationId,
            senderId,
            senderRole,
            message
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

const getFunc = async (req, res) => {
    try {
        let { conversationId } = req.params;

        let data = await messageService.getMessagesByConversation(
            conversationId
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

export default {
    sendFunc,
    getFunc,
};
