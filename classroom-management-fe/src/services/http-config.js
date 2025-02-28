import axios from "axios";

export const getToken = () => {
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  if (user)
    return user.token;
}

export const getAuthorizationHeader = () => `Bearer ${getToken()}`;

// httpInstance
const httpConfig = axios.create({
  timeout: 10000,
  withCredentials: true,
  headers: { Authorization: getAuthorizationHeader() },
});

// http response interceptor
httpConfig.interceptors.response.use(
  (response) => {
    // we can determine to display from server, if messaged, display
    return response;
  },
  (error) => {
    // we handle errors here
    throw error;
  }
);
export default httpConfig;