const mongoose = require("mongoose");

const SpotifyAccessRequestSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  spotifyId: { type: String },
  displayName: { type: String },
  requestedAt: { type: Date, default: Date.now },
  added: { type: Boolean, default: false },
  addedAt: { type: Date }
});

module.exports = mongoose.model("SpotifyAccessRequest", SpotifyAccessRequestSchema);

