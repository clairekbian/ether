# Ether ♫⋆｡♪ ₊˚♬ ﾟ.｡

Share your favorite tracks with friends and discover your next music muse!

## Features

- 🎵 Send and receive music recommendations
- 🔗 Connect with Spotify to access your top tracks
- 📝 View your recommendation history
- 🌍 See where recommendations come from around the world

## Tech Stack

- **Frontend:** React, React Router
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **APIs:** Spotify Web API

## Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Spotify Developer Account

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd musicrec
```

2. Install server dependencies
```bash
cd server
npm install
```

3. Install client dependencies
```bash
cd ../client
npm install
```

4. Create a `.env` file in the `server` directory:
```env
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
REDIRECT_URI=http://localhost:3000/callback
```

5. Run the application

In one terminal (server):
```bash
cd server
npm start
```

In another terminal (client):
```bash
cd client
npm start
```

The app will open at `http://localhost:3000`

## License

MIT

