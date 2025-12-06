import { useState, useEffect } from 'react';
import { Clock, Search, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { issueRequestsApi } from '../../utils/api';
import './styles/Reports.css';

const IssueRequests = () => {
  const { isAdmin } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await issueRequestsApi.getAll();
      setRequests(data);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await issueRequestsApi.updateStatus(id, status);
      loadRequests();
    } catch (err) {
      console.error('Failed to update request:', err);
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.member_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    const badges = {
      'pending': 'badge--warning',
      'approved': 'badge--success',
      'rejected': 'badge--danger'
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
          <h1 className="page-title">Issue Requests</h1>
          <p className="page-subtitle">Pending requests for book/movie issues</p>
        </div>
        <div className="stats-badge stats-badge--amber">
          <Clock size={20} />
          <span className="stats-value">{requests.filter(r => r.status === 'pending').length}</span>
          <span className="stats-label">Pending</span>
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
              placeholder="Search..."
              className="input-field search-input"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-field"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="empty-state">No requests found</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Serial No</th>
                  <th>Member</th>
                  <th>Request Date</th>
                  <th>Status</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(req => (
                  <tr key={req.id}>
                    <td>
                      <p className="cell-medium">{req.item_name}</p>
                      <p className="cell-subtitle">{req.item_type}</p>
                    </td>
                    <td className="cell-mono">{req.item_serial}</td>
                    <td>{req.member_name}</td>
                    <td>{new Date(req.request_date).toLocaleDateString()}</td>
                    <td>
                      <span
                        className={`badge ${getStatusBadgeClass(req.status)}`}
                        style={{ textTransform: 'capitalize' }}
                      >
                        {req.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td>
                        {req.status === 'pending' && (
                          <div className="action-buttons">
                            <button
                              onClick={() => handleUpdateStatus(req.id, 'approved')}
                              className="action-btn action-btn--success"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(req.id, 'rejected')}
                              className="action-btn action-btn--danger"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
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

export default IssueRequests;