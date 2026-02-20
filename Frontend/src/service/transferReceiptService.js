import axios from "../middleware/axiosConfig";

/**
 * Lấy danh sách tất cả phiếu chuyển kho
 */
const getAllTransferReceipts = (query = {}) => {
  return axios.get("/transfer-receipts", { params: query });
};

/**
 * Lấy chi tiết phiếu chuyển kho
 */
const getTransferReceiptDetail = (id) => {
  return axios.get(`/transfer-receipts/${id}`);
};

/**
 * Duyệt phiếu chuyển kho
 */
const approveTransferReceipt = (id, adminId) => {
  return axios.post(`/transfer-receipts/${id}/approve`, { adminId });
};

/**
 * Từ chối phiếu chuyển kho
 */
const rejectTransferReceipt = (id, reason, adminId) => {
  return axios.post(`/transfer-receipts/${id}/reject`, { reason, adminId });
};

/**
 * Hoàn thành phiếu chuyển kho
 */
const completeTransferReceipt = (id, adminId) => {
  return axios.post(`/transfer-receipts/${id}/complete`, { adminId });
};

/**
 * Hủy phiếu chuyển kho
 */
const cancelTransferReceipt = (id, adminId) => {
  return axios.post(`/transfer-receipts/${id}/cancel`, { adminId });
};

export {
  getAllTransferReceipts,
  getTransferReceiptDetail,
  approveTransferReceipt,
  rejectTransferReceipt,
  completeTransferReceipt,
  cancelTransferReceipt,
};
