import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookPlus, AlertCircle, Check, Loader2 } from 'lucide-react';
import { booksApi, moviesApi, membersApi, transactionsApi } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './styles/Transactions.css';

const IssueBook = () => {
  const { user, isAdmin } = useAuth(); // Get current user info
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
    itemId: preselectedItem?._id || '',
    memberId: '',
    issueDate: today,
    returnDate: defaultReturnDate,
    remarks: ''
  });

  useEffect(() => {
    loadData();
  }, [itemType]);

  // Auto-select user if they are not admin
  useEffect(() => {
    if (!isAdmin && user?.memberId && members.length > 0) {
      setFormData(prev => ({ ...prev, memberId: user.memberId }));
    }
  }, [members, user, isAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [itemsData, membersData] = await Promise.all([
        itemType === 'book' ? booksApi.getAvailable() : moviesApi.getAvailable(),
        membersApi.getAll({ active: 'true' })
      ]);
      
      setItems(itemsData);

      // Filter members list: Admin sees all, User sees only themselves
      if (isAdmin) {
        setMembers(membersData);
      } else if (user?.memberId) {
        const myProfile = membersData.find(m => m.id === user.memberId || m._id === user.memberId);
        setMembers(myProfile ? [myProfile] : []);
      }
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
        itemId: formData.itemId,
        memberId: formData.memberId,
        issueDate: formData.issueDate,
        returnDate: formData.returnDate,
        remarks: formData.remarks
      });

      setSuccess(`${itemType === 'book' ? 'Book' : 'Movie'} issued successfully!`);

      // Reset form but keep member selected if user
      setFormData({
        itemId: '',
        memberId: isAdmin ? '' : user.memberId,
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

  const selectedItem = items.find(i => i._id === formData.itemId);

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
      <div className="transactions-header">
        <h1 className="page-title">Issue Book / Movie</h1>
        <p className="page-subtitle">Issue a book or movie</p>
      </div>

      <div className="transactions-grid">
        <div className="card">
          <form onSubmit={handleSubmit} className="transaction-form">
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
                  <option key={item._id} value={item._id}>
                    {item.name} - {item.author || item.director}
                  </option>
                ))}
              </select>
            </div>

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

            <div className="form-group">
              <label className="form-label">Select Member *</label>
              <select
                name="memberId"
                value={formData.memberId}
                onChange={handleChange}
                className="select-field"
                required
                disabled={!isAdmin} // Lock for regular users
              >
                <option value="">-- Select Member --</option>
                {members.map(member => (
                  <option key={member._id} value={member._id}>
                    {member.first_name} {member.last_name} ({member.membership_number})
                  </option>
                ))}
              </select>
              {!isAdmin && !user?.memberId && (
                <p style={{color: '#dc2626', fontSize: '0.875rem', marginTop: '0.5rem'}}>
                  Your membership account is not linked. Please contact admin.
                </p>
              )}
            </div>

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
              </div>
            </div>

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
                <span>Return date max 15 days</span>
              </li>
              <li className="info-item">
                <Check size={16} />
                <span>Late returns fine: ₹10.00/day</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueBook;