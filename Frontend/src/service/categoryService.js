import axios from "../middleware/axiosConfig";
const getAllCategorys = () => {
  return axios.get(`/category/read`);
};

const createCategory = (categoryData) => {
  return axios.post(`/category/create`, categoryData);
};

const updateCategory = (categoryId, categoryData) => {
  return axios.put(`/category/update/${categoryId}`, categoryData);
};
const deleteCategory = (categoryId) => {
  return axios.delete(`/category/delete/${categoryId}`, categoryId);
};
export { getAllCategorys, createCategory, updateCategory, deleteCategory };
