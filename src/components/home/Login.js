import React, { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { login } from "../../services/authService";
import { Toaster } from "../common/Toaster";
import { jwtDecode } from "jwt-decode";
import useAuth from "../../hooks/useAuth";


const Login = () => {
  const { login: setAuth } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login({ username, password });

      if (data.status === "Success") {
        localStorage.setItem("authToken", data.token);
        Toaster.success("Successfully logged in");
        setAuth(data);

        const token = data.token;
        const decodeToken = jwtDecode(token);
        console.log("Decoded Token:", decodeToken);

        const roleId = parseInt(decodeToken.role, 10);
        console.log("Role ID:", roleId);


        switch (roleId) {
          case 1:
            navigate("/");
            break;
          case 2:
            navigate("/");
            break;
          case 3:
            navigate("/");
            break;
          default:
            navigate("/unauthorized");
            break;
        }
      } else {
        localStorage.removeItem("authToken");
        Toaster.error(data.message);
      }
    } catch (err) {
      localStorage.removeItem("authToken");
      Toaster.error("An error occurred during login. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container-fluid d-flex flex-column min-vh-100">
      <div className="row flex-grow-1">
        {/* Image Section (Left) */}
        <div className="col-lg-5 d-none d-lg-flex align-items-center justify-content-center p-5 bg-light">
          <div className="text-center">
            <img
              src="/logo1 .png"
              alt="Welcome Illustration"
              className="img-fluid mb-4"
              style={{ maxHeight: "420px", width: "auto" }}
            />
            <h2 className="fw-bold">Welcome Back</h2>
            <p className="lead text-muted">Secure access to your dashboard</p>
          </div>
        </div>

        {/* Login Form Section (Right) */}
        <div className="col-lg-7 d-flex align-items-center justify-content-center p-4">
          <div className="w-100" style={{ maxWidth: "400px" }}>
            <div className="text-center mb-4">
              <h2 className="fw-bold text-primary">Sign In</h2>
              <p className="text-muted">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="p-4 shadow-sm rounded bg-white">
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="text"
                  id="email"
                  className="form-control py-2"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  id="password"
                  className="form-control py-2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100 py-2 fw-bold"
                disabled={loading}
              >
                {loading ? <i className="fa fa-spinner fa-spin me-2" /> : null}
                {loading ? "Signing in..." : "Sign In"}
              </button>

            </form>

            <div className="text-center mt-4">
              <p className="text-muted">
                Don't have an account?{' '}
                <Link to="/signup" className="text-decoration-none">Sign up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;