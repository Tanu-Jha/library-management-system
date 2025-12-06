import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, AlertCircle, Search, Loader2 } from 'lucide-react';
import { transactionsApi } from '../../utils/api';
import './styles/Transactions.css';

const ReturnBook = () => {
  const navigate = useNavigate();
  const [activeIssues, setActiveIssues] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    transactionId: '',
    returnDate: today,
    remarks: ''
  });

  useEffect(() => {
    loadActiveIssues();
  }, []);

  const loadActiveIssues = async () => {
    try {
      const data = await transactionsApi.getActive();
      setActiveIssues(data);
    } catch (err) {
      setError('Failed to load active issues');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setFormData(prev => ({
      ...prev,
      transactionId: transaction.id
    }));
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!selectedTransaction) {
      setError('Please select a transaction to return');
      return false;
    }
    if (!formData.returnDate) {
      setError('Return date is required');
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
      const result = await transactionsApi.return({
        transactionId: selectedTransaction.id,
        actualReturnDate: formData.returnDate,
        remarks: formData.remarks
      });

      navigate('/transactions/pay-fine', {
        state: {
          transaction: { ...selectedTransaction, actual_return_date: formData.returnDate },
          fine: result.fine
        }
      });
    } catch (err) {
      setError(err.message || 'Failed to process return');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredIssues = activeIssues.filter(issue =>
    issue.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.member_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.item_serial?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="page-title">Return Book / Movie</h1>
        <p className="page-subtitle">Process the return of issued items</p>
      </div>

      <div className="transactions-grid">
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Active Issues</h2>
            <div className="search-wrapper" style={{ maxWidth: '16rem' }}>
              <Search className="search-icon" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="input-field search-input"
              />
            </div>
          </div>

          {filteredIssues.length === 0 ? (
            <div className="empty-state">
              <p>No active issues found</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Serial No</th>
                    <th>Member</th>
                    <th>Due Date</th>
                    <th>Select</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues.map((issue) => {
                    const isOverdue = new Date(issue.expected_return_date) < new Date();
                    return (
                      <tr
                        key={issue.id}
                        className={selectedTransaction?.id === issue.id ? 'row--selected' : ''}
                        onClick={() => handleSelectTransaction(issue)}
                      >
                        <td>
                          <p className="cell-medium">{issue.item_name}</p>
                          <p className="cell-subtitle">{issue.item_author}</p>
                        </td>
                        <td className="cell-mono">{issue.item_serial}</td>
                        <td>{issue.member_name}</td>
                        <td>
                          <span className={isOverdue ? 'cell-danger' : ''}>
                            {new Date(issue.expected_return_date).toLocaleDateString()}
                          </span>
                          {isOverdue && (
                            <span className="badge badge--danger" style={{ marginLeft: '0.5rem' }}>
                              Overdue
                            </span>
                          )}
                        </td>
                        <td>
                          <input
                            type="radio"
                            name="selectedIssue"
                            checked={selectedTransaction?.id === issue.id}
                            onChange={() => handleSelectTransaction(issue)}
                            className="radio-input"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="section-title">Return Details</h2>

          {selectedTransaction ? (
            <form onSubmit={handleSubmit} className="transaction-form">
              <div className="form-group">
                <label className="form-label">Book/Movie Name</label>
                <input
                  type="text"
                  value={selectedTransaction.item_name}
                  className="input-field"
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Serial Number</label>
                <input
                  type="text"
                  value={selectedTransaction.item_serial}
                  className="input-field"
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Issue Date</label>
                <input
                  type="text"
                  value={new Date(selectedTransaction.issue_date).toLocaleDateString()}
                  className="input-field"
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Actual Return Date *</label>
                <input
                  type="date"
                  name="returnDate"
                  value={formData.returnDate}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Remarks (Optional)</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  rows={3}
                  className="input-field textarea-field"
                />
              </div>

              {error && (
                <div className="message message--error">
                  <AlertCircle size={20} />
                  <p style={{ fontSize: '0.875rem' }}>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{ width: '100%' }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="spinner" size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw size={20} />
                    <span>Confirm Return</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="empty-state">
              <p>Select an issue from the list to process return</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReturnBook;