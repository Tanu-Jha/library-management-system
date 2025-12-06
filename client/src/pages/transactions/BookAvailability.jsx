import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Film, Check, X, AlertCircle } from 'lucide-react';
import { booksApi, moviesApi } from '../../utils/api';
import './styles/Transactions.css';

const BookAvailability = () => {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState('book');
  const [searchBy, setSearchBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [names, setNames] = useState([]);
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    loadDropdownData();
  }, [searchType]);

  const loadDropdownData = async () => {
    try {
      if (searchType === 'book') {
        const [namesList, authorsList] = await Promise.all([
          booksApi.searchNames(),
          booksApi.searchAuthors()
        ]);
        setNames(namesList);
        setAuthors(authorsList);
      } else {
        const movies = await moviesApi.getAll();
        setNames([...new Set(movies.map(m => m.name))]);
        setAuthors([...new Set(movies.map(m => m.director))]);
      }
    } catch (err) {
      console.error('Failed to load dropdown data:', err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchTerm) {
      setError('Please select or enter a search term');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);
    setSelectedItem(null);

    try {
      let data;
      const filters = {};

      if (searchBy === 'name') {
        filters.name = searchTerm;
      } else {
        filters[searchType === 'book' ? 'author' : 'director'] = searchTerm;
      }

      if (searchType === 'book') {
        data = await booksApi.getAll(filters);
      } else {
        data = await moviesApi.getAll(filters);
      }

      setResults(data);

      if (data.length === 0) {
        setError('No items found matching your search');
      }
    } catch (err) {
      setError('Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleIssueSelected = () => {
    if (selectedItem && selectedItem.status === 'Available') {
      navigate('/transactions/issue', {
        state: {
          item: selectedItem,
          itemType: searchType
        }
      });
    }
  };

  return (
    <div className="transactions-container">
      {/* Header */}
      <div className="transactions-header">
        <h1 className="page-title">Book Availability</h1>
        <p className="page-subtitle">Search for available books and movies in the library</p>
      </div>

      {/* Search Form */}
      <div className="card">
        <form onSubmit={handleSearch} className="transaction-form">
          {/* Type Selection */}
          <div className="type-selection">
            <button
              type="button"
              onClick={() => { setSearchType('book'); setSearchTerm(''); setResults([]); }}
              className={`type-btn ${searchType === 'book' ? 'type-btn--active' : ''}`}
            >
              <BookOpen size={20} />
              <span>Books</span>
            </button>
            <button
              type="button"
              onClick={() => { setSearchType('movie'); setSearchTerm(''); setResults([]); }}
              className={`type-btn ${searchType === 'movie' ? 'type-btn--active' : ''}`}
            >
              <Film size={20} />
              <span>Movies</span>
            </button>
          </div>

          {/* Search Fields */}
          <div className="form-row form-row--2">
            <div className="form-group">
              <label className="form-label">
                Search by {searchType === 'book' ? 'Book' : 'Movie'} Name
              </label>
              <select
                value={searchBy === 'name' ? searchTerm : ''}
                onChange={(e) => { setSearchBy('name'); setSearchTerm(e.target.value); }}
                className="select-field"
              >
                <option value="">-- Select Name --</option>
                {names.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Search by {searchType === 'book' ? 'Author' : 'Director'}
              </label>
              <select
                value={searchBy === 'author' ? searchTerm : ''}
                onChange={(e) => { setSearchBy('author'); setSearchTerm(e.target.value); }}
                className="select-field"
              >
                <option value="">-- Select {searchType === 'book' ? 'Author' : 'Director'} --</option>
                {authors.map(author => (
                  <option key={author} value={author}>{author}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="message message--error">
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          )}

          {/* Search Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%' }}
          >
            <Search size={20} />
            <span>{loading ? 'Searching...' : 'Search'}</span>
          </button>
        </form>
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="card">
          <h2 className="section-title">Search Results</h2>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>{searchType === 'book' ? 'Author' : 'Director'}</th>
                  <th>Serial No</th>
                  <th>Available</th>
                  <th>Select</th>
                </tr>
              </thead>
              <tbody>
                {results.map((item) => (
                  <tr
                    key={item.id}
                    className={selectedItem?.id === item.id ? 'row--selected' : ''}
                    onClick={() => setSelectedItem(item)}
                  >
                    <td className="cell-medium">{item.name}</td>
                    <td>{item.author || item.director}</td>
                    <td className="cell-mono">{item.serial_number}</td>
                    <td>
                      {item.status === 'Available' ? (
                        <span className="badge badge--success">
                          <Check size={14} /> Yes
                        </span>
                      ) : (
                        <span className="badge badge--danger">
                          <X size={14} /> No
                        </span>
                      )}
                    </td>
                    <td>
                      <input
                        type="radio"
                        name="selectedItem"
                        checked={selectedItem?.id === item.id}
                        onChange={() => setSelectedItem(item)}
                        disabled={item.status !== 'Available'}
                        className="radio-input"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Issue Button */}
          {selectedItem && selectedItem.status === 'Available' && (
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handleIssueSelected} className="btn-primary" style={{ flex: 'none' }}>
                Issue Selected {searchType === 'book' ? 'Book' : 'Movie'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookAvailability;