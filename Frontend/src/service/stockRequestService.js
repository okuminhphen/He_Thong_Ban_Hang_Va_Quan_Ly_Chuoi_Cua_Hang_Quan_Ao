import axios from "../middleware/axiosConfig";

/* ======================================================
   ADMIN CHI NHÁNH
====================================================== */

/**
 * Lấy danh sách stock request của chi nhánh hiện tại
 */
const getMyStockRequests = (branchId) => {
  return axios.get(`/stock-requests/my/${branchId}`);
};

/**
 * Tạo yêu cầu tồn kho
 */
const createStockRequest = (data) => {
  console.log("From service", data);
  return axios.post("/stock-requests", data);
};

/**
 * Cập nhật yêu cầu (chỉ pending)
 */
const updateStockRequestInfo = (id, data) => {
  return axios.put(`/stock-requests/${id}`, data);
};

/**
 * Xóa yêu cầu (chỉ pending)
 */
const deleteStockRequest = (id, data) => {
  return axios.delete(`/stock-requests/${id}`, { data });
};

/* ======================================================
   ADMIN TỔNG
====================================================== */

/**
 * Lấy danh sách yêu cầu chờ duyệt
 */
const getPendingStockRequests = () => {
  return axios.get("/admin/stock-requests/pending");
};

/**
 * Duyệt yêu cầu → tạo TransferReceipt
 */
const approveStockRequest = (id) => {
  return axios.post(`/admin/stock-requests/${id}/approve`);
};

/**
 * Từ chối yêu cầu
 */
const rejectStockRequest = (id, note) => {
  return axios.post(`/admin/stock-requests/${id}/reject`, { note });
};

export {
  // branch admin
  getMyStockRequests,
  createStockRequest,
  updateStockRequestInfo,
  deleteStockRequest,

  // super admin
  getPendingStockRequests,
  approveStockRequest,
  rejectStockRequest,
};
