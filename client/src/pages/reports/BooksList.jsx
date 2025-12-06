import { useState, useEffect } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { booksApi } from '../../utils/api';
import './styles/Reports.css';

const BooksList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const categories = ['Science', 'Economics', 'Fiction', 'Children', 'Personal Development'];
  const statuses = ['Available', 'Issued', 'Lost', 'Damaged'];

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const data = await booksApi.getAll();
      setBooks(data);
    } catch (err) {
      console.error('Failed to load books:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.serial_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || book.category === categoryFilter;
    const matchesStatus = !statusFilter || book.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    const badges = {
      'Available': 'badge--success',
      'Issued': 'badge--warning',
      'Lost': 'badge--danger',
      'Damaged': 'badge--info'
    };
    return badges[status] || 'badge--info';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="reports-header">
        <div>
          <h1 className="page-title">Master List of Books</h1>
          <p className="page-subtitle">View all books in the library collection</p>
        </div>
        <div className="stats-badge stats-badge--blue">
          <BookOpen size={20} />
          <span className="stats-value">{books.length}</span>
          <span className="stats-label">Total Books</span>
        </div>
      </div>

      <div className="card">
        <div className="filter-section">
          <div className="search-wrapper" style={{ flex: 1 }}>
            <Search className="search-icon" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, author, or serial..."
              className="input-field search-input"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="select-field select-field--wide"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-field"
          >
            <option value="">All Status</option>
            {statuses.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Serial No</th>
                <th>Name</th>
                <th>Author</th>
                <th>Category</th>
                <th>Status</th>
                <th>Cost</th>
                <th>Procurement Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map(book => (
                <tr key={book.id}>
                  <td className="cell-mono">{book.serial_number}</td>
                  <td className="cell-medium">{book.name}</td>
                  <td>{book.author}</td>
                  <td>
                    <span className="badge badge--info">{book.category}</span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(book.status)}`}>
                      {book.status}
                    </span>
                  </td>
                  <td>${book.cost?.toFixed(2)}</td>
                  <td>
                    {book.procurement_date
                      ? new Date(book.procurement_date).toLocaleDateString()
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBooks.length === 0 && (
          <div className="empty-state">No books found matching your criteria</div>
        )}
      </div>
    </div>
  );
};

export default BooksList;