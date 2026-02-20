import axios from "../middleware/axiosConfig";
const fetchSizes = () => {
  return axios.get("/size/read");
};
const createSize = (data) => {
  return axios.post("/size/create", data);
};
const updateSize = (data) => {
  return axios.put("/size/update", data);
};
const deleteSize = (id) => {
  return axios.delete(`/size/delete/${id}`);
};
export { fetchSizes, createSize, updateSize, deleteSize };
