import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaBoxOpen, FaWarehouse } from "react-icons/fa";
import {
  fetchEmployeesByBranchThunk,
  createEmployeeThunk,
  updateEmployeeThunk,
  deleteEmployeeThunk,
} from "../../redux/slices/employeeSlice";
import { fetchAdminAccounts } from "../../redux/slices/adminAccountSlice";
import { fetchInventoryByBranch } from "../../redux/slices/inventorySlice";
import { BACKEND_URL } from "../../config/constants.js";

const BranchDetail = ({ branchId }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { employees, status, error } = useSelector((state) => state.employee);
  const { list: admins } = useSelector((state) => state.adminAccounts);
  const {
    items: inventoryItems,
    status: inventoryStatus,
    error: inventoryError,
  } = useSelector((state) => state.inventory);

  const [showForm, setShowForm] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    phone: "",
    email: "",
    status: "active",
    adminId: "",
  });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [detailFadeOut, setDetailFadeOut] = useState(false);

  useEffect(() => {
    if (branchId) {
      dispatch(fetchEmployeesByBranchThunk(branchId));
      dispatch(fetchInventoryByBranch(branchId));
    }
    dispatch(fetchAdminAccounts());
  }, [branchId, dispatch]);

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setFormData({
      name: "",
      position: "",
      phone: "",
      email: "",
      status: "active",
      adminId: "",
    });
    setShowForm(true);
    setFadeOut(false);
  };

  const handleEditEmployee = (emp, e) => {
    e?.stopPropagation();
    setEditingEmployee(emp);
    setFormData({
      name: emp.name || "",
      position: emp.position || "",
      phone: emp.phone || "",
      email: emp.email || "",
      status: emp.status || "active",
      adminId: emp.adminId ? String(emp.adminId) : "",
    });
    setShowForm(true);
    setFadeOut(false);
  };

  const handleViewEmployeeDetail = (emp) => {
    setSelectedEmployee(emp);
    setShowDetailModal(true);
    setDetailFadeOut(false);
  };

  const handleCloseDetailModal = () => {
    setDetailFadeOut(true);
    setTimeout(() => {
      setShowDetailModal(false);
      setSelectedEmployee(null);
    }, 200);
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa nhân viên này không?")) {
      await dispatch(deleteEmployeeThunk(id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        name: formData.name,
        position: formData.position,
        phone: formData.phone,
        email: formData.email,
        status: formData.status,
        branchId: parseInt(branchId), // Luôn lấy từ chi nhánh hiện tại
      };

      // Chỉ thêm adminId nếu có giá trị (không bắt buộc khi thêm mới)
      if (formData.adminId) {
        submitData.adminId = parseInt(formData.adminId);
      }

      if (editingEmployee) {
        await dispatch(
          updateEmployeeThunk({
            employeeId: editingEmployee.id,
            updatedData: submitData,
          })
        );
      } else {
        await dispatch(createEmployeeThunk(submitData));
      }
      handleCloseForm();
    } catch (error) {
      console.error("Error saving employee:", error);
      alert("Có lỗi xảy ra khi lưu nhân viên!");
    }
  };

  const handleCloseForm = () => {
    setFadeOut(true);
    setTimeout(() => setShowForm(false), 200);
  };

  // Inventory helper functions (from InventoryPage)
  const formatCurrency = (value) => {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      return "0 ₫";
    }
    return numeric.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    });
  };

  const parseImages = (images) => {
    if (!images) return [];

    let parsed = images;

    try {
      // parse nhiều lần nếu cần
      while (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }
    } catch (e) {
      console.error("Parse images error:", e);
      // Nếu parse lỗi và là chuỗi có dấu phẩy, thử split
      if (typeof images === "string" && images.includes(",")) {
        parsed = images.split(",").map((item) => item.trim());
      } else {
        return [];
      }
    }

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((img) => {
        if (typeof img === "string") return { url: img };
        if (img?.url) return { url: img.url };
        return null;
      })
      .filter(Boolean);
  };

  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${BACKEND_URL}${path}`;
  };

  const parseDescription = (description) => {
    if (!description) return [];
    if (Array.isArray(description)) return description;

    try {
      const parsed = JSON.parse(description);
      if (Array.isArray(parsed)) return parsed;

      if (typeof parsed === "string") {
        const parsedAgain = JSON.parse(parsed);
        if (Array.isArray(parsedAgain)) return parsedAgain;
        if (parsedAgain)
          return [{ title: "Mô tả", content: parsedAgain.toString() }];
      }
    } catch (error) {
      if (typeof description === "string" && description.trim() !== "") {
        return [{ title: "Mô tả", content: description }];
      }
    }

    return [];
  };

  // Flatten inventory data for table display
  const expandedInventory = useMemo(() => {
    if (!Array.isArray(inventoryItems)) return [];

    return inventoryItems.flatMap((product, productIndex) => {
      const sizeEntries =
        Array.isArray(product.sizes) && product.sizes.length > 0
          ? product.sizes
          : [{ sizeName: "--", stock: product.stock || 0 }];

      return sizeEntries.map((sizeEntry, index) => ({
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        productImages: product.images,
        productDescription: product.description,
        productSizeId: sizeEntry.productSizeId,
        sizeId: `${product.id}-${sizeEntry.sizeId || sizeEntry.id || index}`,
        sizeName:
          sizeEntry.sizeName || sizeEntry.name || sizeEntry.size?.name || "--",
        stock:
          Number(sizeEntry.stock || sizeEntry.inventories?.[0]?.stock) || 0,
        isFirstRow: index === 0,
        totalSizes: sizeEntries.length,
        rowGroupIndex: productIndex,
      }));
    });
  }, [inventoryItems]);

  const totalStock = useMemo(() => {
    return expandedInventory.reduce((sum, item) => sum + (item.stock || 0), 0);
  }, [expandedInventory]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          {/* <h1 className="text-3xl font-bold text-gray-800">
            Chi tiết chi nhánh #{branchId}
          </h1> */}
          <p className="text-gray-500 mt-1">
            Quản lý nhân viên và tồn kho chi nhánh
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition focus:outline-none"
        >
          ← Quay lại
        </button>
      </div>

      {/* Bảng nhân viên */}
      <section className="bg-white shadow-lg rounded-xl p-6 mb-10 border border-gray-100">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            👥 Danh sách nhân viên
          </h2>
          <button
            onClick={handleAddEmployee}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition focus:outline-none"
            disabled={status === "loading"}
          >
            + Thêm nhân viên
          </button>
        </div>

        {status === "loading" && (
          <div className="text-center py-8 text-gray-500">
            Đang tải danh sách nhân viên...
          </div>
        )}

        {status === "failed" && (
          <div className="text-center py-8 text-red-500">
            {error?.EM || "Có lỗi xảy ra khi tải danh sách nhân viên!"}
          </div>
        )}

        {status === "succeeded" && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
                <tr>
                  <th className="py-3 px-4 text-left">Mã NV</th>
                  <th className="py-3 px-4 text-left">Họ tên</th>
                  <th className="py-3 px-4 text-left">Chức vụ</th>
                  <th className="py-3 px-4 text-left">Số điện thoại</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Trạng thái</th>
                  <th className="py-3 px-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {employees && employees.length > 0 ? (
                  employees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="border-t hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => handleViewEmployeeDetail(emp)}
                    >
                      <td className="py-3 px-4">{emp.code}</td>
                      <td className="py-3 px-4">{emp.name}</td>
                      <td className="py-3 px-4">{emp.position}</td>
                      <td className="py-3 px-4">{emp.phone}</td>
                      <td className="py-3 px-4">{emp.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            emp.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {emp.status === "active"
                            ? "Đang làm việc"
                            : "Ngừng làm việc"}
                        </span>
                      </td>
                      <td
                        className="py-3 px-4 text-center space-x-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => handleEditEmployee(emp, e)}
                          className="text-blue-600 hover:text-blue-800 font-medium focus:outline-none"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(emp.id)}
                          className="text-red-600 hover:text-red-800 font-medium focus:outline-none"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500">
                      Chưa có nhân viên nào trong chi nhánh này
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Bảng tồn kho */}
      <section className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-xl text-indigo-600">
              <FaWarehouse />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Danh sách tồn kho
              </h2>
              <p className="text-sm text-gray-500">
                Theo dõi số lượng tồn theo từng size tại chi nhánh
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-xl text-violet-600">
              <FaBoxOpen />
            </span>
            <div>
              <p className="text-sm text-gray-500">Tổng mẫu size</p>
              <p className="text-2xl font-semibold text-gray-900">
                {expandedInventory.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-xl text-sky-600">
              <FaWarehouse />
            </span>
            <div>
              <p className="text-sm text-gray-500">Tổng tồn kho</p>
              <p className="text-2xl font-semibold text-gray-900">
                {totalStock}
              </p>
            </div>
          </div>
        </div>

        {inventoryStatus === "loading" && (
          <div className="text-center py-8 text-gray-500">
            Đang tải danh sách tồn kho...
          </div>
        )}

        {inventoryStatus === "failed" && (
          <div className="text-center py-8 text-red-500">
            {inventoryError || "Có lỗi xảy ra khi tải danh sách tồn kho!"}
          </div>
        )}

        {inventoryStatus === "succeeded" && (
          <div className="overflow-hidden rounded-2xl border border-gray-200">
            {expandedInventory.length === 0 ? (
              <div className="flex h-48 items-center justify-center px-6 text-center text-sm text-gray-500">
                Chưa có dữ liệu tồn kho cho chi nhánh này.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 text-sm">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-6 py-4 text-left">Sản phẩm</th>
                      <th className="px-6 py-4 text-left">Mô tả</th>
                      <th className="px-6 py-4 text-left">Giá</th>
                      <th className="px-6 py-4 text-right">Size</th>
                      <th className="px-6 py-4 text-right">Tồn kho</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {expandedInventory.map((item) => {
                      const images = parseImages(item?.productImages);
                      const thumbnail = images.length > 0 ? images[0]?.url : "";
                      const descriptions = parseDescription(
                        item?.productDescription
                      );
                      const displayedDescriptions = descriptions.slice(0, 2);
                      return (
                        <tr
                          key={`${item.productId}-${item.sizeId}`}
                          className="hover:bg-gray-50/80"
                        >
                          {item.isFirstRow && (
                            <td
                              className="px-6 py-4 align-top"
                              rowSpan={item.totalSizes}
                            >
                              <div className="flex items-center gap-4">
                                {thumbnail ? (
                                  <img
                                    src={getImageUrl(thumbnail)}
                                    alt={item?.productName || "product"}
                                    className="h-14 w-14 rounded-2xl object-cover"
                                  />
                                ) : (
                                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                                    <FaBoxOpen />
                                  </div>
                                )}
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {item?.productName || "Không xác định"}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Mã: {item?.productId || "---"}
                                  </p>
                                </div>
                              </div>
                            </td>
                          )}
                          {item.isFirstRow && (
                            <td
                              className="px-6 py-4 text-sm text-gray-600 align-top"
                              rowSpan={item.totalSizes}
                            >
                              {displayedDescriptions.length > 0 ? (
                                <div className="space-y-1">
                                  {displayedDescriptions.map((desc, idx) => (
                                    <div key={`${item.productId}-desc-${idx}`}>
                                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        {desc.title || `Mô tả ${idx + 1}`}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {desc.content || "Không có nội dung"}
                                      </p>
                                    </div>
                                  ))}
                                  {descriptions.length >
                                    displayedDescriptions.length && (
                                    <p className="text-xs text-gray-400">
                                      +
                                      {descriptions.length -
                                        displayedDescriptions.length}{" "}
                                      mô tả khác
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs italic text-gray-400">
                                  Không có mô tả
                                </span>
                              )}
                            </td>
                          )}
                          {item.isFirstRow && (
                            <td
                              className="px-6 py-4 text-gray-700"
                              rowSpan={item.totalSizes}
                            >
                              {formatCurrency(item?.productPrice)}
                            </td>
                          )}
                          <td className="px-6 py-4 text-right font-semibold text-gray-800">
                            {item?.sizeName || "--"}
                          </td>
                          <td className="px-6 py-4 text-right text-lg font-semibold text-indigo-600">
                            {Number(item?.stock) || 0}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Form popup thêm/sửa nhân viên */}
      {showForm && (
        <div
          className={`fixed inset-0 flex justify-center items-center z-50 transition-opacity duration-200 ${
            fadeOut ? "opacity-0" : "opacity-100"
          }`}
          onClick={handleCloseForm}
        >
          {/* Nền mờ */}
          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-200"></div>

          {/* Form */}
          <div
            className={`relative bg-white rounded-xl shadow-xl p-6 w-[500px] max-h-[90vh] overflow-y-auto transform transition-all duration-200 ${
              fadeOut ? "scale-95 opacity-0" : "scale-100 opacity-100"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              {editingEmployee ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nhập họ tên"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chức vụ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nhập chức vụ"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Nhập email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nhập số điện thoại"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tài khoản (Admin)
                </label>
                <select
                  value={formData.adminId || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, adminId: e.target.value })
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                >
                  <option value="">Không chọn (tùy chọn)</option>
                  {admins && admins.length > 0 ? (
                    admins.map((admin) => (
                      <option key={admin.id} value={admin.id}>
                        {admin.username || admin.fullname}{" "}
                        {admin.email ? `(${admin.email})` : ""}
                      </option>
                    ))
                  ) : (
                    <option value="">Không có admin nào</option>
                  )}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Trường này không bắt buộc khi thêm nhân viên mới
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                  required
                >
                  <option value="active">Đang làm việc</option>
                  <option value="inactive">Ngừng làm việc</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-5">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition focus:outline-none"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition focus:outline-none"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal chi tiết nhân viên */}
      {showDetailModal && selectedEmployee && (
        <div
          className={`fixed inset-0 flex justify-center items-center z-50 transition-opacity duration-200 ${
            detailFadeOut ? "opacity-0" : "opacity-100"
          }`}
          onClick={handleCloseDetailModal}
        >
          {/* Nền mờ */}
          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-200"></div>

          {/* Modal */}
          <div
            className={`relative bg-white rounded-xl shadow-xl p-6 w-[500px] max-h-[90vh] overflow-y-auto transform transition-all duration-200 ${
              detailFadeOut ? "scale-95 opacity-0" : "scale-100 opacity-100"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Chi tiết nhân viên
              </h3>
              <button
                onClick={handleCloseDetailModal}
                className="text-gray-400 hover:text-gray-600 text-2xl focus:outline-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Mã nhân viên và Trạng thái */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Mã nhân viên
                  </label>
                  <p className="mt-1 text-gray-800 font-semibold text-lg">
                    {selectedEmployee.code || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Trạng thái
                  </label>
                  <p className="mt-1">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedEmployee.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedEmployee.status === "active"
                        ? "Đang làm việc"
                        : "Ngừng làm việc"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Họ và tên */}
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Họ và tên
                </label>
                <p className="mt-1 text-gray-800 text-lg font-semibold">
                  {selectedEmployee.name || "N/A"}
                </p>
              </div>

              {/* Chức vụ */}
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Chức vụ
                </label>
                <p className="mt-1 text-gray-800">
                  {selectedEmployee.position || "Chưa cập nhật"}
                </p>
              </div>

              {/* Email và Số điện thoại */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="mt-1 text-gray-800">
                    {selectedEmployee.email || "Chưa cập nhật"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Số điện thoại
                  </label>
                  <p className="mt-1 text-gray-800">
                    {selectedEmployee.phone || "Chưa cập nhật"}
                  </p>
                </div>
              </div>

              {/* Chi nhánh */}
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Chi nhánh
                </label>
                <p className="mt-1 text-gray-800">
                  {selectedEmployee.branch?.name || "Chưa cập nhật"}
                </p>
              </div>

              {/* Lương và Ngày vào làm */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Lương
                  </label>
                  <p className="mt-1 text-gray-800 font-semibold">
                    {selectedEmployee.salary
                      ? new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(selectedEmployee.salary)
                      : "Chưa cập nhật"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Ngày vào làm
                  </label>
                  <p className="mt-1 text-gray-800">
                    {selectedEmployee.hiredAt
                      ? new Date(selectedEmployee.hiredAt).toLocaleDateString(
                          "vi-VN",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : "Chưa cập nhật"}
                  </p>
                </div>
              </div>

              {/* Tài khoản */}
              <div className="border-t pt-4">
                <label className="text-sm font-medium text-gray-500 mb-2 block">
                  Thông tin tài khoản (Admin)
                </label>
                {selectedEmployee.admin ? (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-400">
                          Username
                        </label>
                        <p className="text-gray-800 font-medium">
                          {selectedEmployee.admin.username || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">
                          Email tài khoản
                        </label>
                        <p className="text-gray-800 font-medium">
                          {selectedEmployee.admin.email || "N/A"}
                        </p>
                      </div>
                    </div>
                    {selectedEmployee.admin.fullname && (
                      <div>
                        <label className="text-xs text-gray-400">
                          Họ tên tài khoản
                        </label>
                        <p className="text-gray-800 font-medium">
                          {selectedEmployee.admin.fullname}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-sm">
                    Nhân viên này chưa có tài khoản admin
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={handleCloseDetailModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition focus:outline-none"
              >
                Đóng
              </button>
              <button
                onClick={(e) => {
                  handleCloseDetailModal();
                  setTimeout(() => {
                    handleEditEmployee(selectedEmployee);
                  }, 250);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition focus:outline-none"
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchDetail;
