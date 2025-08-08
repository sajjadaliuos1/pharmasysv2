import API from "../api/API";

export const login = async (credentials) => {
  const response = await API.post("/Account/login", credentials);
  return response.data;
};
export const register = async (userData) => {
  const response = await API.post("/Account/signup", userData);
  return response.data;
};

export const getUserProfile = async () => {
  const response = await API.get("/Account/login");
  return response.data;
};