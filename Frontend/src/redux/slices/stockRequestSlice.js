import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  // branch admin
  getMyStockRequests,
  createStockRequest,
  updateStockRequestInfo,
  deleteStockRequest,

  // super admin
  getPendingStockRequests,
  approveStockRequest,
  rejectStockRequest,
} from "../../service/stockRequestService";
import { toast } from "react-toastify";

/* ======================================================
   ADMIN CHI NHÁNH
====================================================== */

// Lấy danh sách request của chi nhánh
export const fetchMyStockRequests = createAsyncThunk(
  "stockRequest/fetchMy",
  async (branchId, { rejectWithValue }) => {
    try {
      const res = await getMyStockRequests(branchId);

      if (+res.data.EC === 0) return res.data.DT;

      return rejectWithValue(res.data.EM);
    } catch (e) {
      console.log(e);
      return rejectWithValue("Không thể tải danh sách yêu cầu");
    }
  }
);

// Tạo stock request
export const createStockRequestThunk = createAsyncThunk(
  "stockRequest/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await createStockRequest(data);
      if (+res.data.EC === 0) {
        toast.success(res.data.EM || "Tạo yêu cầu thành công");
        return res.data.DT;
      }
      toast.error(res.data.EM);
      return rejectWithValue(res.data.EM);
    } catch (e) {
      toast.error("Lỗi khi tạo yêu cầu");
      return rejectWithValue("Lỗi khi tạo yêu cầu");
    }
  }
);

// Cập nhật info (chỉ pending)
export const updateStockRequestInfoThunk = createAsyncThunk(
  "stockRequest/updateInfo",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      console.log(id);
      console.log(data.updatedBy);
      const res = await updateStockRequestInfo(id, data);
      if (+res.data.EC === 0) {
        toast.success(res.data.EM || "Cập nhật thành công");
        return res.data.DT;
      }
      toast.error(res.data.EM);
      return rejectWithValue(res.data.EM);
    } catch (e) {
      toast.error("Lỗi khi cập nhật");
      return rejectWithValue("Lỗi khi cập nhật");
    }
  }
);

// Xóa request (chỉ pending)
export const deleteStockRequestThunk = createAsyncThunk(
  "stockRequest/delete",
  async ({ id, deletedBy }, { rejectWithValue }) => {
    try {
      const res = await deleteStockRequest(id, { deletedBy }); // <-- gửi object
      if (+res.data.EC === 0) {
        toast.success(res.data.EM || "Xóa thành công");
        return id;
      }
      toast.error(res.data.EM);
      return rejectWithValue(res.data.EM);
    } catch (e) {
      toast.error("Lỗi khi xóa");
      return rejectWithValue("Lỗi khi xóa");
    }
  }
);

/* ======================================================
   ADMIN TỔNG
====================================================== */

// Lấy danh sách request pending
export const fetchPendingStockRequests = createAsyncThunk(
  "stockRequest/fetchPending",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getPendingStockRequests();
      if (+res.data.EC === 0) return res.data.DT;
      return rejectWithValue(res.data.EM);
    } catch (e) {
      return rejectWithValue("Không thể tải danh sách pending");
    }
  }
);

// Approve request → tạo TransferReceipt
export const approveStockRequestThunk = createAsyncThunk(
  "stockRequest/approve",
  async (id, { rejectWithValue }) => {
    try {
      const res = await approveStockRequest(id);
      if (+res.data.EC === 0) {
        toast.success("Đã duyệt yêu cầu");
        return res.data.DT;
      }
      toast.error(res.data.EM);
      return rejectWithValue(res.data.EM);
    } catch (e) {
      toast.error("Lỗi khi duyệt");
      return rejectWithValue("Lỗi khi duyệt");
    }
  }
);

// Reject request
export const rejectStockRequestThunk = createAsyncThunk(
  "stockRequest/reject",
  async ({ id, note }, { rejectWithValue }) => {
    try {
      const res = await rejectStockRequest(id, note);
      if (+res.data.EC === 0) {
        toast.success("Đã từ chối yêu cầu");
        return res.data.DT;
      }
      toast.error(res.data.EM);
      return rejectWithValue(res.data.EM);
    } catch (e) {
      toast.error("Lỗi khi từ chối");
      return rejectWithValue("Lỗi khi từ chối");
    }
  }
);

/* ======================================================
   SLICE
====================================================== */

const initialState = {
  requests: [],
  loading: false,
  error: null,
  selectedRequest: null,
};

const stockRequestSlice = createSlice({
  name: "stockRequest",
  initialState,
  reducers: {
    setSelectedRequest: (state, action) => {
      state.selectedRequest = action.payload;
    },
    clearSelectedRequest: (state) => {
      state.selectedRequest = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* ===== FETCH ===== */
      .addCase(fetchMyStockRequests.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchMyStockRequests.fulfilled, (s, a) => {
        s.loading = false;
        s.requests = (a.payload || []).filter(
          (req) => req && typeof req === "object" && req.id && req.code
        );
      })
      .addCase(fetchMyStockRequests.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(fetchPendingStockRequests.fulfilled, (s, a) => {
        s.requests = (a.payload || []).filter(
          (r) => r && typeof r === "object" && r.id
        );
      })

      /* ===== CREATE ===== */
      .addCase(createStockRequestThunk.fulfilled, (s, a) => {
        if (
          a.payload &&
          typeof a.payload === "object" &&
          a.payload.id &&
          a.payload.code
        ) {
          s.requests.unshift(a.payload);
        }
      })

      /* ===== UPDATE INFO ===== */
      .addCase(updateStockRequestInfoThunk.fulfilled, (s, a) => {
        if (
          a.payload &&
          typeof a.payload === "object" &&
          a.payload.id &&
          a.payload.code
        ) {
          s.requests = s.requests.map((r) =>
            r.id === a.payload.id ? a.payload : r
          );
        }
      })

      /* ===== DELETE ===== */
      .addCase(deleteStockRequestThunk.fulfilled, (s, a) => {
        s.requests = s.requests.filter((r) => r && r.id !== a.payload);
      })

      /* ===== APPROVE / REJECT ===== */
      .addCase(approveStockRequestThunk.fulfilled, (s, a) => {
        const approvedId = a.meta.arg; // id truyền vào thunk
        s.requests = s.requests.filter((r) => r && r.id !== approvedId);
      })
      .addCase(rejectStockRequestThunk.fulfilled, (s, a) => {
        const { id } = a.meta.arg; // { id, note }
        s.requests = s.requests.filter((r) => r && r.id !== id);
      });
  },
});

export const { setSelectedRequest, clearSelectedRequest } =
  stockRequestSlice.actions;

export default stockRequestSlice.reducer;
