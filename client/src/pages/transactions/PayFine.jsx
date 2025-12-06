import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DollarSign, AlertCircle, Check, Loader2, ArrowLeft } from 'lucide-react';
import { transactionsApi } from '../../utils/api';
import './styles/Transactions.css';
import './styles/PayFine.css';

const PayFine = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const transactionFromState = location.state?.transaction;
  const fineFromState = location.state?.fine;

  const [transaction, setTransaction] = useState(transactionFromState || null);
  const [fine, setFine] = useState(fineFromState || null);
  const [finePaid, setFinePaid] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!transaction) {
      navigate('/transactions/return');
    }
  }, [transaction, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (fine && fine.fine_amount > 0 && !finePaid) {
      setError('Fine must be paid before completing the return');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await transactionsApi.payFine({
        transactionId: transaction.id,
        finePaid: finePaid || fine?.fine_amount === 0,
        remarks
      });

      setSuccess('Return completed successfully!');

      setTimeout(() => {
        navigate('/reports/active-issues');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to complete return');
    } finally {
      setSubmitting(false);
    }
  };

  if (!transaction) {
    return null;
  }

  const fineAmount = fine?.fine_amount || 0;
  const hasFine = fineAmount > 0;

  return (
    <div className="transactions-container">
      <div className="back-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="page-title">Pay Fine</h1>
          <p className="page-subtitle">Complete the return transaction</p>
        </div>
      </div>

      <div className="details-grid">
        {/* Transaction Details */}
        <div className="card">
          <h2 className="section-title">Transaction Details</h2>

          <div className="transaction-form">
            <div className="detail-row">
              <div className="form-group">
                <label className="form-label">Book/Movie Name</label>
                <input
                  type="text"
                  value={transaction.item_name}
                  className="input-field"
                  disabled
                />
              </div>
              <div className="form-group">
                <label className="form-label">Author/Director</label>
                <input
                  type="text"
                  value={transaction.item_author}
                  className="input-field"
                  disabled
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Serial Number</label>
              <input
                type="text"
                value={transaction.item_serial}
                className="input-field"
                disabled
              />
            </div>

            <div className="detail-row">
              <div className="form-group">
                <label className="form-label">Issue Date</label>
                <input
                  type="text"
                  value={new Date(transaction.issue_date).toLocaleDateString()}
                  className="input-field"
                  disabled
                />
              </div>
              <div className="form-group">
                <label className="form-label">Expected Return Date</label>
                <input
                  type="text"
                  value={new Date(transaction.expected_return_date).toLocaleDateString()}
                  className="input-field"
                  disabled
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Actual Return Date</label>
              <input
                type="text"
                value={new Date(transaction.actual_return_date || new Date()).toLocaleDateString()}
                className="input-field"
                disabled
              />
            </div>
          </div>
        </div>

        {/* Fine Payment */}
        <div className="card">
          <h2 className="section-title">Fine Payment</h2>

          <form onSubmit={handleSubmit} className="transaction-form">
            {/* Fine Amount Display */}
            <div className={`fine-display ${hasFine ? 'fine-display--has-fine' : 'fine-display--no-fine'}`}>
              <div>
                <p className={`fine-label ${hasFine ? 'fine-label--has-fine' : 'fine-label--no-fine'}`}>
                  {hasFine ? 'Fine Amount Due' : 'No Fine Due'}
                </p>
                <p className={`fine-amount ${hasFine ? 'fine-amount--has-fine' : 'fine-amount--no-fine'}`}>
                  ${fineAmount.toFixed(2)}
                </p>
              </div>
              <div className={`fine-icon ${hasFine ? 'fine-icon--has-fine' : 'fine-icon--no-fine'}`}>
                <DollarSign size={32} />
              </div>
            </div>
            {hasFine && (
              <p className="fine-note">Fine calculated at $1.00 per day overdue</p>
            )}

            {/* Fine Paid Checkbox */}
            {hasFine && (
              <div className="fine-checkbox-wrapper">
                <input
                  type="checkbox"
                  id="finePaid"
                  checked={finePaid}
                  onChange={(e) => setFinePaid(e.target.checked)}
                  className="fine-checkbox"
                />
                <label htmlFor="finePaid" className="fine-checkbox-label">
                  Fine has been paid
                </label>
              </div>
            )}

            {/* Remarks */}
            <div className="form-group">
              <label className="form-label">Remarks (Optional)</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
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
              <button
                type="submit"
                disabled={submitting || (hasFine && !finePaid)}
                className="btn-primary"
              >
                {submitting ? (
                  <>
                    <Loader2 className="spinner" size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    <span>Complete Return</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/transactions/return')}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PayFine;