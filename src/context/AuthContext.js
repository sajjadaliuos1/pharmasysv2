
import React, { createContext, useState, useEffect, useContext } from "react";
import {jwtDecode} from "jwt-decode";
import { Navigate, Outlet } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
 

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authToken");    
    // <Navigate to="/login" replace/>
    Outlet("/login"); 
  };

  const setLogoutTimer = (expirationTime) => {
    const currentTime = Date.now();
    const timeToExpire = expirationTime * 1000 - currentTime;

    if (timeToExpire > 0) {
      setTimeout(() => {
        console.log("Token expired, logging out");
        logout();
      }, timeToExpire);
    }
  };

  const login = (userData) => {
    try {
      const decoded = jwtDecode(userData.token);
      setUser({ token: userData.token, role: decoded.role, userId: decoded.userId });
      localStorage.setItem("authToken", userData.token);

      if (decoded.exp) setLogoutTimer(decoded.exp);
    } catch (error) {
      console.error("Login failed:", error);
      logout();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({ token, role: decoded.role, userId: decoded.userId });

        if (decoded.exp) setLogoutTimer(decoded.exp);
      } catch (error) {
        console.error("Error decoding token:", error);
        logout();
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, userId: user?.userId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);

export default AuthContext;











// import React, { createContext, useState, useEffect, useContext } from "react";
// import { jwtDecode } from "jwt-decode";

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const token = localStorage.getItem("authToken");
//     console.log("AuthProvider - Token from localStorage:", token); // Debug
  
//     if (token) {
//       try {
//         const decoded = jwtDecode(token);
//         console.log("AuthProvider - Decoded Token:", decoded); // Debug
//         setUser({ token, role: decoded.role });
//       } catch (error) {
//         console.error("AuthProvider - Error decoding token:", error);
//         logout();
//       }
//     }
//   }, []);
  

//   const login = (userData) => {
//     try {
//       const decoded = jwtDecode(userData.token);
//       console.log("Decoded Token in Login:", decoded); // Debug
//       setUser({ token: userData.token, role: decoded.role });
//       localStorage.setItem("authToken", userData.token); // Save to local storage
//       console.log("Login successful, user set:", { token: userData.token, role: decoded.role });
//     } catch (error) {
//       console.error("Login failed:", error);
//       logout(); // Clear invalid token
//     }
//   };
  
  

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem("authToken");
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuthContext = () => useContext(AuthContext);

// export default AuthContext;