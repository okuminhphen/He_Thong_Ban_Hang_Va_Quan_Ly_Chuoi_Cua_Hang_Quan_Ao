import axios from "../middleware/axiosConfig";

const fetchEmployeesByBranchId = (branchId) => {
  return axios.get(`/employee/read/${branchId}`);
};

const createEmployee = (employee) => {
  return axios.post("/employee/create", employee);
};

const updateEmployee = (employeeId, employee) => {
  return axios.put(`/employee/update/${employeeId}`, employee);
};

const deleteEmployee = (employeeId) => {
  return axios.delete(`/employee/delete/${employeeId}`);
};

export {
  fetchEmployeesByBranchId,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
