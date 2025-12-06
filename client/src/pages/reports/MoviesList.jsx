import { useState, useEffect } from 'react';
import { Film, Search } from 'lucide-react';
import { moviesApi } from '../../utils/api';
import './styles/Reports.css';

const MoviesList = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const categories = ['Science', 'Economics', 'Fiction', 'Children', 'Personal Development'];
  const statuses = ['Available', 'Issued', 'Lost', 'Damaged'];

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    try {
      const data = await moviesApi.getAll();
      setMovies(data);
    } catch (err) {
      console.error('Failed to load movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.director.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.serial_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || movie.category === categoryFilter;
    const matchesStatus = !statusFilter || movie.status === statusFilter;
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
          <h1 className="page-title">Master List of Movies</h1>
          <p className="page-subtitle">View all movies in the library collection</p>
        </div>
        <div className="stats-badge stats-badge--purple">
          <Film size={20} />
          <span className="stats-value">{movies.length}</span>
          <span className="stats-label">Total Movies</span>
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
              placeholder="Search by name, director, or serial..."
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
                <th>Director</th>
                <th>Category</th>
                <th>Status</th>
                <th>Cost</th>
                <th>Procurement Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovies.map(movie => (
                <tr key={movie.id}>
                  <td className="cell-mono">{movie.serial_number}</td>
                  <td className="cell-medium">{movie.name}</td>
                  <td>{movie.director}</td>
                  <td>
                    <span className="badge badge--info">{movie.category}</span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(movie.status)}`}>
                      {movie.status}
                    </span>
                  </td>
                  <td>₹{movie.cost?.toFixed(2)}</td>
                  <td>
                    {movie.procurement_date
                      ? new Date(movie.procurement_date).toLocaleDateString()
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMovies.length === 0 && (
          <div className="empty-state">No movies found</div>
        )}
      </div>
    </div>
  );
};

export default MoviesList;