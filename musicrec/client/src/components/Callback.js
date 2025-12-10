import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Callback() {
  const [message, setMessage] = useState("Connecting to Spotify...");
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      
      if (!code) {
        setMessage("Authorization failed. No code received.");
        setTimeout(() => navigate("/account"), 3000);
        return;
      }

      try {
        console.log("Making callback request with code:", code);
        const response = await api.get(`/spotify/callback?code=${code}`);
        console.log("Callback response:", response.data);
        
        // Check if we have the required tokens
        if (response.data.access_token && response.data.refresh_token) {
          // Store tokens
          localStorage.setItem("spotify_token", response.data.access_token);
          localStorage.setItem("spotify_refresh_token", response.data.refresh_token);
          
          // Set a flag to show success message on the account page
          localStorage.setItem("spotify_connect_success", "true");
          
          setMessage("Successfully connected to Spotify! Redirecting to account page...");
          // Redirect immediately on success
          setTimeout(() => navigate("/account"), 500);
        } else {
          console.error("Missing tokens in response:", response.data);
          setMessage("Failed to connect to Spotify - missing tokens.");
          setTimeout(() => navigate("/account"), 3000);
        }
      } catch (error) {
        console.error("Callback error:", error);
        console.error("Error response:", error.response?.data);
        setMessage("Failed to connect to Spotify. Please try again.");
        setTimeout(() => navigate("/account"), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      height: "100vh",
      flexDirection: "column"
    }}>
      <h2>Connecting to Spotify</h2>
      <p>{message}</p>
    </div>
  );
} 