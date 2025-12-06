import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Member, Book, Movie, Transaction, Fine, IssueRequest } from './models/index.js';

dotenv.config();

const resetDatabase = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    console.log('Deleting all data...');
    
    // Delete in order to avoid foreign key issues (though Mongo is loose about this)
    await Fine.deleteMany({});
    await Transaction.deleteMany({});
    await IssueRequest.deleteMany({});
    await Member.deleteMany({});
    await User.deleteMany({});
    await Book.deleteMany({});
    await Movie.deleteMany({});

    console.log('Database successfully cleared!');
    console.log('Restart your server (npm run dev) to re-seed the default data.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
};

resetDatabase();