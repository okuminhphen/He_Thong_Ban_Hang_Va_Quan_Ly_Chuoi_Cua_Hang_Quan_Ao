import axios from "../middleware/axiosConfig"; // Import axios đã cấu hình

const addViewAPI = (userId, productId) => {
  return axios.post(`/behavior/view/${productId}`, { userId });
};

const toggleLikeAPI = (userId, productId) => {
  return axios.post(`/behavior/like/${productId}`, { userId });
};

const getLikeStatusAPI = (userId, productId) => {
  return axios.get(`/behavior/like-status/${productId}`, {
    params: { userId },
  });
};

export { addViewAPI, toggleLikeAPI, getLikeStatusAPI };
