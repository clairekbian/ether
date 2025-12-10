const express = require("express");
const router = express.Router();
const axios = require("axios");
const SpotifyAccessRequest = require("../models/SpotifyAccessRequest");

// Spotify OAuth configuration
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || "http://127.0.0.1:3000/callback";

// Generate Spotify authorization URL
router.get("/auth", (req, res) => {
  if (!SPOTIFY_CLIENT_ID || !REDIRECT_URI) {
    console.error("Missing Spotify configuration:", { 
      hasClientId: !!SPOTIFY_CLIENT_ID, 
      hasRedirectUri: !!REDIRECT_URI 
    });
    return res.status(500).json({ message: "Spotify configuration missing" });
  }
  
  console.log("Generating auth URL with redirect URI:", REDIRECT_URI);
  console.log("Client ID:", SPOTIFY_CLIENT_ID ? "Present" : "Missing");
  
  const scope = "user-top-read user-read-recently-played";
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scope)}`;
  
  console.log("Generated auth URL (first 100 chars):", authUrl.substring(0, 100));
  
  res.json({ authUrl });
});

// Handle the callback from Spotify
router.get("/callback", async (req, res) => {
  const { code, error: spotifyError } = req.query;
  
  // Check if Spotify returned an error
  if (spotifyError) {
    console.error("Spotify authorization error:", spotifyError);
    return res.status(400).json({ 
      message: "Spotify authorization failed",
      error: spotifyError 
    });
  }
  
  if (!code) {
    console.error("No authorization code received");
    return res.status(400).json({ message: "Authorization code not found" });
  }

  try {
    console.log("=== Spotify Callback Debug ===");
    console.log("Code received:", code ? `Yes (${code.substring(0, 20)}...)` : "No");
    console.log("Redirect URI from env:", REDIRECT_URI);
    console.log("Client ID exists:", !!SPOTIFY_CLIENT_ID);
    console.log("Client Secret exists:", !!SPOTIFY_CLIENT_SECRET);
    
    // Validate required configuration
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      console.error("Missing Spotify credentials");
      return res.status(500).json({ 
        message: "Server configuration error",
        error: "Missing Spotify credentials"
      });
    }
    
    // Build the request body
    const requestBody = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: REDIRECT_URI,
      client_id: SPOTIFY_CLIENT_ID,
      client_secret: SPOTIFY_CLIENT_SECRET
    });
    
    console.log("Request redirect_uri:", REDIRECT_URI);
    console.log("Request body (without secrets):", {
      grant_type: "authorization_code",
      code: code ? "present" : "missing",
      redirect_uri: REDIRECT_URI,
      client_id: SPOTIFY_CLIENT_ID ? "present" : "missing"
    });
    
    // Exchange code for access token
    const tokenResponse = await axios.post("https://accounts.spotify.com/api/token", 
      requestBody, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json"
        }
      }
    );

    const { access_token, refresh_token } = tokenResponse.data;
    
    if (!access_token || !refresh_token) {
      console.error("Missing tokens in Spotify response");
      return res.status(500).json({ 
        message: "Failed to get tokens from Spotify",
        error: "Invalid token response"
      });
    }
    
    // Get user profile
    try {
      const userResponse = await axios.get("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      const userProfile = userResponse.data;
      
      // Store tokens (in a real app, you'd save these to a database)
      // For now, we'll return them to the client
      res.json({
        success: true,
        access_token,
        refresh_token,
        user: userProfile
      });
    } catch (profileError) {
      // Check if user is not registered in Spotify app
      const errorData = profileError.response?.data;
      const errorMessage = errorData?.data || errorData?.error?.message || profileError.message;
      
      if (profileError.response?.status === 403 && 
          (errorMessage.includes("not be registered") || errorMessage.includes("Check settings"))) {
        
        // Try to decode token to get user info (JWT)
        let userEmail = null;
        let spotifyId = null;
        let displayName = null;
        
        try {
          // Spotify tokens are JWTs, we can decode them (without verification)
          const tokenParts = access_token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
            spotifyId = payload.sub;
            // Note: Email might not be in the token
          }
        } catch (e) {
          console.log("Could not decode token");
        }
        
        // Store access request
        try {
          await SpotifyAccessRequest.findOneAndUpdate(
            { email: userEmail || spotifyId || 'unknown' },
            {
              email: userEmail || spotifyId || 'unknown',
              spotifyId: spotifyId,
              displayName: displayName,
              requestedAt: new Date(),
              added: false
            },
            { upsert: true, new: true }
          );
          console.log("Stored Spotify access request");
        } catch (dbError) {
          console.error("Error storing access request:", dbError);
        }
        
        return res.status(403).json({
          message: "Spotify access required",
          error: "Your Spotify account needs to be added to the app. Your request has been recorded. Please contact the app administrator or wait for approval.",
          requiresApproval: true
        });
      }
      
      // Re-throw if it's a different error
      throw profileError;
    }

  } catch (error) {
    console.error("Spotify callback error:", error.response?.data || error.message);
    console.error("Full error:", error);
    console.error("Error status:", error.response?.status);
    console.error("Error details:", {
      hasClientId: !!SPOTIFY_CLIENT_ID,
      hasClientSecret: !!SPOTIFY_CLIENT_SECRET,
      redirectUri: REDIRECT_URI,
      codeReceived: !!code,
      spotifyError: error.response?.data
    });
    
    // Provide more specific error messages
    let errorMessage = "Failed to authenticate with Spotify";
    let errorDetails = error.message;
    let statusCode = 500;
    
    if (error.response) {
      statusCode = error.response.status;
      const spotifyError = error.response.data;
      
      if (spotifyError) {
        errorDetails = spotifyError.error_description || spotifyError.error || error.message;
        
        if (spotifyError.error === "invalid_grant") {
          errorMessage = "Authorization code expired or invalid. Please try connecting again.";
        } else if (spotifyError.error === "invalid_client") {
          errorMessage = "Spotify app configuration error. Please check server settings.";
        } else if (statusCode === 403) {
          errorMessage = "Access forbidden. Please check Spotify app settings and redirect URI.";
          errorDetails = spotifyError.error_description || "Redirect URI mismatch or invalid client credentials";
        }
      }
    }
    
    res.status(statusCode).json({ 
      message: errorMessage,
      error: errorDetails
    });
  }
});

// Refresh Spotify access token
router.post("/refresh", async (req, res) => {
  const { refresh_token } = req.body;
  console.log("Refresh request received");
  console.log("Refresh token provided:", !!refresh_token);
  
  if (!refresh_token) {
    console.log("No refresh token in request body");
    return res.status(400).json({ message: "Refresh token required" });
  }
  
  try {
    console.log("Calling Spotify API to refresh token...");
    const tokenResponse = await axios.post("https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token,
        client_id: SPOTIFY_CLIENT_ID,
        client_secret: SPOTIFY_CLIENT_SECRET
      }), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );
    
    console.log("Spotify refresh successful");
    console.log("New access token received:", !!tokenResponse.data.access_token);
    
    res.json({
      access_token: tokenResponse.data.access_token,
      expires_in: tokenResponse.data.expires_in
    });
  } catch (error) {
    console.error("Spotify refresh error details:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to refresh token" });
  }
});

// Get user's top tracks
router.get("/top-tracks", async (req, res) => {
  const { access_token } = req.headers;
  
  if (!access_token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const response = await axios.get("https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=short_term", {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching top tracks:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch top tracks" });
  }
});

// Get user's recently played tracks
router.get("/recent-tracks", async (req, res) => {
  const { access_token } = req.headers;
  
  if (!access_token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const response = await axios.get("https://api.spotify.com/v1/me/player/recently-played?limit=20", {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching recent tracks:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch recent tracks" });
  }
});

// Admin endpoint to get pending Spotify access requests
router.get("/admin/pending-requests", async (req, res) => {
  try {
    const pendingRequests = await SpotifyAccessRequest.find({ added: false })
      .sort({ requestedAt: -1 });
    
    res.json({
      success: true,
      count: pendingRequests.length,
      requests: pendingRequests
    });
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    res.status(500).json({ message: "Error fetching requests" });
  }
});

// Admin endpoint to mark a request as added
router.post("/admin/mark-added", async (req, res) => {
  try {
    const { email, spotifyId } = req.body;
    
    if (!email && !spotifyId) {
      return res.status(400).json({ message: "Email or Spotify ID required" });
    }
    
    const query = email ? { email } : { spotifyId };
    const updated = await SpotifyAccessRequest.findOneAndUpdate(
      query,
      { 
        added: true,
        addedAt: new Date()
      },
      { new: true }
    );
    
    if (!updated) {
      return res.status(404).json({ message: "Request not found" });
    }
    
    res.json({
      success: true,
      message: "Request marked as added",
      request: updated
    });
  } catch (error) {
    console.error("Error marking request as added:", error);
    res.status(500).json({ message: "Error updating request" });
  }
});

// Admin endpoint to get all requests (including added ones)
router.get("/admin/all-requests", async (req, res) => {
  try {
    const allRequests = await SpotifyAccessRequest.find()
      .sort({ requestedAt: -1 });
    
    res.json({
      success: true,
      count: allRequests.length,
      requests: allRequests
    });
  } catch (error) {
    console.error("Error fetching all requests:", error);
    res.status(500).json({ message: "Error fetching requests" });
  }
});

module.exports = router; 