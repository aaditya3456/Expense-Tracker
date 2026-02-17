# Quick Start Guide

Get the Expense Tracker running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm run install-all
```

## Step 2: Set Up MongoDB

**Option A: Local MongoDB**
- Install MongoDB locally
- Start MongoDB service: `mongod`
- Default connection: `mongodb://localhost:27017/expense-tracker`

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account and cluster
3. Get connection string
4. Update `server/.env` with your connection string

## Step 3: Configure Environment

Create `server/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-tracker
```

Or for MongoDB Atlas:
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker
```

## Step 4: Run the Application

```bash
npm run dev
```

This starts:
- Backend API on http://localhost:5000
- Frontend on http://localhost:3000

## Step 5: Use the Application

1. Open http://localhost:3000 in your browser
2. Fill out the expense form:
   - Amount (₹)
   - Category (e.g., Food, Transport)
   - Description
   - Date
3. Click "Add Expense"
4. View your expenses, filter by category, sort by date!

## Troubleshooting

**MongoDB Connection Error?**
- Check if MongoDB is running (if local)
- Verify connection string in `server/.env`
- Check network/firewall settings (if Atlas)

**Port Already in Use?**
- Change PORT in `server/.env`
- React will prompt for different port if 3000 is taken

**Dependencies Issues?**
```bash
# Clean install
rm -rf node_modules server/node_modules client/node_modules
npm run install-all
```

## Next Steps

- See `README.md` for detailed documentation
- See `DEPLOYMENT.md` for production deployment
- See `SETUP.md` for detailed setup instructions

