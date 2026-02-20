import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchEmployeesByBranchId,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../../service/employeeService";

export const fetchEmployeesByBranchThunk = createAsyncThunk(
  "employee/fetchEmployeesByBranch",
  async (branchId, { rejectWithValue }) => {
    try {
      const response = await fetchEmployeesByBranchId(branchId);

      if (+response.data.EC !== 0) {
        return rejectWithValue(response.data);
      }

      return response.data.DT;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi lấy danh sách nhân viên!"
      );
    }
  }
);

// 📌 Create employee
export const createEmployeeThunk = createAsyncThunk(
  "employee/createEmployee",
  async (employeeData, { rejectWithValue }) => {
    try {
      const response = await createEmployee(employeeData);

      if (response.data.EC !== "0") {
        return rejectWithValue(response.data);
      }

      return response.data.DT;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi tạo employee!"
      );
    }
  }
);

// 📌 Update employee
export const updateEmployeeThunk = createAsyncThunk(
  "employee/updateEmployee",
  async ({ employeeId, updatedData }, { rejectWithValue }) => {
    try {
      const response = await updateEmployee(employeeId, updatedData);

      if (response.data.EC === "0") {
        return response.data.DT;
      } else {
        return rejectWithValue(
          response.data?.EM || "Không thể cập nhật employee!"
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi cập nhật employee!"
      );
    }
  }
);

// 📌 Delete employee
export const deleteEmployeeThunk = createAsyncThunk(
  "employee/deleteEmployee",
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await deleteEmployee(employeeId);

      if (response.data.EC === "0") {
        return employeeId;
      } else {
        return rejectWithValue(response.data?.EM || "Không thể xóa employee!");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi xóa employee!"
      );
    }
  }
);

const employeeSlice = createSlice({
  name: "employees",
  initialState: {
    employees: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 📌 Fetch employee
      .addCase(fetchEmployeesByBranchThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchEmployeesByBranchThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.employees = action.payload;
      })
      .addCase(fetchEmployeesByBranchThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // 📌 Create employee
      .addCase(createEmployeeThunk.fulfilled, (state, action) => {
        state.employees.push(action.payload);
      })
      .addCase(createEmployeeThunk.rejected, (state, action) => {
        state.error = action.payload;
      })

      // 📌 Update employee
      .addCase(updateEmployeeThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.employees.findIndex((emp) => emp.id === updated.id);
        if (index !== -1) {
          state.employees[index] = updated;
        }
      })
      .addCase(updateEmployeeThunk.rejected, (state, action) => {
        state.error = action.payload;
      })

      // 📌 Delete employee
      .addCase(deleteEmployeeThunk.fulfilled, (state, action) => {
        state.employees = state.employees.filter(
          (emp) => emp.id !== action.payload
        );
      })
      .addCase(deleteEmployeeThunk.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default employeeSlice.reducer;
