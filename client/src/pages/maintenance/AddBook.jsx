import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookPlus, AlertCircle, Check, Loader2, BookOpen, Film } from 'lucide-react';
import { booksApi, moviesApi } from '../../utils/api';
import './styles/Maintenance.css';

const AddBook = () => {
  const navigate = useNavigate();
  const [itemType, setItemType] = useState('book');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const categories = ['Science', 'Economics', 'Fiction', 'Children', 'Personal Development'];

  const [formData, setFormData] = useState({
    name: '',
    author: '',
    category: 'Fiction',
    cost: '',
    procurementDate: today,
    quantity: 1
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.name) {
      setError(`${itemType === 'book' ? 'Book' : 'Movie'} name is required`);
      return false;
    }
    if (!formData.author) {
      setError(`${itemType === 'book' ? 'Author' : 'Director'} is required`);
      return false;
    }
    if (!formData.category) {
      setError('Category is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');

    try {
      const data = {
        ...formData,
        cost: parseFloat(formData.cost) || 0,
        quantity: parseInt(formData.quantity) || 1,
        ...(itemType === 'movie' && { director: formData.author })
      };

      if (itemType === 'book') {
        await booksApi.create(data);
      } else {
        await moviesApi.create(data);
      }

      setSuccess(`${itemType === 'book' ? 'Book' : 'Movie'} added successfully!`);
      setTimeout(() => navigate(itemType === 'book' ? '/reports/books' : '/reports/movies'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to add item');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="maintenance-container">
      <div className="maintenance-header">
        <h1 className="page-title">Add Book / Movie</h1>
        <p className="page-subtitle">Add a new item to the library collection</p>
      </div>

      <div className="maintenance-grid">
        <div className="card">
          <form onSubmit={handleSubmit} className="maintenance-form">
            {/* Type Selection */}
            <div className="type-selection">
              <button
                type="button"
                onClick={() => setItemType('book')}
                className={`type-btn ${itemType === 'book' ? 'type-btn--active' : ''}`}
              >
                <BookOpen size={20} />
                <span>Book</span>
              </button>
              <button
                type="button"
                onClick={() => setItemType('movie')}
                className={`type-btn ${itemType === 'movie' ? 'type-btn--active' : ''}`}
              >
                <Film size={20} />
                <span>Movie</span>
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">{itemType === 'book' ? 'Book' : 'Movie'} Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{itemType === 'book' ? 'Author' : 'Director'} *</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="select-field"
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-row form-row--3">
              <div className="form-group">
                <label className="form-label">Cost (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="0.00"
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
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  min="1"
                  name="quantity"
                  value={formData.quantity}
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
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <BookPlus size={20} />
                    <span>Add {itemType === 'book' ? 'Book' : 'Movie'}</span>
                  </>
                )}
              </button>
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div className="card info-card">
          <h3>Guidelines</h3>
          <ul className="info-list">
            <li className="info-item">
              <Check size={16} />
              <span>Select Book or Movie type</span>
            </li>
            <li className="info-item">
              <Check size={16} />
              <span>All fields marked with * are required</span>
            </li>
            <li className="info-item">
              <Check size={16} />
              <span>Serial number is auto-generated</span>
            </li>
            <li className="info-item">
              <Check size={16} />
              <span>Default quantity is 1</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddBook;