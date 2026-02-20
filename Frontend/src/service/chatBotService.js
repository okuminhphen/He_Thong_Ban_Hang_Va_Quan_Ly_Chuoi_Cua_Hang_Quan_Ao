import axios from "../middleware/axiosConfig";
const sendMessage = (message) => {
  return axios.post("/bot/chat", { message });
};
export { sendMessage };
