import { useState, useEffect } from 'react';
import { AlertCircle, Search } from 'lucide-react';
import { transactionsApi } from '../../utils/api';
import './styles/Reports.css';

const OverdueReturns = () => {
  const [overdueItems, setOverdueItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadOverdue();
  }, []);

  const loadOverdue = async () => {
    try {
      const data = await transactionsApi.getOverdue();
      setOverdueItems(data);
    } catch (err) {
      console.error('Failed to load overdue items:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = overdueItems.filter(item =>
    item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.member_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateFine = (daysOverdue) => (daysOverdue * 1.00).toFixed(2);

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
          <h1 className="page-title">Overdue Returns</h1>
          <p className="page-subtitle">Items past their return date</p>
        </div>
        <div className="stats-badge stats-badge--red">
          <AlertCircle size={20} />
          <span className="stats-value">{overdueItems.length}</span>
          <span className="stats-label">Overdue Items</span>
        </div>
      </div>

      <div className="card">
        <div className="filter-section">
          <div className="search-wrapper" style={{ maxWidth: '20rem' }}>
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

        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={48} style={{ color: '#22c55e' }} />
            <p>No overdue items! Great job!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Serial No</th>
                  <th>Member</th>
                  <th>Due Date</th>
                  <th>Days Overdue</th>
                  <th>Estimated Fine</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id} className="row--danger">
                    <td>
                      <p className="cell-medium">{item.item_name}</p>
                      <p className="cell-subtitle">{item.item_author}</p>
                    </td>
                    <td className="cell-mono">{item.item_serial}</td>
                    <td>{item.member_name}</td>
                    <td className="cell-danger">
                      {new Date(item.expected_return_date).toLocaleDateString()}
                    </td>
                    <td>
                      <span className="badge badge--danger">
                        {Math.ceil(item.days_overdue)} days
                      </span>
                    </td>
                    <td className="cell-danger" style={{ fontWeight: 500 }}>
                      ${calculateFine(Math.ceil(item.days_overdue))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverdueReturns;