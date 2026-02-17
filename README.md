# Expense Tracker

A full-stack personal finance application for recording and reviewing expenses. Built with React.js, Node.js, Express, and MongoDB.

## Features

- ✅ Create expense entries with amount, category, description, and date
- ✅ View a list of all expenses
- ✅ Filter expenses by category
- ✅ Sort expenses by date (newest first or oldest first)
- ✅ Display total amount of currently visible expenses
- ✅ Idempotent API requests (handles retries and duplicate submissions)
- ✅ Error handling and loading states
- ✅ Responsive design

## Tech Stack

- **Frontend**: React.js 18
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **HTTP Client**: Axios with retry logic

## Project Structure

```
expense-tracker/
├── server/                 # Backend API
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── index.js           # Express server entry point
│   └── package.json
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API service layer
│   │   ├── App.js         # Main app component
│   │   └── index.js       # React entry point
│   └── package.json
├── package.json           # Root package.json for convenience scripts
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas connection string)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Expense_Tracker
```

2. Install dependencies:
```bash
npm run install-all
```

Or install manually:
```bash
npm install
cd server && npm install
cd ../client && npm install
```

3. Set up environment variables:

Create `server/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-tracker
```

For MongoDB Atlas, use:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker
```

## Running the Application

### Development Mode

Run both server and client concurrently:
```bash
npm run dev
```

Or run separately:

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Production Build

Build the React app:
```bash
cd client
npm run build
```

Start the production server:
```bash
cd server
npm start
```

## API Endpoints

### POST /expenses
Create a new expense entry.

**Request Body:**
```json
{
  "amount": 150.50,
  "category": "Food",
  "description": "Lunch at restaurant",
  "date": "2024-01-15",
  "request_id": "req_1234567890_abc123" // Optional, for idempotency
}
```

**Response:**
```json
{
  "message": "Expense created successfully",
  "expense": {
    "_id": "...",
    "amount": 150.50,
    "category": "Food",
    "description": "Lunch at restaurant",
    "date": "2024-01-15T00:00:00.000Z",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### GET /expenses
Get list of expenses with optional filtering and sorting.

**Query Parameters:**
- `category` (optional): Filter by category name
- `sort` (optional): `date_desc` (default) or `date_asc`

**Example:**
```
GET /expenses?category=Food&sort=date_desc
```

**Response:**
```json
{
  "expenses": [...],
  "count": 10
}
```

## Key Design Decisions

### 1. Database Choice: MongoDB
- **Reason**: Flexible schema allows easy extension of expense fields
- **Trade-off**: Chose MongoDB over SQL for faster development and schema flexibility
- **Money Storage**: Using `Decimal128` type for precise decimal representation of currency amounts

### 2. Idempotency Handling
- **Implementation**: Using `request_id` field to prevent duplicate expenses from retries
- **Approach**: Client generates unique request IDs; server checks for duplicates before creating
- **Benefit**: Handles network retries, browser refreshes, and accidental double-clicks gracefully

### 3. Retry Logic
- **Implementation**: Axios interceptor with exponential backoff (1s, 2s, 4s)
- **Scope**: Retries on network errors and 5xx server errors (up to 3 attempts)
- **Benefit**: Improves reliability in unreliable network conditions

### 4. Frontend State Management
- **Approach**: React hooks (useState, useEffect) - no external state management library
- **Reason**: Simple enough for current feature set; can be refactored to Redux/Context if needed
- **Trade-off**: Kept it simple to focus on core functionality

### 5. Error Handling
- **Backend**: Express error handling with validation using express-validator
- **Frontend**: User-friendly error messages with retry buttons
- **Benefit**: Clear feedback for users when things go wrong

### 6. Money Handling
- **Storage**: MongoDB Decimal128 for precise decimal storage
- **Display**: Fixed 2 decimal places with proper parsing
- **Validation**: Prevents negative amounts on both client and server

## Trade-offs Made

1. **No Authentication**: Assumed single-user application for simplicity
   - Could be added later with JWT tokens

2. **Simple UI**: Focused on functionality over elaborate styling
   - Clean, responsive design but not heavily styled
   - Can be enhanced with UI libraries (Material-UI, Tailwind) later

3. **Basic Validation**: Client-side and server-side validation for core fields
   - Could add more sophisticated validation (e.g., category suggestions, date ranges)

4. **No Pagination**: Assumes reasonable number of expenses
   - Can be added if dataset grows large

5. **In-Memory Filtering**: Filtering happens server-side but could be optimized
   - Current implementation is sufficient for small to medium datasets

## What Was Intentionally Not Done

1. **User Authentication**: Not required for MVP; can be added later
2. **Expense Editing/Deletion**: Focused on core CRUD (Create, Read) first
3. **Advanced Analytics**: Charts, category breakdowns - nice to have but not core
4. **Export Functionality**: CSV/PDF export - can be added based on user needs
5. **Mobile App**: Web-first approach; responsive design covers mobile browsers
6. **Unit Tests**: Time constraints; would add Jest/React Testing Library tests in production
7. **Docker Setup**: Can be containerized later for easier deployment

## Production Considerations

For production deployment, consider:

1. **Environment Variables**: Use secure secret management
2. **CORS**: Configure CORS properly for production domain
3. **Rate Limiting**: Add rate limiting to prevent abuse
4. **Logging**: Implement proper logging (Winston, Morgan)
5. **Monitoring**: Add error tracking (Sentry) and monitoring
6. **Database Indexing**: Already added indexes on category and date fields
7. **HTTPS**: Ensure SSL/TLS encryption
8. **Input Sanitization**: Additional XSS protection
9. **API Versioning**: Consider `/api/v1/expenses` structure

## Testing the Application

### Manual Testing Scenarios

1. **Create Expense**: Fill form and submit
2. **Duplicate Prevention**: Submit same form twice quickly (should handle gracefully)
3. **Network Retry**: Disconnect network, submit form, reconnect (should retry)
4. **Filter**: Select category from dropdown
5. **Sort**: Toggle between newest/oldest first
6. **Total Calculation**: Verify total updates with filters
7. **Browser Refresh**: Submit expense, refresh page (should persist)

## License

ISC

## Author

Built as a full-stack assignment demonstrating production-ready code quality.

