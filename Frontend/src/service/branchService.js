import axios from "../middleware/axiosConfig";

const getAllBranches = () => {
  return axios.get("/branch/read");
};

const createBranch = (branchData) => {
  return axios.post("/branch/create", branchData);
};

const updateBranch = (branchId, branchData) => {
  return axios.put(`/branch/update/${branchId}`, branchData);
};

const deleteBranch = (branchId) => {
  return axios.delete(`/branch/delete/${branchId}`);
};

const getBranchById = (branchId) => {
  return axios.get(`/branch/${branchId}`);
};

export {
  getAllBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  getBranchById,
};
