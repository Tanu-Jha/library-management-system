import { useState, useEffect } from 'react';
import { Users, Search, Check, X } from 'lucide-react';
import { membersApi } from '../../utils/api';
import './styles/Reports.css';

const MembersList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const data = await membersApi.getAll();
      setMembers(data);
    } catch (err) {
      console.error('Failed to load members:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
      member.membership_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter ||
      (statusFilter === 'active' && member.is_active) ||
      (statusFilter === 'inactive' && !member.is_active);
    return matchesSearch && matchesStatus;
  });

  const getMembershipLabel = (type) => {
    const labels = {
      '6_months': '6 Months',
      '1_year': '1 Year',
      '2_years': '2 Years'
    };
    return labels[type] || type;
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
          <h1 className="page-title">Master List of Memberships</h1>
          <p className="page-subtitle">View all library members</p>
        </div>
        <div className="stats-badge stats-badge--green">
          <Users size={20} />
          <span className="stats-value">{members.length}</span>
          <span className="stats-label">Total Members</span>
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
              placeholder="Search by name or membership number..."
              className="input-field search-input"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-field"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Membership No</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Membership Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map(member => {
                const isExpired = new Date(member.end_date) < new Date();
                return (
                  <tr key={member.id}>
                    <td className="cell-mono">{member.membership_number}</td>
                    <td className="cell-medium">{member.first_name} {member.last_name}</td>
                    <td style={{ fontSize: '0.875rem' }}>{member.contact_address || '-'}</td>
                    <td>
                      <span className="badge badge--info">
                        {getMembershipLabel(member.membership_type)}
                      </span>
                    </td>
                    <td>{new Date(member.start_date).toLocaleDateString()}</td>
                    <td>
                      <span className={isExpired ? 'cell-danger' : ''}>
                        {new Date(member.end_date).toLocaleDateString()}
                      </span>
                      {isExpired && (
                        <span className="badge badge--danger" style={{ marginLeft: '0.5rem' }}>
                          Expired
                        </span>
                      )}
                    </td>
                    <td>
                      {member.is_active ? (
                        <span className="badge badge--success">
                          <Check size={12} /> Active
                        </span>
                      ) : (
                        <span className="badge badge--danger">
                          <X size={12} /> Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredMembers.length === 0 && (
          <div className="empty-state">No members found</div>
        )}
      </div>
    </div>
  );
};

export default MembersList;