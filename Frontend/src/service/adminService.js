import axios from "../middleware/axiosConfig";

export const getAdminAccounts = () => axios.get("/admin/read");

export const getAdminById = (adminId) => axios.get(`/admin/${adminId}`);

export const createAdminAccount = (payload) =>
  axios.post("/admin/create", payload);

export const updateAdminAccount = (adminId, payload) =>
  axios.put(`/admin/update/${adminId}`, payload);

export const deleteAdminAccount = (adminId) =>
  axios.delete(`/admin/delete/${adminId}`);
