import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCog, AlertCircle, Check, Loader2, Search } from 'lucide-react';
import { membersApi } from '../../utils/api';
import './styles/Maintenance.css';
import './styles/UpdateMember.css';

const UpdateMember = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    membershipType: '6_months',
    extendMembership: true,
    cancelMembership: false
  });

  const handleSearch = async () => {
    if (!searchTerm) {
      setError('Please enter a membership number');
      return;
    }

    setLoading(true);
    setError('');
    setMember(null);

    try {
      const data = await membersApi.getById(searchTerm);
      setMember(data);
    } catch (err) {
      setError('Member not found');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'cancelMembership' && checked ? { extendMembership: false } : {}),
      ...(name === 'extendMembership' && checked ? { cancelMembership: false } : {})
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!member) return;

    setSubmitting(true);
    setError('');

    try {
      await membersApi.update(member._id, formData);
      setSuccess(formData.cancelMembership ? 'Membership cancelled!' : 'Membership updated successfully!');
      setTimeout(() => navigate('/reports/members'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to update member');
    } finally {
      setSubmitting(false);
    }
  };

  const membershipOptions = [
    { value: '6_months', label: '6 Months' },
    { value: '1_year', label: '1 Year' },
    { value: '2_years', label: '2 Years' }
  ];

  return (
    <div className="maintenance-container">
      <div className="maintenance-header">
        <h1 className="page-title">Update Membership</h1>
        <p className="page-subtitle">Extend or cancel a membership</p>
      </div>

      <div className="card">
        <div className="search-header">
          <div className="search-wrapper" style={{ flex: 1 }}>
            <Search className="search-icon" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter Membership Number (e.g., MEM-001)"
              className="input-field search-input"
            />
          </div>
          <button onClick={handleSearch} disabled={loading} className="btn-primary" style={{ flex: 'none' }}>
            {loading ? <Loader2 className="spinner" size={20} /> : 'Search'}
          </button>
        </div>

        {error && !member && (
          <div className="message message--error">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}
      </div>

      {member && (
        <div className="details-grid">
          <div className="card">
            <h2 className="section-title">Member Details</h2>
            <div className="member-details">
              <div className="member-detail-row">
                <span className="label">Membership No:</span>
                <span className="value">{member.membership_number}</span>
              </div>
              <div className="member-detail-row">
                <span className="label">Name:</span>
                <span>{member.first_name} {member.last_name}</span>
              </div>
              <div className="member-detail-row">
                <span className="label">Start Date:</span>
                <span>{new Date(member.start_date).toLocaleDateString()}</span>
              </div>
              <div className="member-detail-row">
                <span className="label">End Date:</span>
                <span>{new Date(member.end_date).toLocaleDateString()}</span>
              </div>
              <div className="member-detail-row">
                <span className="label">Status:</span>
                {member.is_active ? (
                  <span className="badge badge--success">Active</span>
                ) : (
                  <span className="badge badge--danger">Inactive</span>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="section-title">Update Options</h2>
            <form onSubmit={handleSubmit} className="maintenance-form">
              <label className="update-option">
                <input
                  type="radio"
                  name="action"
                  checked={formData.extendMembership}
                  onChange={() => setFormData(prev => ({ ...prev, extendMembership: true, cancelMembership: false }))}
                />
                <div className="update-option-content">
                  <h4>Extend Membership</h4>
                  <p>Add more time to current membership</p>
                </div>
              </label>

              {formData.extendMembership && (
                <div className="membership-options">
                  {membershipOptions.map(option => (
                    <label key={option.value} className="radio-label">
                      <input
                        type="radio"
                        name="membershipType"
                        value={option.value}
                        checked={formData.membershipType === option.value}
                        onChange={handleChange}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              )}

              <label className="update-option update-option--danger">
                <input
                  type="radio"
                  name="action"
                  checked={formData.cancelMembership}
                  onChange={() => setFormData(prev => ({ ...prev, cancelMembership: true, extendMembership: false }))}
                />
                <div className="update-option-content">
                  <h4>Cancel Membership</h4>
                  <p>Deactivate this membership</p>
                </div>
              </label>

              {error && member && (
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

              <button
                type="submit"
                disabled={submitting}
                className={`btn-primary ${formData.cancelMembership ? 'btn-danger' : ''}`}
                style={{ width: '100%' }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="spinner" size={20} />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <UserCog size={20} />
                    <span>{formData.cancelMembership ? 'Cancel Membership' : 'Update Membership'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateMember;