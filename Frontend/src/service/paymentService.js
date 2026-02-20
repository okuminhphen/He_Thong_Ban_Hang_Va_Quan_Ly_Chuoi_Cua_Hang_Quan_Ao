import axios from "../middleware/axiosConfig";

const creatPayment = (paymentData) => {
  return axios.post("/create-payment-url", paymentData);
};
const getPaymentReturn = (queryString) => {
  return axios.get(`/payment-return?${queryString}`);
};
const getPaymentMethods = () => {
  return axios.get("/payment-methods");
};
export { creatPayment, getPaymentReturn, getPaymentMethods };
