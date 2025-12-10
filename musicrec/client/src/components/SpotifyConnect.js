import React, { useState, useEffect } from "react";
import api from "../api";

export default function SpotifyConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if user has connected Spotify
    const spotifyToken = localStorage.getItem("spotify_token");
    if (spotifyToken) {
      setIsConnected(true);
      fetchUserData(spotifyToken);
    }
  }, []);

  const connectSpotify = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await api.get("/spotify/auth");
      window.location.href = response.data.authUrl;
    } catch (err) {
      setError("Failed to connect to Spotify");
      console.error("Spotify auth error:", err);
      console.error("Error details:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to refresh token
  const refreshSpotifyToken = async () => {
    const refresh_token = localStorage.getItem("spotify_refresh_token");
    console.log("Attempting to refresh token...");
    console.log("Refresh token exists:", !!refresh_token);
    
    if (!refresh_token) {
      console.log("No refresh token found in localStorage");
      return null;
    }
    
    try {
      console.log("Calling /spotify/refresh endpoint...");
      const response = await api.post("/spotify/refresh", { refresh_token });
      console.log("Refresh response:", response.data);
      
      if (response.data.access_token) {
        localStorage.setItem("spotify_token", response.data.access_token);
        console.log("New access token saved to localStorage");
        return response.data.access_token;
      }
    } catch (err) {
      console.error("Spotify token refresh error details:", err.response?.data || err.message);
      setError("Failed to refresh Spotify token");
    }
    return null;
  };

  // Fetch user data with token refresh logic
  const fetchUserData = async (token, triedRefresh = false) => {
    try {
      const response = await api.get("/spotify/top-tracks", {
        headers: { access_token: token }
      });
      setTopTracks(response.data.items);
    } catch (err) {
      // If token expired and we haven't tried refresh yet
      if (err.response && err.response.status === 401 && !triedRefresh) {
        const newToken = await refreshSpotifyToken();
        if (newToken) {
          fetchUserData(newToken, true);
        }
      } else {
        setError("Error fetching top tracks");
        console.error("Error fetching top tracks:", err);
      }
    }
  };

  const disconnectSpotify = () => {
    localStorage.removeItem("spotify_token");
    localStorage.removeItem("spotify_refresh_token");
    setIsConnected(false);
    setUserProfile(null);
    setTopTracks([]);
  };

  // If not connected, show the connection section
  if (!isConnected) {
    return (
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
        <h2>Connect Your Spotify Account</h2>
        <p>Connect your Spotify account to see your most listened to songs!</p>
        <button
          onClick={connectSpotify}
          disabled={loading}
          style={{
            padding: "12px 24px",
            background: "#1db954",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px"
          }}
        >
          {loading ? "Connecting..." : "Connect Spotify Account"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    );
  }

  // If connected, show only the top tracks section
  return (
    <div style={{ position: "relative" }}>
      <h3>Your Top Tracks This Week</h3>
      
      {topTracks.length > 0 ? (
        <div>
          {topTracks.map((track, index) => (
            <div key={track.id} style={{
              display: "flex",
              alignItems: "center",
              padding: "10px",
              margin: "5px 0",
              border: "1px solid #ddd",
              borderRadius: "4px"
            }}>
              <span style={{ 
                fontWeight: "bold", 
                marginRight: "15px",
                minWidth: "30px"
              }}>
                #{index + 1}
              </span>
              <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <img
                  src={track.album.images[0]?.url || "https://via.placeholder.com/50x50?text=No+Image"}
                  alt={`${track.album.name} cover`}
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "4px",
                    marginRight: "15px",
                    objectFit: "cover"
                  }}
                />
                <div>
                  <strong>{track.name}</strong>
                  <br />
                  <small>{track.artists.map(artist => artist.name).join(", ")}</small>
                </div>
              </div>
              <a
                href={track.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "5px 10px",
                  borderRadius: "4px",
                  border: "1px solid #1db954",
                  background: "#1db954",
                  color: "white",
                  textDecoration: "none",
                  fontSize: "12px"
                }}
              >
                🎵 Open
              </a>
            </div>
          ))}
          
          {/* Disconnect button positioned at bottom right */}
          <div style={{ 
            position: "absolute", 
            bottom: "-40px", 
            right: "0",
            marginTop: "20px"
          }}>
            <button
              onClick={disconnectSpotify}
              style={{
                padding: "6px 12px",
                background: "transparent",
                color: "#666",
                border: "1px solid #ddd",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              Disconnect Spotify
            </button>
          </div>
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          <p>No top tracks found. Try listening to some music and check back later!</p>
          
          {/* Disconnect button positioned at bottom right */}
          <div style={{ 
            position: "absolute", 
            bottom: "-40px", 
            right: "0",
            marginTop: "20px"
          }}>
            <button
              onClick={disconnectSpotify}
              style={{
                padding: "6px 12px",
                background: "transparent",
                color: "#666",
                border: "1px solid #ddd",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              Disconnect Spotify
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 