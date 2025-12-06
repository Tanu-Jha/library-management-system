import { useState, useEffect } from 'react';
import { Users, UserPlus, AlertCircle, Check, Loader2, Search, Edit, Trash2, X } from 'lucide-react';
import { usersApi } from '../../utils/api';
import './styles/Maintenance.css';
import './styles/UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    isAdmin: false,
    isActive: true
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      name: '',
      email: '',
      isAdmin: false,
      isActive: true
    });
    setEditingUser(null);
    setError('');
    setSuccess('');
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      name: user.name,
      email: user.email || '',
      isAdmin: user.isAdmin,
      isActive: user.isActive
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setError('Name is required');
      return;
    }
    if (!editingUser && (!formData.username || !formData.password)) {
      setError('Username and password are required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, formData);
        setSuccess('User updated successfully!');
      } else {
        await usersApi.create(formData);
        setSuccess('User created successfully!');
      }
      loadUsers();
      setTimeout(() => {
        setShowModal(false);
        resetForm();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    try {
      await usersApi.delete(id);
      loadUsers();
    } catch (err) {
      alert(err.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-container" style={{ height: '16rem' }}>
        <div className="spinner" style={{ width: '3rem', height: '3rem', border: '4px solid #c9a227', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
      </div>
    );
  }

  return (
    <div className="maintenance-container">
      <div className="header-with-action">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage system users</p>
        </div>
        <button onClick={openAddModal} className="btn-primary" style={{ flex: 'none' }}>
          <UserPlus size={20} />
          <span>Add User</span>
        </button>
      </div>

      <div className="card">
        <div className="search-container">
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="input-field search-input"
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td className="mono-text">{user.username}</td>
                  <td className="font-medium">{user.name}</td>
                  <td>{user.email || '-'}</td>
                  <td>
                    {user.isAdmin ? (
                      <span className="badge badge--warning">Admin</span>
                    ) : (
                      <span className="badge badge--info">User</span>
                    )}
                  </td>
                  <td>
                    {user.isActive ? (
                      <span className="badge badge--success">Active</span>
                    ) : (
                      <span className="badge badge--danger">Inactive</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => openEditModal(user)} className="action-btn action-btn--edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="action-btn action-btn--delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{editingUser ? 'Edit User' : 'Add New User'}</h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="modal-close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="maintenance-form">
              <div className="form-group">
                <label className="form-label">Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="input-field"
                  disabled={!!editingUser}
                  required={!editingUser}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  {editingUser ? 'New Password (leave empty to keep)' : 'Password *'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  required={!editingUser}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  <span>Active</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isAdmin"
                    checked={formData.isAdmin}
                    onChange={handleChange}
                  />
                  <span>Admin</span>
                </label>
              </div>

              {error && (
                <div className="message message--error" style={{ padding: '0.75rem' }}>
                  <AlertCircle size={18} />
                  <p style={{ fontSize: '0.875rem' }}>{error}</p>
                </div>
              )}

              {success && (
                <div className="message message--success" style={{ padding: '0.75rem' }}>
                  <Check size={18} />
                  <p style={{ fontSize: '0.875rem' }}>{success}</p>
                </div>
              )}

              <div className="btn-group" style={{ paddingTop: '1rem' }}>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? <Loader2 className="spinner" size={20} /> : <span>{editingUser ? 'Update' : 'Create'}</span>}
                </button>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;