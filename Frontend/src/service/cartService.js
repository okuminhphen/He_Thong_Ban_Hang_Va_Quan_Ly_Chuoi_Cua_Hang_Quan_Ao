import axios from "../middleware/axiosConfig";

const getCart = (userId) => {
  return axios.get(`/cart/read/${userId}`);
};
const addItemToCart = (cartItem) => {
  return axios.post("/cart/add", cartItem);
};
const updateItemInCart = (cartItem) => {
  return axios.put("/cart/update", cartItem);
};
const deleteItemInCart = (cartProductSizeId) => {
  return axios.delete(`/cart/delete/${cartProductSizeId}`);
};
export { getCart, addItemToCart, updateItemInCart, deleteItemInCart };
