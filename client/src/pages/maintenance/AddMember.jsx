import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle, Check, Loader2 } from 'lucide-react';
import { membersApi } from '../../utils/api';
import './styles/Maintenance.css';

const AddMember = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    contactName: '',
    contactAddress: '',
    aadharNumber: '',
    startDate: today,
    membershipType: '6_months'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName) {
      setError('First name and last name are required');
      return false;
    }
    if (!formData.startDate) {
      setError('Start date is required');
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
      await membersApi.create(formData);
      setSuccess('Member added successfully!');
      setTimeout(() => navigate('/reports/members'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to add member');
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
        <h1 className="page-title">Add Membership</h1>
        <p className="page-subtitle">Register a new library member</p>
      </div>

      <div className="maintenance-grid">
        <div className="card">
          <form onSubmit={handleSubmit} className="maintenance-form">
            <div className="form-row form-row--2">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Name</label>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                className="input-field"
                placeholder="Same as member name if left empty"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Address</label>
              <textarea
                name="contactAddress"
                value={formData.contactAddress}
                onChange={handleChange}
                rows={2}
                className="input-field textarea-field"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Aadhar Card Number</label>
              <input
                type="text"
                name="aadharNumber"
                value={formData.aadharNumber}
                onChange={handleChange}
                className="input-field"
                placeholder="XXXX-XXXX-XXXX"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Membership Duration *</label>
              <div className="radio-group">
                {membershipOptions.map(option => (
                  <label
                    key={option.value}
                    className={`radio-label ${formData.membershipType === option.value ? 'radio-label--selected' : ''}`}
                  >
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
                    <UserPlus size={20} />
                    <span>Add Member</span>
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
          <h3>Membership Info</h3>
          <ul className="info-list">
            <li className="info-item">
              <Check size={16} />
              <span>All fields marked with * are required</span>
            </li>
            <li className="info-item">
              <Check size={16} />
              <span>End date is auto-calculated based on membership type</span>
            </li>
            <li className="info-item">
              <Check size={16} />
              <span>Default membership is 6 months</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddMember;