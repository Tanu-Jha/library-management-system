import User from './User.js';
import Member from './Member.js';
import Book from './Book.js';
import Movie from './Movie.js';
import Transaction from './Transaction.js';
import Fine from './Fine.js';
import IssueRequest from './IssueRequest.js';
import bcrypt from 'bcryptjs';

export { User, Member, Book, Movie, Transaction, Fine, IssueRequest };

// Seed initial data
export async function seedDatabase() {
  try {
    // Seed admin user ONLY
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = bcrypt.hashSync('admin_techno', 10);
      await User.create({
        username: 'admin',
        password: hashedPassword,
        name: 'Administrator',
        email: 'admin@library.com',
        is_admin: 1,
        is_active: 1,
        membership_status: 'approved'
      });
      console.log('Admin user created');
    }

    // Seed sample books
    const booksCount = await Book.countDocuments();
    if (booksCount === 0) {
      const sampleBooks = [
        { serial_number: 'SC-B-001', name: 'A Brief History of Time', author: 'Stephen Hawking', category: 'Science', status: 'Available', cost: 1500, procurement_date: new Date('2024-01-15') },
        { serial_number: 'SC-B-002', name: 'The Elegant Universe', author: 'Brian Greene', category: 'Science', status: 'Available', cost: 1200, procurement_date: new Date('2024-01-20') },
        { serial_number: 'EC-B-001', name: 'Freakonomics', author: 'Steven Levitt', category: 'Economics', status: 'Available', cost: 800, procurement_date: new Date('2024-01-10') },
        { serial_number: 'FC-B-001', name: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Fiction', status: 'Available', cost: 450, procurement_date: new Date('2024-02-05') },
      ];
      await Book.insertMany(sampleBooks);
      console.log('Sample books created');
    }

    // Seed sample movies
    const moviesCount = await Movie.countDocuments();
    if (moviesCount === 0) {
      const sampleMovies = [
        { serial_number: 'SC-M-001', name: 'Interstellar', director: 'Christopher Nolan', category: 'Science', status: 'Available', cost: 499, procurement_date: new Date('2024-01-15') },
        { serial_number: 'FC-M-001', name: 'The Shawshank Redemption', director: 'Frank Darabont', category: 'Fiction', status: 'Available', cost: 399, procurement_date: new Date('2024-02-05') },
      ];
      await Movie.insertMany(sampleMovies);
      console.log('Sample movies created');
    }

    // Seed sample members
    const membersCount = await Member.countDocuments();
    if (membersCount === 0) {
      const today = new Date();
      const sixMonthsLater = new Date(today);
      sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

      const sampleMembers = [
            { membership_number: 'MEM-001', first_name: 'Rahul', last_name: 'Sharma', contact_name: 'Rahul Sharma', contact_address: 'Delhi, India', aadhar_number: '1234-5678-9012', start_date: today, end_date: sixMonthsLater, membership_type: '6_months', is_active: 1 },
      ];
      await Member.insertMany(sampleMembers);
      console.log('Sample members created');
    }

    console.log('Database seeding completed');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}