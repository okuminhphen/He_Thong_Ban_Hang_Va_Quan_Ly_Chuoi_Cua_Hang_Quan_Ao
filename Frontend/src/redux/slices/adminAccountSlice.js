import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import {
  getAdminAccounts,
  createAdminAccount,
  updateAdminAccount,
  deleteAdminAccount,
} from "../../service/adminService";

const initialState = {
  list: [],
  loading: false,
  saving: false,
  deletingId: null,
  error: null,
};

export const fetchAdminAccounts = createAsyncThunk(
  "adminAccounts/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getAdminAccounts();
      if (+res.data.EC === 0) {
        return res.data.DT || [];
      }
      const message = res.data.EM || "Không thể tải danh sách admin";
      return rejectWithValue(message);
    } catch (error) {
      const message =
        error.response?.data?.EM || "Không thể tải danh sách admin";
      return rejectWithValue(message);
    }
  }
);

export const createAdminAccountThunk = createAsyncThunk(
  "adminAccounts/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await createAdminAccount(payload);
      if (+res.data.EC === 0) {
        toast.success(res.data.EM || "Tạo admin mới thành công");
        return res.data.DT;
      }
      const message = res.data.EM || "Tạo admin mới thất bại";
      toast.error(message);
      return rejectWithValue(message);
    } catch (error) {
      const message =
        error.response?.data?.EM || "Không thể tạo tài khoản admin";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateAdminAccountThunk = createAsyncThunk(
  "adminAccounts/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await updateAdminAccount(id, data);
      if (+res.data.EC === 0) {
        toast.success(res.data.EM || "Cập nhật admin thành công");
        return res.data.DT;
      }
      const message = res.data.EM || "Cập nhật admin thất bại";
      toast.error(message);
      return rejectWithValue(message);
    } catch (error) {
      const message =
        error.response?.data?.EM || "Không thể cập nhật tài khoản admin";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteAdminAccountThunk = createAsyncThunk(
  "adminAccounts/delete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await deleteAdminAccount(id);
      if (+res.data.EC === 0) {
        toast.success(res.data.EM || "Xóa admin thành công");
        return id;
      }
      const message = res.data.EM || "Xóa admin thất bại";
      toast.error(message);
      return rejectWithValue(message);
    } catch (error) {
      const message =
        error.response?.data?.EM || "Không thể xóa tài khoản admin";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const adminAccountSlice = createSlice({
  name: "adminAccounts",
  initialState,
  reducers: {
    resetAdminAccountError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchAdminAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAdminAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // create
      .addCase(createAdminAccountThunk.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createAdminAccountThunk.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload) {
          state.list.unshift(action.payload);
        }
      })
      .addCase(createAdminAccountThunk.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      // update
      .addCase(updateAdminAccountThunk.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateAdminAccountThunk.fulfilled, (state, action) => {
        state.saving = false;
        const updated = action.payload;
        if (!updated) return;
        state.list = state.list.map((item) =>
          item.id === updated.id ? { ...item, ...updated } : item
        );
      })
      .addCase(updateAdminAccountThunk.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      // delete
      .addCase(deleteAdminAccountThunk.pending, (state, action) => {
        state.deletingId = action.meta.arg;
        state.error = null;
      })
      .addCase(deleteAdminAccountThunk.fulfilled, (state, action) => {
        state.list = state.list.filter((item) => item.id !== action.payload);
        state.deletingId = null;
      })
      .addCase(deleteAdminAccountThunk.rejected, (state, action) => {
        state.deletingId = null;
        state.error = action.payload;
      });
  },
});

export const { resetAdminAccountError } = adminAccountSlice.actions;
export default adminAccountSlice.reducer;
