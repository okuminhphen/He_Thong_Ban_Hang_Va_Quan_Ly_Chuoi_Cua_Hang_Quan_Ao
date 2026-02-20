import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  Card,
  ListGroup,
  Form,
  Button,
  InputGroup,
  Row,
  Col,
} from "react-bootstrap";
import { FaPaperPlane, FaComments } from "react-icons/fa";
import { getAllConversations, getMessages } from "../../service/chatService";
import { useSelector } from "react-redux";
import { BACKEND_URL } from "../../config/constants.js";
import "./ConversationPage.scss";

const ConversationPage = () => {
  const { adminInfo } = useSelector((state) => state.admin);
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const currentUserId = adminInfo?.adminId;
  // Kết nối socket khi component mount
  useEffect(() => {
    const newSocket = io(BACKEND_URL, {
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("🟢 Admin connected:", newSocket.id);
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  // Load conversations khi có admin
  useEffect(() => {
    if (currentUserId) {
      loadConversations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  // Xử lý newMessage event
  useEffect(() => {
    if (!socket || conversations.length === 0) return;

    conversations.forEach((c) => {
      socket.emit("join", c.id);
    });
  }, [socket, conversations]);

  // Join room khi chọn conversation
  useEffect(() => {
    if (!selectedConversation) return;
    loadMessages(selectedConversation.id);
  }, [selectedConversation]);

  // Auto scroll to bottom khi có message mới
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      // nếu đang mở conversation đó
      if (msg.conversationId === selectedConversation?.id) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }

      // update last message cho list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === msg.conversationId
            ? { ...c, lastMessage: msg.message, updatedAt: msg.createdAt }
            : c
        )
      );
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, selectedConversation]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const res = await getAllConversations();

      if (res.data.EC === 0) {
        setConversations(res.data.DT || []);
        if (!selectedConversation && res.data.DT?.length > 0) {
          setSelectedConversation(res.data.DT[0]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    const res = await getMessages(conversationId);
    if (res.data.EC === 0) {
      setMessages(res.data.DT || []);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !selectedConversation) return;

    socket.emit("sendMessage", {
      conversationId: selectedConversation.id,
      senderId: currentUserId,
      senderRole: "admin",
      message: newMessage.trim(),
    });

    setNewMessage("");
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} giờ trước`;

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getConversationTitle = (conversation) => {
    if (conversation.user?.fullname) {
      return conversation.user.fullname;
    }
    if (conversation.user?.username) {
      return conversation.user.username;
    }
    return `User #${conversation.userId}`;
  };

  const isMyMessage = (message) => {
    return message.senderId === currentUserId && message.senderRole === "admin";
  };

  // Không hiển thị nếu chưa đăng nhập admin
  if (!currentUserId) {
    return (
      <div className="text-center py-5">
        <div>Vui lòng đăng nhập với tài khoản admin</div>
      </div>
    );
  }

  return (
    <div className="conversation-page">
      <Row className="h-100">
        {/* Sidebar - Danh sách conversations */}
        <Col md={4} className="conversation-sidebar p-0">
          <Card className="h-100 border-0 border-end">
            <Card.Header className="bg-primary text-white">
              <div className="d-flex align-items-center">
                <FaComments className="me-2" />
                <div>
                  <div className="fw-bold">Quản lý trò chuyện</div>
                  <small>Danh sách khách hàng</small>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center py-4">Đang tải...</div>
              ) : conversations.length > 0 ? (
                <ListGroup variant="flush">
                  {conversations.map((conversation) => {
                    const lastMessage =
                      conversation.messages && conversation.messages.length > 0
                        ? conversation.messages[
                            conversation.messages.length - 1
                          ]
                        : null;
                    const isSelected =
                      selectedConversation?.id === conversation.id;

                    return (
                      <ListGroup.Item
                        key={conversation.id}
                        action
                        active={isSelected}
                        onClick={() => setSelectedConversation(conversation)}
                        className="conversation-item"
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="fw-semibold">
                              {getConversationTitle(conversation)}
                            </div>
                            <div className="small text-muted text-truncate">
                              {lastMessage
                                ? lastMessage.message || lastMessage.content
                                : "Chưa có tin nhắn"}
                            </div>
                          </div>
                          {lastMessage && (
                            <small className="text-muted ms-2">
                              {formatTime(lastMessage.createdAt)}
                            </small>
                          )}
                        </div>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              ) : (
                <div className="text-center py-4 text-muted">
                  Chưa có cuộc trò chuyện
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Main chat area */}
        <Col md={8} className="chat-main-area p-0">
          {selectedConversation ? (
            <Card className="h-100 border-0">
              <Card.Header className="bg-light">
                <div className="fw-bold">
                  {getConversationTitle(selectedConversation)}
                </div>
              </Card.Header>
              <Card.Body className="p-0 d-flex flex-column">
                {/* Messages area */}
                <div className="messages-container flex-grow-1 p-3">
                  {messages.length > 0 ? (
                    messages.map((message, index) => {
                      const isMyMsg = isMyMessage(message);
                      return (
                        <div
                          key={message.id || index}
                          className={`message-wrapper mb-3 ${
                            isMyMsg ? "my-message" : "other-message"
                          }`}
                        >
                          <div
                            className={`message-bubble ${
                              isMyMsg ? "sent" : "received"
                            }`}
                          >
                            <div className="message-content">
                              {message.message}
                            </div>
                            <div className="message-time">
                              {formatTime(message.createdAt)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-muted small">
                      Chưa có tin nhắn trong cuộc trò chuyện này
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div className="message-input-area p-3 border-top">
                  <Form onSubmit={handleSendMessage}>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Nhập tin nhắn..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                      />
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={!newMessage.trim()}
                      >
                        <FaPaperPlane />
                      </Button>
                    </InputGroup>
                  </Form>
                </div>
              </Card.Body>
            </Card>
          ) : (
            <Card className="h-100 border-0">
              <Card.Body className="d-flex align-items-center justify-content-center">
                <div className="text-center text-muted">
                  <FaComments size={48} className="mb-3" />
                  <div>Chọn một cuộc trò chuyện để bắt đầu</div>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ConversationPage;
