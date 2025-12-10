import React, { useState, useEffect } from "react";
import axios from "axios";
import AuthForm from "./AuthForm";

export default function AccountPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [showAuth, setShowAuth] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [name, setName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [sentRecommendations, setSentRecommendations] = useState([]);
  const [receivedRecommendations, setReceivedRecommendations] = useState([]);
  const [showRecommendationHistory, setShowRecommendationHistory] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageScale, setImageScale] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });

  const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
    "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
    "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
    "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
    "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
    "Fiji", "Finland", "France",
    "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
    "Haiti", "Honduras", "Hungary",
    "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast",
    "Jamaica", "Japan", "Jordan",
    "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
    "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
    "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
    "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
    "Oman",
    "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
    "Qatar",
    "Romania", "Russia", "Rwanda",
    "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
    "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
    "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
    "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
    "Yemen",
    "Zambia", "Zimbabwe"
  ];

  useEffect(() => {
    // Clear any existing error messages when component mounts
    // This helps when returning from Spotify OAuth
    setError("");
    setMessage("");
    
    checkLoginStatus();
    
    // Check Spotify connection with a slight delay to ensure localStorage is updated
    // after redirect from OAuth callback
    const timer = setTimeout(() => {
      checkSpotifyConnection();
    }, 100);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchRecommendationHistory();
    }
  }, [isLoggedIn]);

  const checkLoginStatus = () => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      setShowAuth(false);
      fetchUserProfile();
    } else {
      setIsLoggedIn(false);
      setShowAuth(true);
    }
  };

  const checkSpotifyConnection = () => {
    const spotifyToken = localStorage.getItem("spotify_token");
    const connectSuccess = localStorage.getItem("spotify_connect_success");
    
    setIsSpotifyConnected(!!spotifyToken);
    
    // If Spotify is connected successfully, clear any previous error messages
    // and show success message if this was a fresh connection
    if (spotifyToken) {
      setError("");
      
      // Check if we just connected (flag set by Callback component)
      if (connectSuccess === "true") {
        setMessage("Successfully connected to Spotify!");
        localStorage.removeItem("spotify_connect_success"); // Clear the flag
        
        // Clear the success message after 5 seconds
        setTimeout(() => {
          setMessage("");
        }, 5000);
      }
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get("/profile", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setUserProfile(response.data);
      setName(response.data.name || "");
      setProfilePicture(response.data.profilePicture || "");
      setCountry(response.data.country || "");
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("spotify_token");
    localStorage.removeItem("spotify_refresh_token");
    setIsLoggedIn(false);
    setShowAuth(true);
    setUserProfile(null);
    setName("");
    setProfilePicture("");
    setCountry("");
    setIsSpotifyConnected(false);
    setShowEditForm(false);
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      console.log("Updating profile with:", { name, profilePicture: profilePicture ? "base64 data present" : "no image", country });
      
      await axios.put("/profile", 
        { name, profilePicture, country },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setMessage("Profile updated successfully!");
      fetchUserProfile();
      setShowEditForm(false);
    } catch (err) {
      console.error("Profile update error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size too large. Please select an image smaller than 5MB.");
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError("Please select a valid image file.");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        setShowImageEditor(true);
        setError(""); // Clear any previous errors
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
    setShowAuth(false);
    fetchUserProfile();
  };

  const handleSpotifyConnect = async () => {
    try {
      // Clear any existing error and success messages before starting OAuth
      setError("");
      setMessage("");
      
      const response = await axios.get("/spotify/auth");
      // If we successfully get the auth URL, redirect immediately
      // No error will be shown because we're leaving the page
      window.location.href = response.data.authUrl;
    } catch (err) {
      // Only set error if the initial request to get auth URL fails
      console.error("Failed to initiate Spotify connection:", err);
      setError("Failed to initiate Spotify connection. Please try again.");
    }
  };

  const handleSpotifyDisconnect = () => {
    localStorage.removeItem("spotify_token");
    localStorage.removeItem("spotify_refresh_token");
    setIsSpotifyConnected(false);
    setMessage("Spotify account disconnected successfully!");
  };

  const filteredCountries = countries.filter(c => 
    c.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleCountrySelect = (selectedCountry) => {
    setCountry(selectedCountry);
    setCountrySearch("");
    setShowCountryDropdown(false);
  };

  const fetchRecommendationHistory = async () => {
    try {
      const [sentResponse, receivedResponse] = await Promise.all([
        axios.get("/recommendation/my", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }),
        axios.get("/recommendation/received", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
      ]);
      
      console.log("Received recommendations from API:", receivedResponse.data);
      console.log("Number of received recommendations:", receivedResponse.data.length);
      
      setSentRecommendations(sentResponse.data);
      setReceivedRecommendations(receivedResponse.data);
    } catch (err) {
      console.error("Error fetching recommendation history:", err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleImageSave = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 200;
      canvas.height = 200;
      
      // Clear canvas
      ctx.clearRect(0, 0, 200, 200);
      
      // Create circular clipping path
      ctx.beginPath();
      ctx.arc(100, 100, 100, 0, 2 * Math.PI);
      ctx.clip();
      
      // Apply transformations in the correct order (matching the preview)
      ctx.save();
      ctx.translate(100, 100); // Move to center of canvas
      ctx.scale(imageScale, imageScale); // Scale (this affects the coordinate system)
      ctx.rotate((imageRotation * Math.PI) / 180); // Rotate
      ctx.translate(imagePosition.x / imageScale, imagePosition.y / imageScale); // Apply position offset (adjusted for scale)
      
      // Draw the image centered
      ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
      ctx.restore();
      
      // Convert to base64
      const finalImage = canvas.toDataURL('image/jpeg', 0.8);
      setProfilePicture(finalImage);
      setShowImageEditor(false);
      setSelectedImage(null);
      setImageScale(1);
      setImageRotation(0);
      setImagePosition({ x: 0, y: 0 });
    };
    
    img.src = selectedImage;
  };

  const handleImageCancel = () => {
    setShowImageEditor(false);
    setSelectedImage(null);
    setImageScale(1);
    setImageRotation(0);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    const rect = e.target.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;
    
    const handleMouseMove = (e) => {
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      
      setImagePosition({
        x: imagePosition.x + (currentX - startX) / imageScale,
        y: imagePosition.y + (currentY - startY) / imageScale
      });
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (showAuth) {
    return (
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
        <h1>Account</h1>
        <AuthForm onSuccess={handleAuthSuccess} />
      </div>
    );
  }

  if (showEditForm) {
    return (
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h1>Edit Account</h1>
          <button
            onClick={() => setShowEditForm(false)}
            style={{
              padding: "8px 16px",
              background: "#666",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Cancel
          </button>
        </div>

        {message && <p style={{ color: "green", padding: "10px", background: "#e8f5e8", borderRadius: "4px" }}>{message}</p>}
        {error && <p style={{ color: "red", padding: "10px", background: "#ffe8e8", borderRadius: "4px" }}>{error}</p>}

        <div>
          <h2>Profile</h2>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <div style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: profilePicture ? `url(${profilePicture})` : "#f0f0f0",
              backgroundSize: "cover",
              backgroundPosition: "center",
              margin: "0 auto 15px",
              border: "3px solid #1db954",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "48px",
              color: "#666"
            }}>
              {!profilePicture && (name.charAt(0) || userProfile?.username?.charAt(0) || "?")}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ marginBottom: "15px" }}
            />
            {profilePicture && (
              <button
                onClick={() => setProfilePicture("")}
                style={{
                  padding: "8px 16px",
                  background: "#ff4444",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                  marginBottom: "15px"
                }}
              >
                Remove Profile Picture
              </button>
            )}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Username:
            </label>
            <input
              type="text"
              value={userProfile?.username || ""}
              disabled
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                background: "#f9f9f9"
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Display Name:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your display name"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px"
              }}
            />
          </div>

          <div style={{ marginBottom: "15px", position: "relative" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Country:
            </label>
            <input
              type="text"
              value={countrySearch || country}
              onChange={(e) => {
                setCountrySearch(e.target.value);
                if (!showCountryDropdown) setShowCountryDropdown(true);
              }}
              onFocus={() => setShowCountryDropdown(true)}
              placeholder="Search for your country"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px"
              }}
            />
            {showCountryDropdown && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                maxHeight: "200px",
                overflowY: "auto",
                backgroundColor: "white",
                border: "1px solid #ddd",
                borderRadius: "4px",
                zIndex: 1000,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}>
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((c, index) => (
                    <div
                      key={index}
                      onClick={() => handleCountrySelect(c)}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        borderBottom: "1px solid #eee",
                        fontSize: "14px"
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = "#f5f5f5"}
                      onMouseLeave={(e) => e.target.style.backgroundColor = "white"}
                    >
                      {c}
                    </div>
                  ))
                ) : (
                  <div style={{ padding: "8px 12px", color: "#666", fontSize: "14px" }}>
                    No countries found
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleProfileUpdate}
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              background: "#1db954",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              marginBottom: "30px"
            }}
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </div>

        {/* Image Editor Modal */}
        {showImageEditor && selectedImage && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ margin: 0 }}>Edit Profile Picture</h2>
                <button
                  onClick={handleImageCancel}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    color: "#666"
                  }}
                >
                  ×
                </button>
              </div>

              {/* Image Editor Canvas */}
              <div style={{
                width: "200px",
                height: "200px",
                border: "2px solid #ddd",
                borderRadius: "50%",
                margin: "0 auto 20px",
                overflow: "hidden",
                position: "relative",
                background: "#f0f0f0"
              }}>
                <img
                  src={selectedImage}
                  alt="Profile preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: `scale(${imageScale}) rotate(${imageRotation}deg) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                    cursor: "move"
                  }}
                  onMouseDown={handleMouseDown}
                  draggable={false}
                />
              </div>

              {/* Controls */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                    Zoom: {Math.round(imageScale * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={imageScale}
                    onChange={(e) => setImageScale(parseFloat(e.target.value))}
                    style={{ width: "100%" }}
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                    Rotate: {imageRotation}°
                  </label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="15"
                    value={imageRotation}
                    onChange={(e) => setImageRotation(parseInt(e.target.value))}
                    style={{ width: "100%" }}
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                    Instructions:
                  </label>
                  <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
                    • Drag the image to reposition it<br/>
                    • Use the zoom slider to resize<br/>
                    • Use the rotate slider to rotate<br/>
                    • The circular frame shows your final profile picture
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button
                  onClick={handleImageCancel}
                  style={{
                    padding: "10px 20px",
                    background: "#666",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "16px"
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleImageSave}
                  style={{
                    padding: "10px 20px",
                    background: "#1db954",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "16px"
                  }}
                >
                  Save Profile Picture
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ marginBottom: "30px" }}>My Account</h1>

      {message && <p style={{ color: "green", padding: "10px", background: "#e8f5e8", borderRadius: "4px" }}>{message}</p>}
      {error && <p style={{ color: "red", padding: "10px", background: "#ffe8e8", borderRadius: "4px" }}>{error}</p>}

      <div>
        {/* Profile Display */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "30px" }}>
          <div style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: profilePicture ? `url(${profilePicture})` : "#f0f0f0",
            backgroundSize: "cover",
            backgroundPosition: "center",
            marginRight: "20px",
            border: "3px solid #1db954",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "48px",
            color: "#666",
            flexShrink: 0
          }}>
            {!profilePicture && (name.charAt(0) || userProfile?.username?.charAt(0) || "?")}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ marginBottom: "5px", marginTop: 0 }}>{userProfile?.username || "User"}</h2>
            {name && <p style={{ color: "#666", marginBottom: "15px", marginTop: 0 }}>{name}</p>}
            <button
              onClick={() => setShowEditForm(true)}
              style={{
                padding: "8px 16px",
                background: "#1db954",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Edit Account
            </button>
          </div>
        </div>

        {/* Recommendation History */}
        <div style={{ marginBottom: "30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h3 style={{ margin: 0 }}>Recommendation History</h3>
            <button
              onClick={() => setShowRecommendationHistory(!showRecommendationHistory)}
              style={{
                padding: "6px 12px",
                background: "#1db954",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              {showRecommendationHistory ? "Hide History" : "View History"}
            </button>
          </div>
          
          {showRecommendationHistory && (
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              {/* Sent Recommendations */}
              <div style={{ flex: "1", minWidth: "250px" }}>
                <h4 style={{ marginBottom: "10px", color: "#1db954" }}>Sent ({sentRecommendations.length})</h4>
                {sentRecommendations.length === 0 ? (
                  <p style={{ color: "#666", fontSize: "14px" }}>No recommendations sent yet.</p>
                ) : (
                  <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {sentRecommendations.map((rec, index) => (
                      <div key={index} style={{ 
                        padding: "10px", 
                        border: "1px solid #ddd", 
                        borderRadius: "6px", 
                        marginBottom: "8px",
                        background: "#f9f9f9"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                          <img 
                            src={rec.track.album.images[0]?.url || "https://via.placeholder.com/30x30?text=No+Image"} 
                            alt="album cover" 
                            style={{ width: 30, height: 30, borderRadius: 3, marginRight: 8, objectFit: "cover" }} 
                          />
                          <div style={{ flex: 1 }}>
                            <strong style={{ fontSize: "14px" }}>{rec.track.name}</strong>
                            <br />
                            <small style={{ color: "#666" }}>{rec.track.artists.map(a => a.name).join(", ")}</small>
                          </div>
                        </div>
                        <div style={{ fontSize: "12px", color: "#888" }}>
                          Sent: {formatDate(rec.createdAt)}
                          {rec.consumed && (
                            <span style={{ color: "#1db954", marginLeft: "10px" }}>
                              ✓ Received by someone
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Received Recommendations */}
              <div style={{ flex: "1", minWidth: "250px" }}>
                <h4 style={{ marginBottom: "10px", color: "#1db954" }}>Received ({receivedRecommendations.length})</h4>
                {console.log("Rendering received recommendations:", receivedRecommendations)}
                {receivedRecommendations.length === 0 ? (
                  <p style={{ color: "#666", fontSize: "14px" }}>No recommendations received yet.</p>
                ) : (
                  <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {receivedRecommendations.map((rec, index) => (
                      <div key={index} style={{ 
                        padding: "10px", 
                        border: "1px solid #ddd", 
                        borderRadius: "6px", 
                        marginBottom: "8px",
                        background: "#f9f9f9"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                          <img 
                            src={rec.track.album.images[0]?.url || "https://via.placeholder.com/30x30?text=No+Image"} 
                            alt="album cover" 
                            style={{ width: 30, height: 30, borderRadius: 3, marginRight: 8, objectFit: "cover" }} 
                          />
                          <div style={{ flex: 1 }}>
                            <strong style={{ fontSize: "14px" }}>{rec.track.name}</strong>
                            <br />
                            <small style={{ color: "#666" }}>{rec.track.artists.map(a => a.name).join(", ")}</small>
                          </div>
                        </div>
                        <div style={{ fontSize: "12px", color: "#888" }}>
                          Received: {formatDate(rec.consumedAt)}
                          <br />
                          From: {rec.isSystemRecommendation ? "🎵 Ether" : (rec.userId?.username || rec.userId?.name || "Anonymous")}
                          {!rec.isSystemRecommendation && rec.userId?.country && (
                            <span style={{ color: "#666" }}> • {rec.userId.country}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{ marginBottom: "30px" }}>
          <p style={{ marginBottom: "15px", color: "#666", fontSize: "12px" }}>
            {isSpotifyConnected 
              ? "Your Spotify account is connected. You can access your top tracks and make recommendations." 
              : "Connect your Spotify account to access your top tracks and make song recommendations."
            }
          </p>
          <div style={{ textAlign: "center" }}>
            <button
              onClick={isSpotifyConnected ? handleSpotifyDisconnect : handleSpotifyConnect}
              style={{
                width: "30%",
                padding: "6px",
                background: isSpotifyConnected ? "#ff4444" : "#1db954",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "15px"
              }}
            >
              {isSpotifyConnected ? "Disconnect Spotify" : "Connect Spotify"}
            </button>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #ddd", paddingTop: "20px", marginTop: "20px" }}>
          <div style={{ textAlign: "center" }}>
            <button
              onClick={handleLogout}
              style={{
                width: "30%",
                padding: "6px",
                background: "#ff4444",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "15px"
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 