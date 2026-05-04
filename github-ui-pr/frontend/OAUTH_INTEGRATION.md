# GitHub OAuth Integration - Frontend

## Overview
The frontend now has complete GitHub OAuth integration with the backend API.

## Key Features
✅ GitHub OAuth login flow
✅ Secure token management
✅ User authentication context
✅ Protected routes
✅ Automatic logout handling
✅ Cross-tab logout sync

## Architecture

### Frontend Components
- **AuthContext**: Global authentication state management
- **ProtectedRoute**: Route protection wrapper
- **Login**: GitHub OAuth initiation
- **Callback**: OAuth callback handling
- **Home**: Protected home page with user info

### Environment Variables
Frontend reads from parent `.env`:
- `GITHUB_CLIENT_ID` - GitHub OAuth app client ID
- `GITHUB_CLIENT_SECRET` - Used by backend only

### API Integration
- **Login Flow**: Redirects to GitHub OAuth
- **Callback**: POST to `/auth/callback` with authorization code
- **Protected Requests**: Include `Authorization: Bearer <token>` header
- **Logout**: Clears local storage and redirects

## Testing the Integration

### 1. Start Backend
```bash
cd /Users/coschool/Desktop/code/ui_playground/github-ui-pr
python main.py
# Backend runs on http://localhost:8000
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:3000
```

### 3. Test OAuth Flow
1. Visit http://localhost:3000
2. Click "Login with GitHub"
3. Authorize app on GitHub
4. Should redirect to /home with user info
5. Test logout functionality

## OAuth Flow Details

### Step 1: Login Initiation
```javascript
const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user,user:email,repo&response_type=code`;
```

### Step 2: Callback Processing
```javascript
axios.post('/auth/callback', { code })
  .then(response => {
    login(response.data.user, response.data.access_token);
    navigate('/home');
  })
```

### Step 3: Protected API Calls
```javascript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
```

## Security Features

- **HttpOnly**: Backend sets secure session cookies
- **CORS**: Configured for localhost:3000
- **Token Storage**: Frontend stores in localStorage
- **Route Protection**: Unauthenticated users redirected to login
- **Cross-tab Sync**: Storage events handle logout across tabs

## Next Steps

- Backend API endpoints use session cookies or Bearer tokens
- PR review functionality integrated with authenticated user
- Error handling for expired tokens
- Refresh token implementation (if needed)