import axios from "axios";

const sendMessageFunc = async (req, res) => {
    try {
        const { message } = req.body;
        const response = await axios.post("http://127.0.0.1:5000/chat", {
            message,
        });
        console.log(response.data);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export default { sendMessageFunc };
