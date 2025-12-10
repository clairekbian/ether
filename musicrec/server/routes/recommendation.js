const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Recommendation = require("../models/Recommendation");
const User = require("../models/User");

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.userId = decoded.id;
    next();
  });
};

// Store a new recommendation in the pool
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { track } = req.body;
    
    if (!track || !track.id || !track.name) {
      return res.status(400).json({ message: "Invalid track data" });
    }

    // Check if user has already recommended this track
    const existingRecommendation = await Recommendation.findOne({
      userId: req.userId,
      "track.id": track.id
    });

    if (existingRecommendation) {
      return res.status(409).json({ 
        message: "You have already recommended this song. Please select a different track.",
        alreadyRecommended: true
      });
    }

    // Create new recommendation in the pool
    const recommendation = new Recommendation({
      userId: req.userId,
      track: track,
      consumed: false,
      consumedBy: null,
      consumedAt: null
    });

    await recommendation.save();
    
    res.json({ 
      message: "Recommendation added to pool successfully",
      recommendation: recommendation
    });
  } catch (error) {
    console.error("Error saving recommendation:", error);
    res.status(500).json({ message: "Failed to save recommendation" });
  }
});

// Get a random recommendation from the pool and consume it
router.get("/random", authenticateToken, async (req, res) => {
  try {
    // First, check if there are any unconsumed recommendations from other users
    const otherUserRecommendations = await Recommendation.countDocuments({
      userId: { $ne: req.userId }, // Exclude current user's recommendations
      consumed: false // Only get unconsumed recommendations
    });

    if (otherUserRecommendations === 0) {
      // No recommendations from other users, provide a system recommendation
      const systemRecommendations = [
        {
          track: {
            id: "3AX2zMrXcR2up2rg4bpXSM",
            name: "HARDX",
            artists: [{ name: "Yaego" }],
            album: {
              name: "HARDX — Single",
              images: [{ url: "https://i.scdn.co/image/ab67616d0000b273c6dd25efb4ab10a9b52d1dbb" }]
            },
            external_urls: {
              spotify: "https://open.spotify.com/track/3AX2zMrXcR2up2rg4bpXSM"
            }
          },
          isSystemRecommendation: true
        },
        {
          track: {
            id: "1zX178V8sWozr96MrfmRun",
            name: "Western Union",
            artists: [
              { name: "Thaiboy Digital" },
              { name: "Bladee" },
              { name: "Ecco2k" }
            ],
            album: {
              name: "Trash Island",
              images: [{ url: "https://i.scdn.co/image/ab67616d0000b27389fc8b71ce74de508e3109af" }]
            },
            external_urls: {
              spotify: "https://open.spotify.com/track/1zX178V8sWozr96MrfmRun"
            }
          },
          isSystemRecommendation: true
        },
        {
          track: {
            id: "5IBgHRJfCoxwIlalQZsW08",
            name: "Princess",
            artists: [{ name: "Feng" }],
            album: {
              name: "Princess — Single",
              images: [{ url: "https://i.scdn.co/image/ab67616d0000b273b9e8f098bc8f0f0644ec6c6b" }]
            },
            external_urls: {
              spotify: "https://open.spotify.com/track/5IBgHRJfCoxwIlalQZsW08"
            }
          },
          isSystemRecommendation: true
        },
        {
          track: {
            id: "6AerqwCmIFR3qqiskGzsYA",
            name: "Only Seeing God When I Come",
            artists: [{ name: "Sega Bodega" }],
            album: {
              name: "Romeo",
              images: [{ url: "https://i.scdn.co/image/ab67616d0000b273fae2b5ffe2cedb7a45d6e09e" }]
            },
            external_urls: {
              spotify: "https://open.spotify.com/track/6AerqwCmIFR3qqiskGzsYA"
            }
          },
          isSystemRecommendation: true
        },
        {
          track: {
            id: "5MAJGAdzKex0Z8Po7GwS4e",
            name: "Rivet Gun",
            artists: [{ name: "Mother Soki" }],
            album: {
              name: "Rivet Gun — Single",
              images: [{ url: "https://i.scdn.co/image/ab67616d0000b273a7d857b4338e4e100afd5270" }]
            },
            external_urls: {
              spotify: "https://open.spotify.com/track/5MAJGAdzKex0Z8Po7GwS4e"
            }
          },
          isSystemRecommendation: true
        },
        {
          track: {
            id: "4RzqrsImlUQO81AksmEsbq",
            name: "True Altruism",
            artists: [{ name: "Chanel Beads" }],
            album: {
              name: "True Altruism — Single",
              images: [{ url: "https://i.scdn.co/image/ab67616d0000b273d270b3b17cbdfcc0b971ef2a" }]
            },
            external_urls: {
              spotify: "https://open.spotify.com/track/4RzqrsImlUQO81AksmEsbq"
            }
          },
          isSystemRecommendation: true
        },
        {
          track: {
            id: "7pCdAOcXQ8vhDpy98dGsGT",
            name: "r u kissin any1?",
            artists: [{ name: "Joey Cash" }],
            album: {
              name: "r u kissin any1? — Single",
              images: [{ url: "https://i.scdn.co/image/ab67616d0000b273ed23de77be4b7610a64dac45" }]
            },
            external_urls: {
              spotify: "https://open.spotify.com/track/7pCdAOcXQ8vhDpy98dGsGT"
            }
          },
          isSystemRecommendation: true
        },
        {
          track: {
            id: "7CK4bpTIiYWYp478jgSlgp",
            name: "5",
            artists: [
              { name: "Dean Blunt" },
              { name: "Elias Rønnenfelt" }
            ],
            album: {
              name: "lucre",
              images: [{ url: "https://i.scdn.co/image/ab67616d0000b273a1906f03b1e2a0f2eaa3d6b5" }]
            },
            external_urls: {
              spotify: "https://open.spotify.com/track/7CK4bpTIiYWYp478jgSlgp"
            }
          },
          isSystemRecommendation: true
        }
      ];

      // Select a random system recommendation
      const randomSystemRec = systemRecommendations[Math.floor(Math.random() * systemRecommendations.length)];
      
      // Store the system recommendation in the database for tracking
      const systemRecommendation = new Recommendation({
        userId: "000000000000000000000000", // Use a special system user ID instead of null
        track: randomSystemRec.track,
        consumed: true, // Mark as immediately consumed
        consumedBy: req.userId, // Mark as consumed by the current user
        consumedAt: new Date(),
        isSystemRecommendation: true // Flag to identify system recommendations
      });
      
      console.log("Creating system recommendation for user:", req.userId);
      console.log("System recommendation data:", {
        track: randomSystemRec.track.name,
        consumedBy: req.userId,
        isSystemRecommendation: true
      });
      
      await systemRecommendation.save();
      console.log("System recommendation saved successfully");
      
      return res.json({
        track: randomSystemRec.track,
        isSystemRecommendation: true,
        recommendedBy: "Ether",
        recommenderCountry: null
      });
    }

    // There are recommendations from other users, get a random one
    const randomRecommendation = await Recommendation.aggregate([
      {
        $match: {
          userId: { $ne: req.userId }, // Exclude current user's recommendations
          consumed: false // Only get unconsumed recommendations
        }
      },
      {
        $sample: { size: 1 } // Get one random recommendation
      }
    ]);

    // Mark this recommendation as consumed by the current user
    const recommendation = await Recommendation.findByIdAndUpdate(
      randomRecommendation[0]._id,
      {
        consumed: true,
        consumedBy: req.userId,
        consumedAt: new Date()
      },
      { new: true }
    ).populate('userId', 'username name country');

    res.json({
      track: recommendation.track,
      isSystemRecommendation: false,
      recommendedBy: recommendation.userId.username || recommendation.userId.name || "Anonymous",
      recommenderCountry: recommendation.userId.country || "Unknown"
    });
  } catch (error) {
    console.error("Error fetching random recommendation:", error);
    res.status(500).json({ message: "Failed to fetch recommendation" });
  }
});

// Get user's own recommendations (both in pool and consumed)
router.get("/my", authenticateToken, async (req, res) => {
  try {
    const recommendations = await Recommendation.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(recommendations);
  } catch (error) {
    console.error("Error fetching user recommendations:", error);
    res.status(500).json({ message: "Failed to fetch recommendations" });
  }
});

// Get recommendations consumed by the current user
router.get("/received", authenticateToken, async (req, res) => {
  try {
    console.log("Fetching received recommendations for user:", req.userId);
    
    const receivedRecommendations = await Recommendation.find({ 
      consumedBy: req.userId 
    })
    .populate('userId', 'username name country')
    .sort({ consumedAt: -1 })
    .limit(20);

    console.log("Found received recommendations:", receivedRecommendations.length);
    console.log("Sample recommendation:", receivedRecommendations[0] ? {
      track: receivedRecommendations[0].track.name,
      isSystemRecommendation: receivedRecommendations[0].isSystemRecommendation,
      consumedAt: receivedRecommendations[0].consumedAt
    } : "No recommendations found");

    res.json(receivedRecommendations);
  } catch (error) {
    console.error("Error fetching received recommendations:", error);
    res.status(500).json({ message: "Failed to fetch received recommendations" });
  }
});

// Get pool statistics (for admin/debugging purposes)
router.get("/pool-stats", authenticateToken, async (req, res) => {
  try {
    const totalInPool = await Recommendation.countDocuments({ consumed: false });
    const totalConsumed = await Recommendation.countDocuments({ consumed: true });
    const userInPool = await Recommendation.countDocuments({ 
      userId: req.userId, 
      consumed: false 
    });
    const userConsumed = await Recommendation.countDocuments({ 
      consumedBy: req.userId 
    });
    const systemRecommendations = await Recommendation.countDocuments({ 
      isSystemRecommendation: true 
    });
    const userSystemRecommendations = await Recommendation.countDocuments({ 
      consumedBy: req.userId,
      isSystemRecommendation: true 
    });

    res.json({
      totalInPool,
      totalConsumed,
      userInPool,
      userConsumed,
      systemRecommendations,
      userSystemRecommendations
    });
  } catch (error) {
    console.error("Error fetching pool stats:", error);
    res.status(500).json({ message: "Failed to fetch pool statistics" });
  }
});

// Test endpoint to check database state
router.get("/debug", authenticateToken, async (req, res) => {
  try {
    const allRecommendations = await Recommendation.find({}).sort({ createdAt: -1 }).limit(10);
    const userRecommendations = await Recommendation.find({ consumedBy: req.userId }).sort({ consumedAt: -1 });
    const systemRecommendations = await Recommendation.find({ isSystemRecommendation: true }).sort({ createdAt: -1 });
    
    res.json({
      totalRecommendations: allRecommendations.length,
      userRecommendations: userRecommendations.length,
      systemRecommendations: systemRecommendations.length,
      sampleUserRec: userRecommendations[0] || null,
      sampleSystemRec: systemRecommendations[0] || null
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({ message: "Debug failed" });
  }
});

module.exports = router; 