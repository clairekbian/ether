# Deployment Guide

## Prerequisites
- GitHub account
- Netlify account (for frontend) - [Sign up](https://netlify.com)
- Render account (for backend) - [Sign up](https://render.com)
- MongoDB Atlas account (for database) - [Sign up](https://mongodb.com/cloud/atlas)

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `museletter` (or your preferred name)
3. **Don't** initialize with README, .gitignore, or license
4. Copy the repository URL

Then update your remote:
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/museletter.git
git push -u origin main
```

## Step 2: Deploy Backend to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `museletter-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   - `MONGO_URI` - Your MongoDB Atlas connection string
   - `JWT_SECRET` - A random secret string
   - `SPOTIFY_CLIENT_ID` - Your Spotify app client ID
   - `SPOTIFY_CLIENT_SECRET` - Your Spotify app client secret
   - `REDIRECT_URI` - `https://YOUR_NETLIFY_URL.netlify.app/callback`
   - `PORT` - Leave as default (Render sets this automatically)
6. Click "Create Web Service"
7. Wait for deployment and copy your backend URL (e.g., `https://museletter.onrender.com`)

## Step 3: Deploy Frontend to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Configure build settings:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/build`
5. Add Environment Variables:
   - `REACT_APP_API_URL` - Your Render backend URL (e.g., `https://museletter.onrender.com`)
6. Click "Deploy site"
7. Wait for deployment and copy your frontend URL

## Step 4: Update Redirect URI

1. Go back to Render dashboard
2. Update the `REDIRECT_URI` environment variable to your Netlify URL: `https://YOUR_SITE.netlify.app/callback`
3. Also update this in your Spotify app settings at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)

## Step 5: Update Spotify App Settings

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click on your app
3. Add your Netlify URL to "Redirect URIs":
   - `https://YOUR_SITE.netlify.app/callback`
4. Save changes

## Your app is now live! 🎉

- Frontend: `https://YOUR_SITE.netlify.app`
- Backend: `https://museletter.onrender.com` (or your Render URL)

