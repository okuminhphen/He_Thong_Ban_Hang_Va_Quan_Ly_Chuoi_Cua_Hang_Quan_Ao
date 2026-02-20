import React, { useEffect, useState } from "react";
import { Container, Table, Badge, Button, Tabs, Tab } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrdersUserThunk } from "../../redux/slices/orderSlice";
import "./OrdersPage.scss";

const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState("ALL");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { orders = [], status, error } = useSelector((state) => state.orders);
  const loading = status === "loading";
  useEffect(() => {
    dispatch(fetchOrdersUserThunk()); // ✅ Gọi API lấy danh sách đơn hàng
  }, [dispatch]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { variant: "warning", text: "Chờ xác nhận" },
      CONFIRMED: { variant: "info", text: "Đã xác nhận" },
      SHIPPING: { variant: "primary", text: "Đang giao" },
      COMPLETED: { variant: "success", text: "Đã giao" },
      CANCELLED: { variant: "danger", text: "Đã hủy" },
    };

    const config = statusConfig[status] || {
      variant: "secondary",
      text: "Tất cả",
    };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const filterOrders = (status) => {
    if (status === "ALL") return orders;
    return orders.filter((order) => order.status === status);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // Hiển thị 24h
    });
  };

  return (
    <Container className="orders-page py-5">
      <h2 className="mb-4">Đơn hàng của tôi</h2>

      {error && <div className="text-danger">Lỗi: {error}</div>}

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        {[
          "ALL",
          "PENDING",
          "CONFIRMED",
          "SHIPPING",
          "COMPLETED",
          "CANCELLED",
        ].map((status) => (
          <Tab key={status} eventKey={status} title={getStatusBadge(status)}>
            <OrdersTable
              orders={filterOrders(status)}
              loading={loading}
              getStatusBadge={getStatusBadge}
              formatPrice={formatPrice}
              formatDate={formatDate}
              navigate={navigate}
            />
          </Tab>
        ))}
      </Tabs>
    </Container>
  );
};
const OrdersTable = ({
  orders,
  loading,
  getStatusBadge,
  formatPrice,
  formatDate,
  navigate,
}) => {
  if (loading) {
    return <div className="text-center py-4">Đang tải...</div>;
  }

  if (!orders || orders.length === 0) {
    // ✅ Kiểm tra orders trước khi map
    return <div className="text-center py-4">Không có đơn hàng nào</div>;
  }

  return (
    <div className="table-responsive">
      <Table hover className="orders-table">
        <thead>
          <tr>
            <th>Mã đơn hàng</th>
            <th>Ngày đặt</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="order-id">{order.code}</td>
              <td>{formatDate(order.orderDate)}</td>
              <td className="order-total">
                {formatPrice(order.payment?.amount || 0)}
              </td>
              <td>{getStatusBadge(order.status)}</td>
              <td>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => navigate(`/orders/details/${order.id}`)}
                >
                  Chi tiết
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};
export default OrdersPage;
