import axios from "../middleware/axiosConfig"; // Import axios đã cấu hình

const addReview = (reviewData) => {
  return axios.post("/review/add", reviewData);
};
const getReviewsByProductId = (productId) => {
  return axios.get(`/review/product/${productId}`);
};
const getReviewsByUserId = (userId) => {
  return axios.get(`/review/user/${userId}`);
};

export { addReview, getReviewsByProductId, getReviewsByUserId };
