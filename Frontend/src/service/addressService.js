import axios from "../middleware/axiosConfig";

export const getProvinces = () => {
  return axios.get("/address/provinces");
};

export const getDistricts = (provinceId) => {
  return axios.get("/address/districts", {
    params: { provinceId },
  });
};

export const getWards = (districtId) => {
  return axios.get("/address/wards", {
    params: { districtId },
  });
};
