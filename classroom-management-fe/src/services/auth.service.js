import http from "./http-config";

const API_URL = "https://classroom-management-be.vercel.app/";
// const API_URL = "http://localhost:3000/";

const register = async ({ name, email, password }) => {
  return await http.post(API_URL + "auth/register", {
    name, email, password
  });
};

const activeUser = async ({ email, code }) => {
  const URL = API_URL + "auth/activate/" + email + "/" + code;
  return await http.get(URL);
}

const resentCode = async ({ email }) => {
  return await http.post(API_URL + "auth/activate/resent-code", {
    email
  });
};

const login = async ({ email, password }) => {
  return await http.post(API_URL + "auth/login", {
    email, password
  });
};

const loginAdmin = async ({ name, password }) => {
  return await http.post(API_URL + "auth/loginAdmin", {
    name, password
  });
};

const forgotPwd = async ({ email }) => {
  return await http.patch(API_URL + "auth/forgot-password", {
    email
  });
};

const resetPwd = async ({ email , userToken, password }) => {
  return await http.patch(API_URL + "auth/reset-password", {
    email , userToken, password
  });
};

const updateStudentId = async ({ email , studentId }) => {
  return await http.patch(API_URL + "auth/student-id", {
    email , studentId
  });
};

const updateProfile = async ({ email, studentId, name }) => {
  return await http.patch(API_URL + "auth/profile", {
    email, studentId, name
  });
};

const googleLogin = async () => {
  try {
    window.open(API_URL + "auth/google", "_self");
  } catch (error) {
    console.error('Error during Google authentication:', error);
  }
}

const facebookLogin = async () => {
  try {
    window.open(API_URL + "auth/facebook", "_self");
  } catch (error) {
    console.error('Error during Facebook authentication:', error);
  }
}

const findUserByEmail = async ({ email }) => {
  const URL = API_URL + "auth/find-by-email/" + email;
  return await http.get(URL);
}

const getAllUsers = async () => {
  const URL = API_URL + "auth/getAllUsers";
  return await http.get(URL);
}

const banUser = async ({ email }) => {
  return await http.put(API_URL + "auth/banUser/" + email);
};

const activeUserAdmin = async ({ email }) => {
  return await http.put(API_URL + "auth/activeUser/" + email);
};

const AuthService = {
  register,
  activeUser,
  resentCode,
  login,
  forgotPwd,
  resetPwd,
  googleLogin,
  facebookLogin,
  updateStudentId,
  updateProfile,
  findUserByEmail,
  getAllUsers,
  banUser,
  activeUserAdmin,
  loginAdmin
}

export default AuthService;