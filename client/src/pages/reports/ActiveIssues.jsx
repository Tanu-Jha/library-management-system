import { useState, useEffect } from 'react';
import { ClipboardList, Search, BookOpen, Film } from 'lucide-react';
import { transactionsApi } from '../../utils/api';
import './styles/Reports.css';

const ActiveIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    try {
      const data = await transactionsApi.getActive();
      setIssues(data);
    } catch (err) {
      console.error('Failed to load issues:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues = issues.filter(issue =>
    issue.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.member_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.item_serial?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="page-title">Active Issues</h1>
          <p className="page-subtitle">Currently issued books and movies</p>
        </div>
        <div className="stats-badge stats-badge--amber">
          <ClipboardList size={20} />
          <span className="stats-value">{issues.length}</span>
          <span className="stats-label">Active Issues</span>
        </div>
      </div>

      <div className="card">
        <div className="filter-section">
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by item, member, or serial..."
              className="input-field search-input"
              style={{ maxWidth: '20rem' }}
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Item Name</th>
                <th>Serial No</th>
                <th>Member</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.map(issue => {
                const isOverdue = new Date(issue.expected_return_date) < new Date();
                return (
                  <tr key={issue.id}>
                    <td>
                      {issue.item_type === 'book' ? (
                        <BookOpen style={{ color: '#3b82f6' }} size={18} />
                      ) : (
                        <Film style={{ color: '#8b5cf6' }} size={18} />
                      )}
                    </td>
                    <td>
                      <p className="cell-medium">{issue.item_name}</p>
                      <p className="cell-subtitle">{issue.item_author}</p>
                    </td>
                    <td className="cell-mono">{issue.item_serial}</td>
                    <td>{issue.member_name}</td>
                    <td>{new Date(issue.issue_date).toLocaleDateString()}</td>
                    <td className={isOverdue ? 'cell-danger' : ''}>
                      {new Date(issue.expected_return_date).toLocaleDateString()}
                    </td>
                    <td>
                      {isOverdue ? (
                        <span className="badge badge--danger">Overdue</span>
                      ) : (
                        <span className="badge badge--success">On Time</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredIssues.length === 0 && (
          <div className="empty-state">No active issues found</div>
        )}
      </div>
    </div>
  );
};

export default ActiveIssues;