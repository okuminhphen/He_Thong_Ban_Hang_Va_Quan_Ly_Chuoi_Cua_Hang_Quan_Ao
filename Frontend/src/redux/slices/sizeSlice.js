import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchSizes as fetchSizesApi,
  createSize as createSizeApi,
  updateSize as updateSizeApi,
  deleteSize as deleteSizeApi,
} from "../../service/sizeService";

const handleResponse = (response, rejectWithValue, fallbackMessage) => {
  const data = response?.data;
  if (data?.EC !== 0) {
    return rejectWithValue(
      data || { EM: fallbackMessage, EC: data?.EC ?? -1, DT: null }
    );
  }
  return data;
};

export const fetchSizes = createAsyncThunk(
  "sizes/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchSizesApi();
      const data = handleResponse(
        response,
        rejectWithValue,
        "Không thể lấy danh sách size"
      );
      return data.DT || [];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || {
          EM: "Không thể lấy danh sách size",
          EC: -1,
        }
      );
    }
  }
);

export const createSizeThunk = createAsyncThunk(
  "sizes/create",
  async (sizeData, { rejectWithValue }) => {
    try {
      const response = await createSizeApi(sizeData);
      const data = handleResponse(
        response,
        rejectWithValue,
        "Không thể tạo size"
      );
      return data.DT;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { EM: "Không thể tạo size", EC: -1 }
      );
    }
  }
);

export const updateSizeThunk = createAsyncThunk(
  "sizes/update",
  async (sizeData, { rejectWithValue }) => {
    try {
      const response = await updateSizeApi(sizeData);
      const data = handleResponse(
        response,
        rejectWithValue,
        "Không thể cập nhật size"
      );
      return data.DT;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { EM: "Không thể cập nhật size", EC: -1 }
      );
    }
  }
);

export const deleteSizeThunk = createAsyncThunk(
  "sizes/delete",
  async (sizeId, { rejectWithValue }) => {
    try {
      const response = await deleteSizeApi(sizeId);
      handleResponse(response, rejectWithValue, "Không thể xóa size");
      return sizeId;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { EM: "Không thể xóa size", EC: -1 }
      );
    }
  }
);

const initialState = {
  sizes: [],
  status: "idle",
  error: null,
  mutationStatus: "idle",
  mutationError: null,
};

const sizeSlice = createSlice({
  name: "sizes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSizes.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSizes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.sizes = action.payload || [];
      })
      .addCase(fetchSizes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.EM || action.error?.message || null;
      })
      .addCase(createSizeThunk.pending, (state) => {
        state.mutationStatus = "loading";
        state.mutationError = null;
      })
      .addCase(createSizeThunk.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        if (action.payload) {
          state.sizes.push(action.payload);
        }
      })
      .addCase(createSizeThunk.rejected, (state, action) => {
        state.mutationStatus = "failed";
        state.mutationError =
          action.payload?.EM || action.error?.message || null;
      })
      .addCase(updateSizeThunk.pending, (state) => {
        state.mutationStatus = "loading";
        state.mutationError = null;
      })
      .addCase(updateSizeThunk.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        if (action.payload) {
          state.sizes = state.sizes.map((size) =>
            size.id === action.payload.id
              ? { ...size, ...action.payload }
              : size
          );
        }
      })
      .addCase(updateSizeThunk.rejected, (state, action) => {
        state.mutationStatus = "failed";
        state.mutationError =
          action.payload?.EM || action.error?.message || null;
      })
      .addCase(deleteSizeThunk.pending, (state) => {
        state.mutationStatus = "loading";
        state.mutationError = null;
      })
      .addCase(deleteSizeThunk.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        state.sizes = state.sizes.filter((size) => size.id !== action.payload);
      })
      .addCase(deleteSizeThunk.rejected, (state, action) => {
        state.mutationStatus = "failed";
        state.mutationError =
          action.payload?.EM || action.error?.message || null;
      });
  },
});

export default sizeSlice.reducer;
