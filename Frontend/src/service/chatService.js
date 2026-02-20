import axios from "../middleware/axiosConfig";

// Conversation APIs
const createConversation = (data) => {
  return axios.post("/conversation/create", data);
};

const getUserConversation = (userId) => {
  return axios.get(`/conversation/user/${userId}`);
};

const getAllConversations = () => {
  return axios.get("/conversation/admin");
};

// Message APIs
const sendMessage = (conversationId, data) => {
  return axios.post(`/message/send/${conversationId}`, data);
};

const getMessages = (conversationId) => {
  return axios.get(`/message/get/${conversationId}`);
};

export {
  createConversation,
  getUserConversation,
  getAllConversations,
  sendMessage,
  getMessages,
};
