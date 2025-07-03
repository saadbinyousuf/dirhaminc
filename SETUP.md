# DirhamInc Setup Guide

## Prerequisites

1. **Node.js** (v14 or higher)
2. **npm** (comes with Node.js)
3. **MongoDB Atlas Account** (free tier available)

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free account
2. Create a new cluster (free tier)
3. Set up database access:
   - Create a database user with username and password
   - Add your IP address to the IP whitelist (or use 0.0.0.0/0 for all IPs)
4. Get your connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

### 3. Configure Environment Variables

Update the `.env` file with your MongoDB Atlas connection string:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/dirhaminc?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
REACT_APP_API_URL=http://localhost:5050/api
```

**Replace:**
- `your-username` with your MongoDB Atlas username
- `your-password` with your MongoDB Atlas password
- `your-cluster` with your actual cluster name

### 4. Start the Backend Server

```bash
node server.js
```

You should see:
```
Server running on port 5000
MongoDB connected
```

### 5. Start the Frontend (in a new terminal)

```bash
npm start
```

The React app will open at `http://localhost:3000`

## Troubleshooting

### MongoDB Connection Issues
- Make sure your IP address is whitelisted in MongoDB Atlas
- Verify your username and password are correct
- Check that your cluster is running

### Port Issues
- If port 5000 is in use, change the PORT in .env
- If port 3000 is in use, React will automatically use the next available port

### Build Issues
- Run `npm install` to ensure all dependencies are installed
- Clear npm cache: `npm cache clean --force`

## Features

Once set up, you can:
- ✅ Create user accounts
- ✅ Add income and expenses
- ✅ Set budgets and track spending
- ✅ Create pending transactions for forecasting
- ✅ Add money-saving notes
- ✅ Manage multiple accounts
- ✅ Bulk import transactions via CSV
- ✅ Filter and search transactions

## Security Notes

- Change the JWT_SECRET in production
- Use environment variables for sensitive data
- Consider using MongoDB Atlas with proper authentication
- Enable CORS properly for production deployment

## Next Steps

1. **Test the application** by creating a user account
2. **Add some sample data** to see the features in action
3. **Customize the categories and tags** as needed
4. **Deploy to production** when ready

For production deployment, consider:
- Using a proper hosting service (Heroku, Vercel, etc.)
- Setting up a production MongoDB Atlas cluster
- Configuring proper CORS settings
- Using environment-specific configuration files 

FRONTEND_URL=http://localhost:3000 