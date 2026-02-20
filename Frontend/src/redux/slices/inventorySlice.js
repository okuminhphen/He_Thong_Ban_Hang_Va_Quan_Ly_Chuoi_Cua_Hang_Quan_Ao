import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getInventoryByBranch } from "../../service/inventoryService";

export const fetchInventoryByBranch = createAsyncThunk(
  "inventory/fetchByBranch",
  async (branchId, { rejectWithValue }) => {
    if (!branchId) {
      return rejectWithValue("Vui lòng chọn chi nhánh");
    }
    try {
      const response = await getInventoryByBranch(branchId);
      console.log("response inventory by branch", response.data.DT);
      if (response?.data && +response.data.EC === 0) {
        return response.data.DT || [];
      }

      return rejectWithValue(
        response?.data?.EM || "Không thể tải dữ liệu tồn kho"
      );
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.EM || "Không thể kết nối đến máy chủ"
      );
    }
  }
);

const initialState = {
  items: [],
  status: "idle",
  error: null,
  selectedBranchId: null,
};

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    setSelectedBranchId: (state, action) => {
      state.selectedBranchId = action.payload;
    },
    clearInventoryState: (state) => {
      state.items = [];
      state.status = "idle";
      state.error = null;
      state.selectedBranchId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventoryByBranch.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.items = [];
      })
      .addCase(fetchInventoryByBranch.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload || [];
      })
      .addCase(fetchInventoryByBranch.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Không thể tải dữ liệu tồn kho";
      });
  },
});

export const { setSelectedBranchId, clearInventoryState } =
  inventorySlice.actions;

export default inventorySlice.reducer;
