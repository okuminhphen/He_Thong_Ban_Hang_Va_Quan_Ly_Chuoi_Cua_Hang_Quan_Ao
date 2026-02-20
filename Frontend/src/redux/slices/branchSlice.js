import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllBranches,
  createBranch,
  updateBranch,
  deleteBranch,
} from "../../service/branchService";
import { toast } from "react-toastify";

// 🔹 Lấy danh sách chi nhánh
export const fetchBranches = createAsyncThunk(
  "branch/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await getAllBranches();
      if (+response.data.EC === 0) {
        return response.data.DT;
      } else {
        return thunkAPI.rejectWithValue(response.data.EM);
      }
    } catch (error) {
      return thunkAPI.rejectWithValue("Không thể kết nối đến server");
    }
  }
);

// 🔹 Tạo chi nhánh mới
export const createBranchThunk = createAsyncThunk(
  "branch/create",
  async (branchData, { rejectWithValue }) => {
    try {
      const response = await createBranch(branchData);
      if (response && response.data && +response.data.EC === 0) {
        toast.success(response.data.EM || "Tạo chi nhánh thành công");
        return response.data.DT;
      } else {
        toast.error(response.data.EM || "Tạo chi nhánh thất bại");
        return rejectWithValue(response.data.EM);
      }
    } catch (error) {
      toast.error(error.response?.data?.EM || "Lỗi khi tạo chi nhánh");
      return rejectWithValue(
        error.response?.data?.EM || "Lỗi khi tạo chi nhánh"
      );
    }
  }
);

// 🔹 Cập nhật chi nhánh
export const updateBranchThunk = createAsyncThunk(
  "branch/update",
  async ({ branchId, branchData }, { rejectWithValue }) => {
    try {
      const response = await updateBranch(branchId, branchData);
      if (response && response.data && +response.data.EC === 0) {
        toast.success(response.data.EM || "Cập nhật chi nhánh thành công");
        return response.data.DT;
      } else {
        toast.error(response.data.EM || "Cập nhật chi nhánh thất bại");
        return rejectWithValue(response.data.EM);
      }
    } catch (error) {
      toast.error(error.response?.data?.EM || "Lỗi khi cập nhật chi nhánh");
      return rejectWithValue(
        error.response?.data?.EM || "Lỗi khi cập nhật chi nhánh"
      );
    }
  }
);

// 🔹 Xóa chi nhánh
export const deleteBranchThunk = createAsyncThunk(
  "branch/delete",
  async (branchId, { rejectWithValue }) => {
    try {
      const response = await deleteBranch(branchId);
      if (response && response.data && +response.data.EC === 0) {
        toast.success(response.data.EM || "Xóa chi nhánh thành công");
        return branchId;
      } else {
        toast.error(response.data.EM || "Xóa chi nhánh thất bại");
        return rejectWithValue(response.data.EM);
      }
    } catch (error) {
      toast.error(error.response?.data?.EM || "Lỗi khi xóa chi nhánh");
      return rejectWithValue(
        error.response?.data?.EM || "Lỗi khi xóa chi nhánh"
      );
    }
  }
);

const initialState = {
  branches: [],
  loading: false,
  error: null,
};

const branchSlice = createSlice({
  name: "branch",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = action.payload;
      })
      .addCase(fetchBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createBranchThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(createBranchThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.branches.push(action.payload);
      })
      .addCase(createBranchThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateBranchThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateBranchThunk.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.branches.findIndex(
          (b) => b.id === action.payload.id
        );
        if (index !== -1) {
          state.branches[index] = action.payload;
        }
      })
      .addCase(updateBranchThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteBranchThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteBranchThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = state.branches.filter(
          (branch) => branch.id !== action.payload
        );
      })
      .addCase(deleteBranchThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default branchSlice.reducer;
