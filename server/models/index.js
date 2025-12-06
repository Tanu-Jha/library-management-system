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
    // Seed admin user
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      await User.create({
        username: 'admin',
        password: hashedPassword,
        name: 'Administrator',
        email: 'admin@library.com',
        is_admin: 1,
        is_active: 1
      });
      console.log('Admin user created');
    }

    // Seed regular user
    const userExists = await User.findOne({ username: 'user' });
    if (!userExists) {
      const hashedPassword = bcrypt.hashSync('user123', 10);
      await User.create({
        username: 'user',
        password: hashedPassword,
        name: 'Regular User',
        email: 'user@library.com',
        is_admin: 0,
        is_active: 1
      });
      console.log('Regular user created');
    }

    // Seed sample books
    const booksCount = await Book.countDocuments();
    if (booksCount === 0) {
      const sampleBooks = [
        { serial_number: 'SC-B-001', name: 'A Brief History of Time', author: 'Stephen Hawking', category: 'Science', status: 'Available', cost: 25.99, procurement_date: new Date('2024-01-15') },
        { serial_number: 'SC-B-002', name: 'The Elegant Universe', author: 'Brian Greene', category: 'Science', status: 'Available', cost: 22.50, procurement_date: new Date('2024-01-20') },
        { serial_number: 'SC-B-003', name: 'Cosmos', author: 'Carl Sagan', category: 'Science', status: 'Available', cost: 18.99, procurement_date: new Date('2024-02-01') },
        { serial_number: 'EC-B-001', name: 'Freakonomics', author: 'Steven Levitt', category: 'Economics', status: 'Available', cost: 15.99, procurement_date: new Date('2024-01-10') },
        { serial_number: 'EC-B-002', name: 'Capital in the 21st Century', author: 'Thomas Piketty', category: 'Economics', status: 'Available', cost: 35.00, procurement_date: new Date('2024-01-25') },
        { serial_number: 'FC-B-001', name: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Fiction', status: 'Available', cost: 12.99, procurement_date: new Date('2024-02-05') },
        { serial_number: 'FC-B-002', name: '1984', author: 'George Orwell', category: 'Fiction', status: 'Available', cost: 14.99, procurement_date: new Date('2024-02-10') },
        { serial_number: 'FC-B-003', name: 'Pride and Prejudice', author: 'Jane Austen', category: 'Fiction', status: 'Available', cost: 11.99, procurement_date: new Date('2024-02-15') },
        { serial_number: 'CH-B-001', name: 'Harry Potter and the Philosopher Stone', author: 'J.K. Rowling', category: 'Children', status: 'Available', cost: 19.99, procurement_date: new Date('2024-01-05') },
        { serial_number: 'CH-B-002', name: 'Charlotte Web', author: 'E.B. White', category: 'Children', status: 'Available', cost: 10.99, procurement_date: new Date('2024-01-12') },
        { serial_number: 'PD-B-001', name: 'Atomic Habits', author: 'James Clear', category: 'Personal Development', status: 'Available', cost: 16.99, procurement_date: new Date('2024-02-20') },
        { serial_number: 'PD-B-002', name: 'The 7 Habits of Highly Effective People', author: 'Stephen Covey', category: 'Personal Development', status: 'Available', cost: 18.99, procurement_date: new Date('2024-02-25') },
      ];
      await Book.insertMany(sampleBooks);
      console.log('Sample books created');
    }

    // Seed sample movies
    const moviesCount = await Movie.countDocuments();
    if (moviesCount === 0) {
      const sampleMovies = [
        { serial_number: 'SC-M-001', name: 'Interstellar', director: 'Christopher Nolan', category: 'Science', status: 'Available', cost: 4.99, procurement_date: new Date('2024-01-15') },
        { serial_number: 'SC-M-002', name: 'The Martian', director: 'Ridley Scott', category: 'Science', status: 'Available', cost: 4.50, procurement_date: new Date('2024-01-20') },
        { serial_number: 'EC-M-001', name: 'The Big Short', director: 'Adam McKay', category: 'Economics', status: 'Available', cost: 3.99, procurement_date: new Date('2024-01-10') },
        { serial_number: 'FC-M-001', name: 'The Shawshank Redemption', director: 'Frank Darabont', category: 'Fiction', status: 'Available', cost: 4.99, procurement_date: new Date('2024-02-05') },
        { serial_number: 'CH-M-001', name: 'Toy Story', director: 'John Lasseter', category: 'Children', status: 'Available', cost: 3.99, procurement_date: new Date('2024-01-05') },
        { serial_number: 'PD-M-001', name: 'The Pursuit of Happyness', director: 'Gabriele Muccino', category: 'Personal Development', status: 'Available', cost: 4.50, procurement_date: new Date('2024-02-20') },
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
        { membership_number: 'MEM-001', first_name: 'John', last_name: 'Doe', contact_name: 'John Doe', contact_address: '123 Main St, City', aadhar_number: '1234-5678-9012', start_date: today, end_date: sixMonthsLater, membership_type: '6_months', is_active: 1 },
        { membership_number: 'MEM-002', first_name: 'Jane', last_name: 'Smith', contact_name: 'Jane Smith', contact_address: '456 Oak Ave, Town', aadhar_number: '9876-5432-1098', start_date: today, end_date: sixMonthsLater, membership_type: '6_months', is_active: 1 },
      ];
      await Member.insertMany(sampleMembers);
      console.log('Sample members created');
    }

    console.log('Database seeding completed');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}