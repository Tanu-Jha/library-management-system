import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, Users, Film, ClipboardList, AlertCircle, 
  TrendingUp, ArrowRight, Calendar
} from 'lucide-react';
import { booksApi, moviesApi, membersApi, transactionsApi } from '../utils/api';
import './styles/Dashboard.css';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalMovies: 0,
    totalMembers: 0,
    activeIssues: 0,
    overdueReturns: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [books, movies, members, activeIssues, overdueIssues] = await Promise.all([
        booksApi.getAll(),
        moviesApi.getAll(),
        membersApi.getAll(),
        transactionsApi.getActive(),
        transactionsApi.getOverdue()
      ]);

      setStats({
        totalBooks: books.length,
        totalMovies: movies.length,
        totalMembers: members.length,
        activeIssues: activeIssues.length,
        overdueReturns: overdueIssues.length
      });

      setRecentActivity(activeIssues.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { code: 'SC', name: 'Science', fromCode: 'SC(B/M)000001', toCode: 'SC(B/M)000004' },
    { code: 'EC', name: 'Economics', fromCode: 'EC(B/M)000001', toCode: 'EC(B/M)000004' },
    { code: 'FC', name: 'Fiction', fromCode: 'FC(B/M)000001', toCode: 'FC(B/M)000004' },
    { code: 'CH', name: 'Children', fromCode: 'CH(B/M)000001', toCode: 'CH(B/M)000004' },
    { code: 'PD', name: 'Personal Development', fromCode: 'PD(B/M)000001', toCode: 'PD(B/M)000004' },
  ];

  const statCards = [
    { icon: BookOpen, label: 'Total Books', value: stats.totalBooks, colorClass: 'stat-icon--blue', link: '/reports/books' },
    { icon: Film, label: 'Total Movies', value: stats.totalMovies, colorClass: 'stat-icon--purple', link: '/reports/movies' },
    { icon: Users, label: 'Total Members', value: stats.totalMembers, colorClass: 'stat-icon--green', link: '/reports/members' },
    { icon: ClipboardList, label: 'Active Issues', value: stats.activeIssues, colorClass: 'stat-icon--amber', link: '/reports/active-issues' },
    { icon: AlertCircle, label: 'Overdue Returns', value: stats.overdueReturns, colorClass: 'stat-icon--red', link: '/reports/overdue' },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">
            {isAdmin ? 'Admin Dashboard' : 'Welcome Back'}
          </h1>
          <p className="page-subtitle">
            Hello, {user?.name}! Here's your library overview.
          </p>
        </div>
        <div className="dashboard-date">
          <Calendar size={18} />
          <span>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map(({ icon: Icon, label, value, colorClass, link }) => (
          <Link key={label} to={link} className="stat-card">
            <div className="stat-card-content">
              <div className={`stat-icon ${colorClass}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="stat-value">{value}</p>
                <p className="stat-label">{label}</p>
              </div>
            </div>
            <div className="stat-link">
              <span>View Details</span>
              <ArrowRight size={16} />
            </div>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="main-grid">
        {/* Product Categories */}
        <div className="card categories-card">
          <h2 className="section-title">Product Categories</h2>
          <div className="categories-table">
            <table>
              <thead>
                <tr>
                  <th>Code No From</th>
                  <th>Code No To</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.code}>
                    <td className="code-cell">{cat.fromCode}</td>
                    <td className="code-cell">{cat.toCode}</td>
                    <td>
                      <span className="badge badge--info">{cat.name}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="activity-header">
            <h2 className="section-title">Recent Issues</h2>
            <Link to="/reports/active-issues" className="activity-link">
              View All
            </Link>
          </div>
          
          {recentActivity.length === 0 ? (
            <p className="activity-empty">No recent activity</p>
          ) : (
            <div className="activity-list">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    {activity.item_type === 'book' ? (
                      <BookOpen size={18} />
                    ) : (
                      <Film size={18} />
                    )}
                  </div>
                  <div className="activity-details">
                    <p className="activity-name">{activity.item_name}</p>
                    <p className="activity-member">{activity.member_name}</p>
                    <p className="activity-due">
                      Due: {new Date(activity.expected_return_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions">
          <Link to="/transactions/availability" className="btn-secondary">
            Check Availability
          </Link>
          <Link to="/transactions/issue" className="btn-secondary">
            Issue Book
          </Link>
          <Link to="/transactions/return" className="btn-secondary">
            Return Book
          </Link>
          {isAdmin && (
            <Link to="/maintenance/items/add" className="btn-primary">
              Add New Item
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;