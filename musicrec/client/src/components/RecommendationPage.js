import React, { useState, useEffect } from "react";
import axios from "axios";

export default function RecommendationPage() {
  const [topTracks, setTopTracks] = useState([]);
  const [recentTracks, setRecentTracks] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recommendationSent, setRecommendationSent] = useState(false);
  const [receivedRecommendation, setReceivedRecommendation] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState("");
  const [showAllRecentTracks, setShowAllRecentTracks] = useState(false);

  useEffect(() => {
    fetchTopTracks();
    fetchRecentTracks();
  }, []);

  const fetchTopTracks = async () => {
    const spotifyToken = localStorage.getItem("spotify_token");
    if (!spotifyToken) return;
    try {
      const response = await axios.get("/spotify/top-tracks", {
        headers: { access_token: spotifyToken }
      });
      setTopTracks(response.data.items);
    } catch (err) {
      console.error("Error fetching top tracks:", err);
    }
  };

  const fetchRecentTracks = async () => {
    const spotifyToken = localStorage.getItem("spotify_token");
    if (!spotifyToken) return;
    try {
      const response = await axios.get("/spotify/recent-tracks", {
        headers: { access_token: spotifyToken }
      });
      setRecentTracks(response.data.items);
    } catch (err) {
      console.error("Error fetching recent tracks:", err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`/music/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data);
    } catch (err) {
      setError("Failed to search for music");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTrack = (track) => {
    setSelectedTrack(track);
  };

  const handleSendRecommendation = async () => {
    if (!selectedTrack) return;
    
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to send recommendations");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      console.log("Sending recommendation:", selectedTrack);
      await axios.post("/recommendation", {
        track: selectedTrack
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecommendationSent(true);
      fetchReceivedRecommendation();
    } catch (err) {
      console.error("Error sending recommendation:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Your session has expired. Please log out and log back in.");
      } else if (err.response?.status === 409 && err.response?.data?.alreadyRecommended) {
        setError("You have already recommended this song. Please select a different track.");
      } else if (err.response?.status === 400) {
        setError("Invalid track data. Please try selecting a different track.");
      } else if (err.response?.data?.message) {
        setError(`Failed to send recommendation: ${err.response.data.message}`);
      } else {
        setError("Failed to send recommendation. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchReceivedRecommendation = async () => {
    try {
      const response = await axios.get("/recommendation/random", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setReceivedRecommendation(response.data);
      setShowPopup(true);
    } catch (err) {
      setError("Failed to fetch a recommendation");
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setRecommendationSent(false);
    setSelectedTrack(null);
  };

  // Helper function to safely get album image URL
  const getAlbumImage = (track) => {
    if (track.album?.images?.[0]?.url) {
      return track.album.images[0].url;
    }
    if (track.track?.album?.images?.[0]?.url) {
      return track.track.album.images[0].url;
    }
    return "https://via.placeholder.com/40x40?text=No+Image";
  };

  // Helper function to safely get track data (for recently played vs other tracks)
  const getTrackData = (track) => {
    // Recently played tracks have a nested structure: track.track
    if (track.track) {
      return track.track;
    }
    // Top tracks and search results have direct structure
    return track;
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>Daily Song Recommendation</h1>
      <p>Recommend a song to the community! Choose from your top tracks or search for any song. After submitting, you'll receive a random recommendation from another user.</p>

      {/* Recommendation selection */}
      <div style={{ margin: "30px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2>Select a Song to Recommend</h2>
          <button
            onClick={handleSendRecommendation}
            disabled={!selectedTrack || loading || recommendationSent}
            style={{
              padding: "12px 15px",
              background: selectedTrack ? "#1db954" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              cursor: selectedTrack ? "pointer" : "not-allowed",
              height: "fit-content"
            }}
          >
            {recommendationSent ? "Recommendation Sent!" : "Confirm Recommendation"}
          </button>
        </div>
        {/* Search Bar */}
        <div style={{ marginBottom: 30 }}>
          <h3>Search for a Song</h3>
          <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Search for music..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ padding: 12, width: "60%", marginRight: 12, borderRadius: 6, border: "1px solid #ddd", fontSize: 16 }}
            />
            <button type="submit" disabled={loading} style={{ padding: 12, borderRadius: 6, border: "1px solid #1db954", background: "#1db954", color: "white", cursor: "pointer", fontSize: 16 }}>
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
          {error && (
            <div style={{ marginTop: 10 }}>
              <p style={{ color: "red", marginBottom: 10 }}>{error}</p>
              {(error.includes("session has expired") || error.includes("log in")) && (
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    window.location.href = "/account";
                  }}
                  style={{
                    padding: "8px 16px",
                    background: "#ff4444",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  Go to Login Page
                </button>
              )}
            </div>
          )}
          {searchResults.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h4>Search Results</h4>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {searchResults.map(track => (
                  <li key={track.id} style={{ display: "flex", alignItems: "center", marginBottom: 12, cursor: "pointer", background: selectedTrack?.id === track.id ? "#e8f5e8" : "white", borderRadius: 6, border: selectedTrack?.id === track.id ? "2px solid #1db954" : "1px solid #ddd", padding: 8 }} onClick={() => handleSelectTrack(track)}>
                    <img src={track.album.images[0]?.url || "https://via.placeholder.com/40x40?text=No+Image"} alt="album cover" style={{ width: 40, height: 40, borderRadius: 4, marginRight: 12, objectFit: "cover" }} />
                    <div>
                      <strong>{track.name}</strong><br />
                      <small>{track.artists.map(a => a.name).join(", ")}</small>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* Top Tracks */}
          <div style={{ flex: "1 1 300px", minWidth: "300px" }}>
            <h3>Your Top Tracks (Last 4 Weeks)</h3>
            {topTracks.length === 0 && <p>Connect your Spotify account to see your top tracks.</p>}
            <ul style={{ listStyle: "none", padding: 0 }}>
              {topTracks.map(track => (
                <li key={track.id} style={{ display: "flex", alignItems: "center", marginBottom: 12, cursor: "pointer", background: selectedTrack?.id === track.id ? "#e8f5e8" : "white", borderRadius: 6, border: selectedTrack?.id === track.id ? "2px solid #1db954" : "1px solid #ddd", padding: 8 }} onClick={() => handleSelectTrack(track)}>
                  <img src={track.album.images[0]?.url || "https://via.placeholder.com/40x40?text=No+Image"} alt="album cover" style={{ width: 40, height: 40, borderRadius: 4, marginRight: 12, objectFit: "cover" }} />
                  <div>
                    <strong>{track.name}</strong><br />
                    <small>{track.artists.map(a => a.name).join(", ")}</small>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Recently Played */}
          <div style={{ flex: "1 1 300px", minWidth: "300px" }}>
            <h3>Recently Played</h3>
            {recentTracks.length === 0 && <p>Connect your Spotify account to see your recently played tracks.</p>}
            <ul style={{ listStyle: "none", padding: 0 }}>
              {recentTracks.slice(0, showAllRecentTracks ? recentTracks.length : 10).map(item => {
                const track = getTrackData(item);
                return (
                  <li key={track.id} style={{ display: "flex", alignItems: "center", marginBottom: 12, cursor: "pointer", background: selectedTrack?.id === track.id ? "#e8f5e8" : "white", borderRadius: 6, border: selectedTrack?.id === track.id ? "2px solid #1db954" : "1px solid #ddd", padding: 8 }} onClick={() => handleSelectTrack(track)}>
                    <img src={getAlbumImage(item)} alt="album cover" style={{ width: 40, height: 40, borderRadius: 4, marginRight: 12, objectFit: "cover" }} />
                    <div>
                      <strong>{track.name}</strong><br />
                      <small>{track.artists.map(a => a.name).join(", ")}</small>
                    </div>
                  </li>
                );
              })}
            </ul>
            {recentTracks.length > 10 && (
              <button
                onClick={() => setShowAllRecentTracks(!showAllRecentTracks)}
                style={{
                  marginTop: 10,
                  padding: "8px 16px",
                  background: "transparent",
                  color: "#1db954",
                  border: "1px solid #1db954",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                {showAllRecentTracks ? "Show Less" : `View More (${recentTracks.length - 10} more)`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Recommendation Popup */}
      {showPopup && receivedRecommendation && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "32px",
            maxWidth: "500px",
            width: "90%",
            maxHeight: "80vh",
            overflow: "auto",
            position: "relative"
          }}>
            {/* Close button */}
            <button
              onClick={closePopup}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#666"
              }}
            >
              ×
            </button>

            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <h2 style={{ margin: "0 0 8px 0", color: "#1db954" }}>🎵 New Recommendation!</h2>
              <p style={{ margin: 0, color: "#666" }}>
                {receivedRecommendation.isSystemRecommendation 
                  ? "Here's a special recommendation for you"
                  : "Someone from the community recommended this song for you"
                }
              </p>
            </div>

            {/* Track Information */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              marginBottom: "24px",
              padding: "20px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px"
            }}>
              <img 
                src={receivedRecommendation.track.album.images[0]?.url || "https://via.placeholder.com/80x80?text=No+Image"} 
                alt="album cover" 
                style={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: "8px", 
                  marginRight: "20px", 
                  objectFit: "cover",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }} 
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "18px" }}>
                  {receivedRecommendation.track.name}
                </h3>
                <p style={{ margin: "0 0 12px 0", color: "#666", fontSize: "14px" }}>
                  {receivedRecommendation.track.artists.map(a => a.name).join(", ")}
                </p>
                <p style={{ margin: 0, color: "#888", fontSize: "12px" }}>
                  {receivedRecommendation.track.album.name}
                </p>
              </div>
            </div>

            {/* Recommender Information */}
            <div style={{ 
              marginBottom: "24px",
              padding: "16px",
              backgroundColor: receivedRecommendation.isSystemRecommendation ? "#e3f2fd" : "#e8f5e8",
              borderRadius: "8px",
              border: `1px solid ${receivedRecommendation.isSystemRecommendation ? "#2196f3" : "#1db954"}`
            }}>
              <h4 style={{ 
                margin: "0 0 8px 0", 
                color: receivedRecommendation.isSystemRecommendation ? "#2196f3" : "#1db954" 
              }}>
                {receivedRecommendation.isSystemRecommendation ? "Courtesy of:" : "Recommended by:"}
              </h4>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ margin: "0 0 4px 0", fontWeight: "bold" }}>
                    {receivedRecommendation.isSystemRecommendation ? "🎵 Ether" : receivedRecommendation.recommendedBy}
                  </p>
                  {!receivedRecommendation.isSystemRecommendation && (
                    <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                      {receivedRecommendation.recommenderCountry !== "Unknown" 
                        ? `📍 ${receivedRecommendation.recommenderCountry}` 
                        : "📍 Location unknown"
                      }
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Spotify Link */}
            <div style={{ textAlign: "center" }}>
              <a 
                href={receivedRecommendation.track.external_urls.spotify} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ 
                  display: "inline-block",
                  padding: "12px 24px",
                  backgroundColor: "#1db954",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  fontSize: "16px"
                }}
              >
                🎵 Open in Spotify
              </a>
            </div>

            {/* Close button at bottom */}
            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <button
                onClick={closePopup}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#666",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 