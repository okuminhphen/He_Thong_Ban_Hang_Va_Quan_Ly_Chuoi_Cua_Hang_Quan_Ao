import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getProducts,
  createNewProduct,
  deleteProduct,
  updateProductAPI,
} from "../../service/productService";
import { toast } from "react-toastify";

// Fetch products
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async () => {
    let response = await getProducts();
    return response.data.DT;
  }
);

// Create product
export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (productData, { rejectWithValue }) => {
    try {
      let response = await createNewProduct(productData);

      if (response.data.EC === 0) {
        toast.success(response.data.EM);
        return response.data;
      } else {
        toast.error(response.data.EM);
        return rejectWithValue(response.data.EM);
      }
    } catch (error) {
      console.error("Lỗi khi tạo sản phẩm:", error);
      const errorMessage =
        error.response?.data?.EM || "Có lỗi xảy ra khi tạo sản phẩm";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Update product
export const updateProductAction = createAsyncThunk(
  "product/updateProduct",
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      let response = await updateProductAPI(id, productData);

      if (response.data.EC === 0) {
        toast.success(response.data.EM);
        return response.data;
      } else {
        toast.error(response.data.EM);
        return rejectWithValue(response.data.EM);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
      const errorMessage =
        error.response?.data?.EM || "Có lỗi xảy ra khi cập nhật sản phẩm";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete product
export const deleteProductAction = createAsyncThunk(
  "products/deleteProduct",
  async (productId, { rejectWithValue }) => {
    try {
      console.log("Deleting product with id:", productId);
      let response = await deleteProduct(productId);

      if (response.data.EC === 0) {
        toast.success(response.data.EM);
        return productId;
      } else {
        toast.error(response.data.EM);
        return rejectWithValue(response.data.EM);
      }
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      const errorMessage =
        error.response?.data?.EM || "Có lỗi xảy ra khi xóa sản phẩm";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    products: [], // Danh sách sản phẩm
    status: "idle", // Trạng thái: 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    createStatus: "idle", // Trạng thái tạo: 'idle' | 'loading' | 'succeeded' | 'failed'
    updateStatus: "idle", // Trạng thái cập nhật: 'idle' | 'loading' | 'succeeded' | 'failed'
    deleteStatus: "idle", // Trạng thái xóa: 'idle' | 'loading' | 'succeeded' | 'failed'
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetCreateStatus: (state) => {
      state.createStatus = "idle";
    },
    resetUpdateStatus: (state) => {
      state.updateStatus = "idle";
    },
    resetDeleteStatus: (state) => {
      state.deleteStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.products = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.error?.message || "Không thể tải danh sách sản phẩm";
      })
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.createStatus = "loading";
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.error = null;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.createStatus = "failed";
        state.error = action.payload || "Không thể tạo sản phẩm";
      })
      // Update product
      .addCase(updateProductAction.pending, (state) => {
        state.updateStatus = "loading";
        state.error = null;
      })
      .addCase(updateProductAction.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        state.error = null;
      })
      .addCase(updateProductAction.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.error = action.payload || "Không thể cập nhật sản phẩm";
      })
      // Delete product
      .addCase(deleteProductAction.pending, (state) => {
        state.deleteStatus = "loading";
        state.error = null;
      })
      .addCase(deleteProductAction.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        state.products = state.products.filter(
          (product) => product.id !== action.payload
        );
        state.error = null;
      })
      .addCase(deleteProductAction.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.error = action.payload || "Không thể xóa sản phẩm";
      });
  },
});

export const {
  clearError,
  resetCreateStatus,
  resetUpdateStatus,
  resetDeleteStatus,
} = productSlice.actions;

export default productSlice.reducer;
