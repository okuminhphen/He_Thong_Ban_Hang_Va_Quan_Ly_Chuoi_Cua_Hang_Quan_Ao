import axios from "../middleware/axiosConfig";

const getProducts = () => {
  return axios.get("/product/read");
};

const getProductById = (idProduct) => {
  return axios.get(`/product/${idProduct}`);
};

const deleteProduct = (productId) => {
  return axios.delete("/product/delete", { data: { id: productId } });
};

const updateProductAPI = (id, formData) => {
  return axios.put(`/product/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

const fetchCategory = () => {
  return axios.get("/category/read");
};

const createNewProduct = (formData) => {
  return axios.post("/product/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

const getRecommendProducts = (productId) => {
  return axios.get(`/product/recommend/${productId}`);
};

const getRecommendProductsForUser = (userId) => {
  return axios.get("/recommend-product", { params: { userId } });
};

export {
  createNewProduct,
  getProducts,
  fetchCategory,
  deleteProduct,
  updateProductAPI,
  getProductById,
  getRecommendProducts,
  getRecommendProductsForUser,
};
