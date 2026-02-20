import axios from "../middleware/axiosConfig";
const getAllRoles = () => {
  return axios.get(`/role/read`);
};

const createRole = (roleData) => {
  return axios.post(`/role/create`, roleData);
};

const updateRole = (roleId, roleData) => {
  return axios.put(`/role/update/${roleId}`, roleData);
};
const deleteRole = (roleId) => {
  return axios.delete(`/role/delete/${roleId}`, roleId);
};
export { getAllRoles, createRole, updateRole, deleteRole };
