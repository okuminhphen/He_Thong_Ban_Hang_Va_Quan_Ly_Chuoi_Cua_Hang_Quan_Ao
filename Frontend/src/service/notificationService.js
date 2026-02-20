import axios from "../middleware/axiosConfig";

const getMyNotifications = () => {
  return axios.get("/notifications/my");
};

const countUnreadNotifications = () => {
  return axios.get("/notifications/count");
};

const markAsRead = (notificationId) => {
  return axios.patch(`/notifications/${notificationId}/read`);
};

const markAllAsRead = () => {
  return axios.patch("/notifications/mark-all-as-read");
};

export default {
  getMyNotifications,
  countUnreadNotifications,
  markAsRead,
  markAllAsRead,
};
