import axios from "../middleware/axiosConfig";
const getAllVouchers = () => {
  return axios.get(`/voucher/read`);
};

const createVoucher = (voucherData) => {
  return axios.post(`/voucher/create`, voucherData);
};

const updateVoucher = (voucherId, voucherData) => {
  return axios.put(`/voucher/update/${voucherId}`, voucherData);
};
const deleteVoucher = (voucherId) => {
  return axios.delete(`/voucher/delete/${voucherId}`, voucherId);
};
export { getAllVouchers, createVoucher, updateVoucher, deleteVoucher };
