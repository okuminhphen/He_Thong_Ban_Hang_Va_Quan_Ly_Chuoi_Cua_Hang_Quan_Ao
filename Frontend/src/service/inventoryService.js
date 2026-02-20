import axios from "../middleware/axiosConfig";

const getInventoryByBranch = (branchId) => {
  return axios.get(`/inventory/${branchId}`);
};

export { getInventoryByBranch };
