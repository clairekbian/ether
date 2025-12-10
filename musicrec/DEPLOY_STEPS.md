# Quick Deployment Steps for Ether

## 1. Create GitHub Repository

**Option A: Using GitHub Website**
1. Go to https://github.com/new
2. Repository name: `ether`
3. Set to **Public**
4. **Don't** check any boxes (no README, .gitignore, or license)
5. Click "Create repository"
6. Run these commands:
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/ether.git
git push -u origin main
```

**Option B: Using GitHub CLI**
```bash
gh repo create ether --public --source=. --remote=origin --push
```

---

## 2. Deploy Backend to Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account and select the `ether` repository
4. Configure:
   - **Name**: `ether-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click **"Advanced"** and add Environment Variables:
   ```
   MONGO_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=generate-a-random-secret-string-here
   SPOTIFY_CLIENT_ID=your-spotify-client-id
   SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
   REDIRECT_URI=https://YOUR_NETLIFY_URL.netlify.app/callback
   ```
   *(You'll update REDIRECT_URI after deploying frontend)*
6. Click **"Create Web Service"**
7. Wait for deployment (2-3 minutes)
8. **Copy your backend URL** (e.g., `https://ether-backend.onrender.com`)

---

## 3. Deploy Frontend to Netlify

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub account and select the `ether` repository
4. Configure build settings:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/build`
5. Click **"Show advanced"** → **"New variable"** and add:
   - Key: `REACT_APP_API_URL`
   - Value: `https://ether-backend.onrender.com` (your Render backend URL from step 2)
6. Click **"Deploy site"**
7. Wait for deployment (2-3 minutes)
8. **Copy your frontend URL** (e.g., `https://ether-12345.netlify.app`)

---

## 4. Update Redirect URIs

**In Render:**
1. Go back to your Render dashboard
2. Click on `ether-backend` service
3. Go to **"Environment"** tab
4. Update `REDIRECT_URI` to: `https://YOUR_NETLIFY_URL.netlify.app/callback`
5. Click **"Save Changes"** (this will trigger a redeploy)

**In Spotify Developer Dashboard:**
1. Go to https://developer.spotify.com/dashboard
2. Click on your app
3. Click **"Edit Settings"**
4. Under **"Redirect URIs"**, add:
   - `https://YOUR_NETLIFY_URL.netlify.app/callback`
5. Click **"Add"** then **"Save"**

---

## 5. Test Your Deployment

1. Visit your Netlify URL: `https://YOUR_SITE.netlify.app`
2. Try signing up/logging in
3. Test Spotify connection
4. Test sending a recommendation

---

## Troubleshooting

- **Backend not connecting?** Check that `REACT_APP_API_URL` in Netlify matches your Render URL
- **Spotify auth failing?** Verify redirect URIs match exactly in both Render and Spotify dashboard
- **Database errors?** Check that `MONGO_URI` in Render is correct and your MongoDB Atlas IP whitelist allows all IPs (0.0.0.0/0)

---

## Your Live URLs

- **Frontend**: `https://YOUR_SITE.netlify.app`
- **Backend**: `https://ether-backend.onrender.com`

