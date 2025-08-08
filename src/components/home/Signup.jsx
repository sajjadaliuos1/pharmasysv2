import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../../services/authService"; // You'll need to create this service
import { Toaster } from "../common/Toaster";
import useAuth from "../../hooks/useAuth";

const SignUp = () => {
  const { login: setAuth } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    contact: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.contact.trim()) newErrors.contact = "Contact is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
        console.log("Form Data:", formData);
      const res = await register(formData);
      
      if (res.status === "Success") {
        Toaster.success(res.message || "Registration Successfully");
        navigate("/login"); 
      } else {
        Toaster.error(res.message || "Registration failed");
      }
    } catch (err) {
      Toaster.error("An error occurred during registration. Please try again.");
      console.error("Signup error:", err);
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
            <h2 className="fw-bold">Join Us</h2>
            <p className="lead text-muted">Create your account to get started</p>
          </div>
        </div>
  
        {/* Signup Form Section (Right) */}
        <div className="col-lg-7 d-flex align-items-center justify-content-center p-4">
          <div className="w-100" style={{ maxWidth: "400px" }}>
            <div className="text-center mb-4">
              <h2 className="fw-bold text-primary">Sign Up</h2>
              <p className="text-muted">Fill in your details to register</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 shadow-sm rounded bg-white">
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`form-control py-2 ${errors.name ? 'is-invalid' : ''}`}
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>
              
              <div className="mb-3">
                <label htmlFor="username" className="form-label">Email/Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className={`form-control py-2 ${errors.username ? 'is-invalid' : ''}`}
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email or username"
                />
                {errors.username && <div className="invalid-feedback">{errors.username}</div>}
              </div>
              
              <div className="mb-3">
                <label htmlFor="contact" className="form-label">Contact Number</label>
                <input
                  type="text"
                  id="contact"
                  name="contact"
                  className={`form-control py-2 ${errors.contact ? 'is-invalid' : ''}`}
                  value={formData.contact}
                  onChange={handleChange}
                  required
                  placeholder="Enter your contact number"
                />
                {errors.contact && <div className="invalid-feedback">{errors.contact}</div>}
              </div>
              
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className={`form-control py-2 ${errors.password ? 'is-invalid' : ''}`}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>
              
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className={`form-control py-2 ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
              </div>       
              
              <button 
                type="submit" 
                className="btn btn-primary w-100 py-2 fw-bold"
                disabled={loading}
              >
                {loading ? <i className="fa fa-spinner fa-spin me-2" /> : null}
                {loading ? "Creating account..." : "Sign Up"}
              </button>
            </form>
            
            <div className="text-center mt-4">
              <p className="text-muted">
                Don't have an account?{' '}
                <Link to="/login" className="text-decoration-none">Login</Link>
              </p>
            </div>

          </div>
        </div>      
      </div>
    </div>
  );  
};

export default SignUp;