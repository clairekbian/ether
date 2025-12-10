import React, { useState } from "react";
import axios from "axios";
import api from "../api";

export default function AuthForm({ onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      if (isLogin) {
        // Login
        const res = await api.post("/auth/login", { username, password });
        localStorage.setItem("token", res.data.token);
        setMessage("Login successful!");
        if (onSuccess) {
          onSuccess();
        } else {
          alert("Login successful!");
        }
      } else {
        // Signup
        await api.post("/auth/signup", { username, email, password });
        setMessage("Signup successful! You can now log in.");
      }
    } catch (err) {
      console.error("Auth error:", err);
      const errorMessage = err.response?.data?.message || err.message || (isLogin ? "Login failed" : "Signup failed");
      setError(errorMessage);
      if (err.response?.status === 0 || err.code === "ERR_NETWORK") {
        setError("Cannot connect to server. Please check your connection and try again.");
      }
    }
  };

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setMessage("");
    setError("");
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <div style={{ display: "flex", marginBottom: "20px" }}>
        <button
          onClick={() => {
            setIsLogin(true);
            resetForm();
          }}
          style={{
            flex: 1,
            padding: "10px",
            border: "none",
            background: isLogin ? "#1db954" : "#f0f0f0",
            color: isLogin ? "white" : "black",
            cursor: "pointer"
          }}
        >
          Login
        </button>
        <button
          onClick={() => {
            setIsLogin(false);
            resetForm();
          }}
          style={{
            flex: 1,
            padding: "10px",
            border: "none",
            background: !isLogin ? "#1db954" : "#f0f0f0",
            color: !isLogin ? "white" : "black",
            cursor: "pointer"
          }}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>
        
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", margin: "10px 0", border: "1px solid #ddd", borderRadius: "4px" }}
        />
        
        {!isLogin && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", margin: "10px 0", border: "1px solid #ddd", borderRadius: "4px" }}
          />
        )}
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", margin: "10px 0", border: "1px solid #ddd", borderRadius: "4px" }}
        />
        
        <button 
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            margin: "10px 0",
            background: "#1db954",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          {isLogin ? "Login" : "Sign Up"}
        </button>
        
        {message && <p style={{ color: "green" }}>{message}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
} 