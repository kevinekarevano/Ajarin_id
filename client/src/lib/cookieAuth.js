// Cookie-based authentication utilities
export const cookieUtils = {
  // Set cookie with options
  setCookie: (name, value, options = {}) => {
    const { days = 7, secure = true, sameSite = "strict", path = "/" } = options;

    let cookieString = `${name}=${value}`;

    if (days) {
      const expires = new Date();
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
      cookieString += `; expires=${expires.toUTCString()}`;
    }

    cookieString += `; path=${path}`;

    if (secure) {
      cookieString += "; secure";
    }

    cookieString += `; samesite=${sameSite}`;

    document.cookie = cookieString;
  },

  // Get cookie value
  getCookie: (name) => {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(";");

    for (let cookie of cookies) {
      let c = cookie.trim();
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length);
      }
    }
    return null;
  },

  // Delete cookie
  deleteCookie: (name, path = "/") => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=${path}`;
  },

  // Check if cookies are enabled
  areCookiesEnabled: () => {
    try {
      document.cookie = "testcookie=1";
      const enabled = document.cookie.indexOf("testcookie") !== -1;
      document.cookie = "testcookie=1; expires=Thu, 01-Jan-1970 00:00:01 GMT";
      return enabled;
    } catch (e) {
      return false;
    }
  },
};

// Token management with cookies
export const tokenManager = {
  // Store token in cookie
  setToken: (token) => {
    cookieUtils.setCookie("token", token, {
      days: 7,
      secure: false, // Set to false for development (localhost)
      sameSite: "strict",
    });
  },

  // Get token from cookie
  getToken: () => {
    return cookieUtils.getCookie("token");
  },

  // Remove token
  removeToken: () => {
    cookieUtils.deleteCookie("token");
  },

  // Store user data in localStorage (less sensitive)
  setUserData: (userData) => {
    try {
      localStorage.setItem("user_data", JSON.stringify(userData));
    } catch (error) {
      console.error("Failed to store user data:", error);
    }
  },

  // Get user data from localStorage
  getUserData: () => {
    try {
      const data = localStorage.getItem("user_data");
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Failed to get user data:", error);
      return null;
    }
  },

  // Remove user data
  removeUserData: () => {
    localStorage.removeItem("user_data");
  },

  // Clear all auth data
  clearAll: () => {
    tokenManager.removeToken();
    tokenManager.removeUserData();
  },
};
