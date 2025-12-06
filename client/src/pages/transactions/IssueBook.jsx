import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookPlus, AlertCircle, Check, Loader2 } from 'lucide-react';
import { booksApi, moviesApi, membersApi, transactionsApi } from '../../utils/api';
import './styles/Transactions.css';

const IssueBook = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const preselectedItem = location.state?.item;
  const preselectedType = location.state?.itemType || 'book';

  const [itemType, setItemType] = useState(preselectedType);
  const [items, setItems] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const maxReturnDate = new Date();
  maxReturnDate.setDate(maxReturnDate.getDate() + 15);
  const defaultReturnDate = maxReturnDate.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    itemId: preselectedItem?.id || '',
    memberId: '',
    issueDate: today,
    returnDate: defaultReturnDate,
    remarks: ''
  });

  useEffect(() => {
    loadData();
  }, [itemType]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [itemsData, membersData] = await Promise.all([
        itemType === 'book' ? booksApi.getAvailable() : moviesApi.getAvailable(),
        membersApi.getAll({ active: 'true' })
      ]);
      setItems(itemsData);
      setMembers(membersData);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!formData.itemId) {
      setError(`Please select a ${itemType}`);
      return false;
    }
    if (!formData.memberId) {
      setError('Please select a member');
      return false;
    }
    if (!formData.issueDate) {
      setError('Issue date is required');
      return false;
    }
    if (formData.issueDate < today) {
      setError('Issue date cannot be in the past');
      return false;
    }
    if (!formData.returnDate) {
      setError('Return date is required');
      return false;
    }
    if (formData.returnDate > defaultReturnDate) {
      setError('Return date cannot be more than 15 days from issue date');
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
      await transactionsApi.issue({
        itemType,
        itemId: parseInt(formData.itemId),
        memberId: parseInt(formData.memberId),
        issueDate: formData.issueDate,
        returnDate: formData.returnDate,
        remarks: formData.remarks
      });

      setSuccess(`${itemType === 'book' ? 'Book' : 'Movie'} issued successfully!`);

      setFormData({
        itemId: '',
        memberId: '',
        issueDate: today,
        returnDate: defaultReturnDate,
        remarks: ''
      });

      loadData();

      setTimeout(() => {
        navigate('/reports/active-issues');
      }, 2000);

    } catch (err) {
      setError(err.message || 'Failed to issue item');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedItem = items.find(i => i.id === parseInt(formData.itemId));

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner"></div>
          <p className="loading-text">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transactions-container">
      {/* Header */}
      <div className="transactions-header">
        <h1 className="page-title">Issue Book / Movie</h1>
        <p className="page-subtitle">Issue a book or movie to a library member</p>
      </div>

      <div className="transactions-grid">
        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="transaction-form">
            {/* Type Selection */}
            <div className="type-selection">
              <button
                type="button"
                onClick={() => { setItemType('book'); setFormData(prev => ({ ...prev, itemId: '' })); }}
                className={`type-btn ${itemType === 'book' ? 'type-btn--active' : ''}`}
              >
                Book
              </button>
              <button
                type="button"
                onClick={() => { setItemType('movie'); setFormData(prev => ({ ...prev, itemId: '' })); }}
                className={`type-btn ${itemType === 'movie' ? 'type-btn--active' : ''}`}
              >
                Movie
              </button>
            </div>

            {/* Item Selection */}
            <div className="form-group">
              <label className="form-label">
                Select {itemType === 'book' ? 'Book' : 'Movie'} *
              </label>
              <select
                name="itemId"
                value={formData.itemId}
                onChange={handleChange}
                className="select-field"
                required
              >
                <option value="">-- Select {itemType === 'book' ? 'Book' : 'Movie'} --</option>
                {items.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} - {item.author || item.director}
                  </option>
                ))}
              </select>
            </div>

            {/* Author (auto-populated) */}
            <div className="form-group">
              <label className="form-label">
                {itemType === 'book' ? 'Author' : 'Director'}
              </label>
              <input
                type="text"
                value={selectedItem?.author || selectedItem?.director || ''}
                className="input-field"
                disabled
                placeholder="Auto-populated"
              />
            </div>

            {/* Member Selection */}
            <div className="form-group">
              <label className="form-label">Select Member *</label>
              <select
                name="memberId"
                value={formData.memberId}
                onChange={handleChange}
                className="select-field"
                required
              >
                <option value="">-- Select Member --</option>
                {members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.first_name} {member.last_name} ({member.membership_number})
                  </option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div className="form-row form-row--2">
              <div className="form-group">
                <label className="form-label">Issue Date *</label>
                <input
                  type="date"
                  name="issueDate"
                  value={formData.issueDate}
                  onChange={handleChange}
                  min={today}
                  className="input-field"
                  required
                />
                <p className="form-hint">Cannot be earlier than today</p>
              </div>
              <div className="form-group">
                <label className="form-label">Return Date *</label>
                <input
                  type="date"
                  name="returnDate"
                  value={formData.returnDate}
                  onChange={handleChange}
                  max={defaultReturnDate}
                  className="input-field"
                  required
                />
                <p className="form-hint">Maximum 15 days from issue date</p>
              </div>
            </div>

            {/* Remarks */}
            <div className="form-group">
              <label className="form-label">Remarks (Optional)</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={3}
                className="input-field textarea-field"
                placeholder="Any additional notes..."
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="message message--error">
                <AlertCircle size={20} />
                <p>{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="message message--success">
                <Check size={20} />
                <p>{success}</p>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="btn-group">
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? (
                  <>
                    <Loader2 className="spinner" size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <BookPlus size={20} />
                    <span>Confirm Issue</span>
                  </>
                )}
              </button>
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Info Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card info-card">
            <h3>Issue Guidelines</h3>
            <ul className="info-list">
              <li className="info-item">
                <Check size={16} />
                <span>Issue date cannot be earlier than today</span>
              </li>
              <li className="info-item">
                <Check size={16} />
                <span>Return date is auto-set to 15 days ahead</span>
              </li>
              <li className="info-item">
                <Check size={16} />
                <span>Return date can be set earlier but not later than 15 days</span>
              </li>
              <li className="info-item">
                <Check size={16} />
                <span>Late returns incur a fine of $1 per day</span>
              </li>
            </ul>
          </div>

          {selectedItem && (
            <div className="card selected-item-card">
              <h3>Selected Item</h3>
              <div className="selected-item-details">
                <p><span className="label">Name:</span> {selectedItem.name}</p>
                <p><span className="label">{itemType === 'book' ? 'Author' : 'Director'}:</span> {selectedItem.author || selectedItem.director}</p>
                <p><span className="label">Serial:</span> {selectedItem.serial_number}</p>
                <p><span className="label">Category:</span> {selectedItem.category}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueBook;