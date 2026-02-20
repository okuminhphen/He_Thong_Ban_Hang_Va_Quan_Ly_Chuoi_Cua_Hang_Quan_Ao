import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { loginAdmin as loginAdminService } from "../../service/authService";

const persistedAdmin = sessionStorage.getItem("adminInfo");
const persistedToken = sessionStorage.getItem("adminToken");

const initialState = {
  adminInfo: persistedAdmin ? JSON.parse(persistedAdmin) : null,
  token: persistedToken || null,
  isAuthenticated: !!(persistedToken || persistedAdmin),
  loading: false,
  error: null,
};

export const loginAdmin = createAsyncThunk(
  "admin/login",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await loginAdminService(username, password);
      if (response?.data && +response.data.EC === 0) {
        const adminData = response.data.DT;

        if (adminData) {
          sessionStorage.setItem("adminInfo", JSON.stringify(adminData));
          if (adminData.token) {
            sessionStorage.setItem("adminToken", adminData.token);
          }
        }

        toast.success(response.data.EM || "Đăng nhập admin thành công");
        return adminData;
      }

      const errorMessage =
        response?.data?.EM || "Đăng nhập admin không thành công";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    } catch (error) {
      const errorMessage =
        error.response?.data?.EM || "Không thể kết nối đến máy chủ";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    logoutAdmin: (state) => {
      state.adminInfo = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      sessionStorage.removeItem("adminInfo");
      sessionStorage.removeItem("adminToken");
    },
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.adminInfo = action.payload;
        state.token = action.payload?.token || null;
        state.isAuthenticated = true;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Đăng nhập admin thất bại";
      });
  },
});

export const { logoutAdmin, clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
