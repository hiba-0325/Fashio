import axios from "axios";
import Cookies from "js-cookie";
import axiosErrorManager from "./axiosErrorManage";
import { toast } from "react-toastify";
// import axiosErrorManager from "./axiosErrorManage";
// import { toast } from "react-toastify";

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = Cookies.get("token");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const count = 1 

    if (
      error.response &&
      error.response.status === 401 &&
      originalRequest._retry < count
    ) {
      //will mark request to avoid infinite loops
      originalRequest._retry = true;
      originalRequest._retry = (originalRequest._retry || 0 )+1
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refreshToken`,
          {},
          {
            withCredentials: true,
          }
        );
        const newAccessToken = response.data.token;

        Cookies.set("token", newAccessToken, {
          secure: true,
          sameSite: "None",
        });
        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        console.error("Error refreshing token:", err);
        toast.error("Session expired. Please log in again.");
        Cookies.remove("token");
        Cookies.remove("refreshToken");
        Cookies.remove("user");

        return Promise.reject(err);
      }
    }

    console.error("Request failed:", axiosErrorManager(error));
    return Promise.reject(error);
  }
);

export default axiosInstance;
