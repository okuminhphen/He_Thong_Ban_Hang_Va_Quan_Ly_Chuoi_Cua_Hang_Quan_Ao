import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Badge,
  Button,
  Alert,
  Modal,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrdersUserThunk,
  updateOrderStatusThunk,
} from "../../redux/slices/orderSlice";
import { useParams, useNavigate } from "react-router-dom";
import "./OrderDetailsPage.scss";
import { toast } from "react-toastify";

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const userId = JSON.parse(sessionStorage.getItem("user")).userId;
  const dispatch = useDispatch();
  const { orders = [], status } = useSelector((state) => state.orders);

  const loading = status === "loading";
  const orderById = orders.find((order) => order.id === Number(orderId));

  const shippingFee = 30000;
  useEffect(() => {
    if (orderById) {
      setOrder(orderById);
    }
  }, [orderById]);

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
      text: "Không xác định",
    };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };
  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { variant: "warning", text: "Chờ thanh toán" },
      COMPLETED: { variant: "info", text: "Đã thanh toán" },
      FAILED: { variant: "primary", text: "Thanh toán thất bại" },
      REFUNDED: { variant: "success", text: "Đã hoàn tiền" },
      CANCELLED: { variant: "danger", text: "Thanh toán bị hủy" },
    };

    const config = statusConfig[status] || {
      variant: "secondary",
      text: "Không xác định",
    };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };
  const getProductImages = (images) => {
    if (!images) return [];

    let parsed = images;

    try {
      // parse nhiều lần nếu cần
      while (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }
    } catch (e) {
      console.error("Parse images error:", e);
      return [];
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
  const handleCancelOrder = async () => {
    try {
      await dispatch(
        updateOrderStatusThunk({
          orderId,
          updatedData: { status: "CANCELLED" },
        })
      ).unwrap(); // Đợi action hoàn thành

      // 🔄 Cập nhật lại danh sách đơn hàng trong Redux
      await dispatch(fetchOrdersUserThunk());
      toast.success("Đơn hàng đã được hủy thành công!");
      setShowCancelModal(false);
      setCancelError(null);
    } catch (error) {
      console.error("❌ Lỗi khi hủy đơn hàng:", error);

      setCancelError(
        error.message || "Không thể hủy đơn hàng. Vui lòng thử lại sau."
      );
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">Đang tải...</div>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-5">
        <Alert variant="danger">Không tìm thấy đơn hàng</Alert>
      </Container>
    );
  }

  return (
    <>
      <Container className="order-details-page py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Chi tiết đơn hàng</h2>
          <Button
            variant="outline-primary"
            onClick={() => window.history.back()}
          >
            Quay lại
          </Button>
        </div>

        {cancelError && (
          <Alert variant="danger" className="mb-4">
            {cancelError}
          </Alert>
        )}

        <Row>
          <Col lg={8}>
            {/* Thông tin sản phẩm */}
            <Card className="mb-4">
              <Card.Header className="bg-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Sản phẩm</h5>
                  {getStatusBadge(order.status)}
                </div>
              </Card.Header>
              <Card.Body>
                {order.ordersDetails.map((item) => {
                  const images = getProductImages(item.productImage);
                  return (
                    <div key={item.id} className="order-item">
                      <div className="d-flex">
                        <img
                          src={images[0]?.url || ""}
                          alt={item.productName}
                          className="item-image"
                        />
                        <div className="item-info">
                          <h6>{item.productName}</h6>
                          <h6>{item.productSize}</h6>
                          <div className="text-muted">
                            {formatPrice(item.priceAtOrder)} x {item.quantity}
                          </div>
                        </div>
                        <div className="item-total">
                          {formatPrice(item.priceAtOrder * item.quantity)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </Card.Body>
            </Card>

            {/* Thông tin giao hàng */}
            <Card>
              <Card.Header className="bg-white">
                <h5 className="mb-0">Thông tin giao hàng</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <div className="text-muted">Người nhận</div>
                      <div>{order.customerName}</div>
                    </div>
                    <div className="mb-3">
                      <div className="text-muted">Số điện thoại</div>
                      <div>{order.customerPhone}</div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <div className="text-muted">Địa chỉ</div>
                      <div>{order.shippingAddress}</div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            {/* Tổng quan đơn hàng */}
            <Card className="order-summary">
              <Card.Header className="bg-white">
                <h5 className="mb-0">Tổng quan đơn hàng</h5>
              </Card.Header>
              <Card.Body>
                <div className="summary-item">
                  <span>Ngày đặt</span>
                  <span>{formatDate(order.orderDate)}</span>
                </div>
                <div className="summary-item">
                  <span>Phương thức thanh toán</span>
                  <span>{order.payment.paymentMethod.description}</span>
                </div>
                <div className="summary-item">
                  <span>Trạng thái thanh toán</span>
                  <span>{getPaymentStatusBadge(order.payment.status)}</span>
                </div>
                <div className="summary-item">
                  <span>Tạm tính</span>
                  <span>{formatPrice(order.totalPrice)}</span>
                </div>
                <div className="summary-item">
                  <span>Phí vận chuyển</span>
                  <span>{formatPrice(shippingFee)}</span>
                </div>
                <div className="summary-item total">
                  <span>Tổng cộng</span>
                  <span>{formatPrice(order.payment.amount)}</span>
                </div>

                {orderById.status === "PENDING" &&
                  orderById.payment.status === "PENDING" && (
                    <Button
                      variant="danger"
                      className="w-100 mt-3"
                      onClick={() => setShowCancelModal(true)}
                    >
                      Hủy đơn hàng
                    </Button>
                  )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      {/* 🔥 Modal xác nhận hủy đơn hàng */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận hủy đơn hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn hủy đơn hàng #{order.id} không?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Đóng
          </Button>
          <Button variant="danger" onClick={handleCancelOrder}>
            Xác nhận hủy đơn
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default OrderDetailsPage;
