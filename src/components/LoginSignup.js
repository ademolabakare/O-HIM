// LoginSignup.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginSignup.css';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'; // Importing icons

const LoginSignup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'username' && password === '1234') {
      navigate('/dashboard');
    } else {
      alert('Incorrect login details');
    }
  };

  return (
    <div className="login-signup-container">
      {/* Left side with branding */}
      <div className="left-panel">
        <h1>O-HIM</h1>
        <p>Osun Health Information Management</p>
        <p>Your health, our priority.</p>
        <p>Join us and take control of your health journey with O-HIM.</p>
      </div>

      {/* Right side with form */}
      <div className="right-panel">
        <h2>Login</h2>
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-container">
            <FaUser className="icon" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-container">
            <FaLock className="icon" />
            <input
              type={passwordVisible ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="eye-icon" onClick={() => setPasswordVisible(!passwordVisible)}>
              {passwordVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <button type="submit" className="login-btn">Login</button>
          <p className="forgot-password">Forgot Password?</p>
          <p className="signup-link">Don't have an account? Sign up here.</p>
        </form>

        <div className="powered-by">
          <p>Powered by <span className="monarch-logo">MONARCH</span></p>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
