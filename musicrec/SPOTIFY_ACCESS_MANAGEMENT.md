# Spotify Access Management Guide

Since your Spotify app is in Development Mode, users need to be manually added. This system automatically collects access requests.

## How It Works

1. When a user tries to connect Spotify but isn't registered, their request is automatically saved
2. You can view pending requests via the admin API
3. Add users in Spotify Dashboard, then mark them as added in the system

## Admin Endpoints

### View Pending Requests
```
GET https://your-backend-url.onrender.com/spotify/admin/pending-requests
```

Returns list of users who need to be added to Spotify.

### Mark Request as Added
```
POST https://your-backend-url.onrender.com/spotify/admin/mark-added
Content-Type: application/json

{
  "email": "user@example.com"
}
// OR
{
  "spotifyId": "spotify_user_id"
}
```

### View All Requests
```
GET https://your-backend-url.onrender.com/spotify/admin/all-requests
```

## Workflow

1. User tries to connect → Request saved automatically
2. Check pending requests via admin endpoint
3. Add user in Spotify Dashboard: https://developer.spotify.com/dashboard
   - Go to your app → "Users and Access" → "Add User"
   - Enter their email
4. Mark request as added via admin endpoint
5. User can now connect successfully

## Quick Script to Check Requests

You can use curl or Postman to check requests:

```bash
# View pending requests
curl https://your-backend-url.onrender.com/spotify/admin/pending-requests

# Mark as added (after adding in Spotify Dashboard)
curl -X POST https://your-backend-url.onrender.com/spotify/admin/mark-added \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

## Future: Build Admin UI

You could create a simple admin page in your React app to:
- View pending requests
- Copy emails to add in Spotify Dashboard
- Mark requests as added
- See request history

