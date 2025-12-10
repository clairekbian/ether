import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AccountPage from "./components/AccountPage";
import Callback from "./components/Callback";
import RecommendationPage from "./components/RecommendationPage";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <Router>
      <nav 
        ref={menuRef}
        style={{ 
          position: "relative",
          padding: "1rem",
          background: "#f8f8f8",
          borderBottom: "1px solid #ddd"
        }}
      >
        {/* Hamburger Menu Icon */}
        <button
          onClick={toggleMenu}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "24px",
            padding: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "4px"
          }}
          aria-label="Toggle menu"
        >
          <span style={{ 
            display: "block", 
            width: "25px", 
            height: "3px", 
            background: "#333",
            borderRadius: "2px",
            transition: "all 0.3s"
          }}></span>
          <span style={{ 
            display: "block", 
            width: "25px", 
            height: "3px", 
            background: "#333",
            borderRadius: "2px",
            transition: "all 0.3s"
          }}></span>
          <span style={{ 
            display: "block", 
            width: "25px", 
            height: "3px", 
            background: "#333",
            borderRadius: "2px",
            transition: "all 0.3s"
          }}></span>
        </button>

        {/* Collapsible Menu */}
        {menuOpen && (
          <div style={{
            position: "absolute",
            top: "60px",
            left: "1rem",
            background: "white",
            border: "1px solid #ddd",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            padding: "1rem",
            zIndex: 1000,
            minWidth: "150px"
          }}>
            <Link 
              to="/" 
              onClick={() => setMenuOpen(false)}
              style={{ 
                display: "block",
                padding: "12px 16px",
                textDecoration: "none",
                color: "#333",
                borderRadius: "4px",
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.target.style.background = "#f0f0f0"}
              onMouseLeave={(e) => e.target.style.background = "transparent"}
            >
              Home
            </Link>
            <Link 
              to="/recommend" 
              onClick={() => setMenuOpen(false)}
              style={{ 
                display: "block",
                padding: "12px 16px",
                textDecoration: "none",
                color: "#333",
                borderRadius: "4px",
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.target.style.background = "#f0f0f0"}
              onMouseLeave={(e) => e.target.style.background = "transparent"}
            >
              Recommend
            </Link>
            <Link 
              to="/account" 
              onClick={() => setMenuOpen(false)}
              style={{ 
                display: "block",
                padding: "12px 16px",
                textDecoration: "none",
                color: "#333",
                borderRadius: "4px",
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.target.style.background = "#f0f0f0"}
              onMouseLeave={(e) => e.target.style.background = "transparent"}
            >
              Account
            </Link>
          </div>
        )}
      </nav>

      <Routes>
        <Route path="/" element={
          <div style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
            textAlign: "center"
          }}>
            <h1>~welcome 2 ether ♫⋆｡♪ ₊˚♬ ﾟ.｡~</h1>
            <p>share your favorite tracks with friends and get lost in the ether ଘ(੭* ⌒.–)੭* ̀ˋ</p>
          </div>
        } />
        <Route path="/recommend" element={<RecommendationPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/callback" element={<Callback />} />
      </Routes>
    </Router>
  );
}

export default App;
