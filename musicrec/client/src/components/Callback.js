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
          try {
            // Store tokens - handle localStorage errors (e.g., private browsing on iOS)
            localStorage.setItem("spotify_token", response.data.access_token);
            localStorage.setItem("spotify_refresh_token", response.data.refresh_token);
            localStorage.setItem("spotify_connect_success", "true");
          } catch (storageError) {
            console.error("localStorage error (might be private browsing):", storageError);
            // On iOS Safari private browsing, localStorage might fail
            // Store in sessionStorage as fallback
            try {
              sessionStorage.setItem("spotify_token", response.data.access_token);
              sessionStorage.setItem("spotify_refresh_token", response.data.refresh_token);
              sessionStorage.setItem("spotify_connect_success", "true");
            } catch (sessionError) {
              console.error("sessionStorage also failed:", sessionError);
              setMessage("Storage error. Please disable private browsing and try again.");
              setTimeout(() => navigate("/account"), 3000);
              return;
            }
          }
          
          setMessage("Successfully connected to Spotify! Redirecting...");
          // Use window.location for iOS Safari compatibility instead of navigate
          setTimeout(() => {
            window.location.href = "/account";
          }, 500);
        } else {
          console.error("Missing tokens in response:", response.data);
          setMessage("Failed to connect to Spotify - missing tokens.");
          setTimeout(() => {
            window.location.href = "/account";
          }, 3000);
        }
      } catch (error) {
        console.error("Callback error:", error);
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);
        console.error("Full error:", error);
        
        // Get more detailed error message
        let errorMsg = "Unknown error";
        if (error.response?.data) {
          errorMsg = error.response.data.message || error.response.data.error || error.message;
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        setMessage(`Failed to connect to Spotify: ${errorMsg}. Please try again.`);
        setTimeout(() => {
          window.location.href = "/account";
        }, 3000);
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