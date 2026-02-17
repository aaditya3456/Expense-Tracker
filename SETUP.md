# Quick Setup Guide

## Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)

## Installation Steps

1. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

2. **Set up environment variables:**
   
   Copy `server/.env.example` to `server/.env`:
   ```bash
   copy server\.env.example server\.env
   ```
   
   Edit `server/.env` and update MongoDB URI if needed:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/expense-tracker
   ```

3. **Start MongoDB:**
   
   If using local MongoDB:
   ```bash
   mongod
   ```
   
   Or use MongoDB Atlas and update the connection string in `.env`

4. **Run the application:**
   ```bash
   npm run dev
   ```

   This starts both backend (port 5000) and frontend (port 3000).

## Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running (if local)
- Check MongoDB URI in `server/.env`
- Verify network connectivity for MongoDB Atlas

### Port Already in Use
- Change PORT in `server/.env` for backend
- React dev server will prompt to use different port if 3000 is taken

### Dependencies Issues
- Delete `node_modules` folders and reinstall:
  ```bash
  rm -rf node_modules server/node_modules client/node_modules
  npm run install-all
  ```

