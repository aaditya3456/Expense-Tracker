# Deployment Guide

This guide covers deploying the Expense Tracker application to production.

## Backend Deployment

### Option 1: Heroku

1. **Install Heroku CLI** and login:
   ```bash
   heroku login
   ```

2. **Create Heroku app:**
   ```bash
   cd server
   heroku create your-expense-tracker-api
   ```

3. **Add MongoDB Atlas:**
   - Create a MongoDB Atlas account
   - Create a cluster and get connection string
   - Add as config var:
     ```bash
     heroku config:set MONGODB_URI="your-mongodb-atlas-connection-string"
     ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

### Option 2: Railway / Render

1. **Connect your repository** to Railway/Render
2. **Set environment variables:**
   - `PORT` (auto-set by platform)
   - `MONGODB_URI` (your MongoDB connection string)
3. **Set build command:** `cd server && npm install`
4. **Set start command:** `cd server && npm start`

## Frontend Deployment

### Option 1: Vercel / Netlify

1. **Build the React app:**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Vercel:**
   ```bash
   npm install -g vercel
   cd client
   vercel
   ```

3. **Set environment variable:**
   - `REACT_APP_API_URL` = your backend API URL

### Option 2: Netlify

1. **Connect repository** to Netlify
2. **Build settings:**
   - Build command: `cd client && npm install && npm run build`
   - Publish directory: `client/build`
3. **Environment variables:**
   - `REACT_APP_API_URL` = your backend API URL

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/expense-tracker
```

### Frontend (.env)
```
REACT_APP_API_URL=https://your-api.herokuapp.com
```

## MongoDB Atlas Setup

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier available)
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for all IPs)
5. Get connection string and update `MONGODB_URI`

## CORS Configuration

If deploying frontend and backend separately, ensure CORS is configured:

```javascript
// server/index.js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use MongoDB Atlas (not local MongoDB)
- [ ] Configure CORS for production domain
- [ ] Set secure environment variables
- [ ] Enable HTTPS
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Configure logging
- [ ] Set up database backups
- [ ] Test API endpoints
- [ ] Verify frontend can connect to backend

## Testing Production Build Locally

```bash
# Build frontend
cd client
npm run build

# Serve backend
cd ../server
npm start

# Frontend build is in client/build
# Serve with: npx serve -s client/build
```

