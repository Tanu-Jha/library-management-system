import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import database connection
import connectDB from './config/database.js';

// Import seed function
import { seedDatabase } from './models/index.js';

// Import routes
import authRoutes from './routes/auth.js';
import booksRoutes from './routes/books.js';
import moviesRoutes from './routes/movies.js';
import membersRoutes from './routes/members.js';
import transactionsRoutes from './routes/transactions.js';
import issueRequestsRoutes from './routes/issueRequests.js';
import usersRoutes from './routes/users.js';

const app = express();
const PORT = process.env.PORT || 9990;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json());

// Connect to database before handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/movies', moviesRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/issue-requests', issueRequestsRoutes);
app.use('/api/users', usersRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Seed initial data
    await seedDatabase();
    
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════════╗
║     📚 Library Management System - Backend Server             ║
╠═══════════════════════════════════════════════════════════════╣
║  Server running on: http://localhost:${PORT}                    ║
║  API Health Check:  http://localhost:${PORT}/api/health         ║
║  Database: MongoDB Atlas                                      ║
╠═══════════════════════════════════════════════════════════════╣
║  Default Credentials:                                         ║
║  Admin: username=admin, password=admin123                     ║
║  User:  username=user,  password=user123                      ║
╚═══════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;