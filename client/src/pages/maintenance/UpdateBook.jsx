import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, AlertCircle, Check, Loader2, Search, BookOpen, Film } from 'lucide-react';
import { booksApi, moviesApi } from '../../utils/api';
import './styles/Maintenance.css';

const UpdateBook = () => {
  const navigate = useNavigate();
  const [itemType, setItemType] = useState('book');
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['Science', 'Economics', 'Fiction', 'Children', 'Personal Development'];
  const statuses = ['Available', 'Issued', 'Lost', 'Damaged'];

  const [formData, setFormData] = useState({
    name: '',
    author: '',
    category: '',
    status: '',
    cost: '',
    procurementDate: ''
  });

  useEffect(() => {
    loadItems();
  }, [itemType]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = itemType === 'book' ? await booksApi.getAll() : await moviesApi.getAll();
      setItems(data);
    } catch (err) {
      setError('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      author: item.author || item.director,
      category: item.category,
      status: item.status,
      cost: item.cost?.toString() || '',
      procurementDate: item.procurement_date || ''
    });
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    setSubmitting(true);
    setError('');

    try {
      const data = {
        ...formData,
        cost: parseFloat(formData.cost) || 0,
        ...(itemType === 'movie' && { director: formData.author })
      };

      if (itemType === 'book') {
        await booksApi.update(selectedItem._id, data);
      } else {
        await moviesApi.update(selectedItem._id, data);
      }

      setSuccess('Item updated successfully!');
      loadItems();
    } catch (err) {
      setError(err.message || 'Failed to update item');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.serial_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="maintenance-container">
      <div className="maintenance-header">
        <h1 className="page-title">Update Book / Movie</h1>
        <p className="page-subtitle">Modify existing items</p>
      </div>

      <div className="card">
        <div className="type-selection" style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={() => { setItemType('book'); setSelectedItem(null); }}
            className={`type-btn ${itemType === 'book' ? 'type-btn--active' : ''}`}
          >
            <BookOpen size={20} />
            <span>Books</span>
          </button>
          <button
            onClick={() => { setItemType('movie'); setSelectedItem(null); }}
            className={`type-btn ${itemType === 'movie' ? 'type-btn--active' : ''}`}
          >
            <Film size={20} />
            <span>Movies</span>
          </button>
        </div>

        <div className="search-wrapper" style={{ marginBottom: '1rem' }}>
          <Search className="search-icon" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="input-field search-input"
          />
        </div>

        {loading ? (
          <div className="loading-container">
            <Loader2 className="spinner" size={32} />
          </div>
        ) : (
          <div className="item-list">
            {filteredItems.map(item => (
              <div
                key={item.id}
                onClick={() => handleSelectItem(item)}
                className={`item-row ${selectedItem?._id === item._id ? 'item-row--selected' : ''}`}
              >
                <p className="item-name">{item.name}</p>
                <p className="item-meta">{item.serial_number} • {item.author || item.director}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedItem && (
        <div className="card">
          <h2 className="section-title">Edit: {selectedItem.name}</h2>
          <form onSubmit={handleSubmit} className="maintenance-form">
            <div className="form-row form-row--2">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label className="form-label">{itemType === 'book' ? 'Author' : 'Director'}</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>

            <div className="form-row form-row--2">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="select-field"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="select-field"
                >
                  {statuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row form-row--2">
              <div className="form-group">
                <label className="form-label">Cost (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Procurement Date</label>
                <input
                  type="date"
                  name="procurementDate"
                  value={formData.procurementDate}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>

            {error && (
              <div className="message message--error">
                <AlertCircle size={20} />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="message message--success">
                <Check size={20} />
                <p>{success}</p>
              </div>
            )}

            <div className="btn-group">
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? (
                  <>
                    <Loader2 className="spinner" size={20} />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Settings size={20} />
                    <span>Update</span>
                  </>
                )}
              </button>
              <button type="button" onClick={() => setSelectedItem(null)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UpdateBook;