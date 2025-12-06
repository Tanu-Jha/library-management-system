import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, Users, Film, ClipboardList, AlertCircle, 
  ArrowRight, Calendar, Clock
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
    overdueReturns: 0,
    myBooksCount: 0,
    myMoviesCount: 0,
    myBooksList: [],
    myMoviesList: []
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user, isAdmin]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Basic Data (Visible to Everyone)
      const [books, movies] = await Promise.all([
        booksApi.getAll(),
        moviesApi.getAll()
      ]);

      const newStats = {
        totalBooks: books.length,
        totalMovies: movies.length,
        totalMembers: 0,
        activeIssues: 0,
        overdueReturns: 0,
        myBooksCount: 0,
        myMoviesCount: 0,
        myBooksList: [],
        myMoviesList: []
      };

      // 2. Fetch Admin Data (If Admin)
      if (isAdmin) {
        const [members, activeIssues, overdueIssues] = await Promise.all([
          membersApi.getAll(),
          transactionsApi.getActive(),
          transactionsApi.getOverdue()
        ]);

        newStats.totalMembers = members.length;
        newStats.activeIssues = activeIssues.length;
        newStats.overdueReturns = overdueIssues.length;
        setRecentActivity(activeIssues.slice(0, 5));
      } 
      // 3. Fetch User Data (If Regular User has a Member ID)
      else if (user?.memberId) {
        const [myIssued, myOverdue] = await Promise.all([
          transactionsApi.getAll({ memberId: user.memberId, status: 'issued' }),
          transactionsApi.getAll({ memberId: user.memberId, status: 'overdue' })
        ]);

        const allMyItems = [...myIssued, ...myOverdue];
        
        newStats.myBooksList = allMyItems.filter(t => t.item_type === 'book');
        newStats.myMoviesList = allMyItems.filter(t => t.item_type === 'movie');
        newStats.myBooksCount = newStats.myBooksList.length;
        newStats.myMoviesCount = newStats.myMoviesList.length;
      }

      setStats(newStats);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- STAT CARDS CONFIGURATION ---
  
  // Admin sees system-wide stats
  const adminCards = [
    { icon: BookOpen, label: 'Total Books', value: stats.totalBooks, colorClass: 'stat-icon--blue', link: '/reports/books' },
    { icon: Film, label: 'Total Movies', value: stats.totalMovies, colorClass: 'stat-icon--purple', link: '/reports/movies' },
    { icon: Users, label: 'Total Members', value: stats.totalMembers, colorClass: 'stat-icon--green', link: '/reports/members' },
    { icon: ClipboardList, label: 'Active Issues', value: stats.activeIssues, colorClass: 'stat-icon--amber', link: '/reports/active-issues' },
    { icon: AlertCircle, label: 'Overdue Returns', value: stats.overdueReturns, colorClass: 'stat-icon--red', link: '/reports/overdue' },
  ];

  // Users see THEIR stats + Library totals
  const userCards = [
    { icon: BookOpen, label: 'My Books', value: stats.myBooksCount, colorClass: 'stat-icon--blue', link: '/transactions/return' },
    { icon: Film, label: 'My Movies', value: stats.myMoviesCount, colorClass: 'stat-icon--purple', link: '/transactions/return' },
    { icon: BookOpen, label: 'Library Books', value: stats.totalBooks, colorClass: 'stat-icon--green', link: '/transactions/availability' },
    { icon: Film, label: 'Library Movies', value: stats.totalMovies, colorClass: 'stat-icon--amber', link: '/transactions/availability' },
  ];

  const statCards = isAdmin ? adminCards : userCards;

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

  // --- PENDING VIEW ---
  if (!isAdmin && user?.membershipStatus === 'pending') {
    return (
      <div className="dashboard-container">
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ 
            width: '5rem', height: '5rem', 
            background: 'rgba(245, 158, 11, 0.1)', 
            borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <Clock size={40} color="#f59e0b" />
          </div>
          <h1 className="page-title">Membership Under Consideration</h1>
          <p className="page-subtitle" style={{ maxWidth: '30rem', margin: '0 auto' }}>
            Thank you for registering! Your account is currently pending administrative approval. 
            Once approved, you will receive your Membership ID and full access to the library collection.
          </p>
        </div>
      </div>
    );
  }

  // --- MAIN DASHBOARD VIEW ---
  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">{isAdmin ? 'Admin Dashboard' : 'My Collection'}</h1>
          <p className="page-subtitle">Welcome back, {user?.name}!</p>
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
      <div className="stats-grid" style={{ gridTemplateColumns: isAdmin ? undefined : 'repeat(4, 1fr)' }}>
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
              <span>
                {isAdmin 
                  ? 'View Details' 
                  : (label.includes('Library') ? 'View All Items' : 'View My Items')
                }
              </span>
              <ArrowRight size={16} />
            </div>
          </Link>
        ))}
      </div>

      {/* USER VIEW: My Books & Movies List */}
      {!isAdmin && (
        <div className="main-grid" style={{ marginTop: '1.5rem', gridTemplateColumns: '1fr' }}>
          <div className="card">
            <h2 className="section-title">My Issued Items</h2>
            {stats.myBooksList.length === 0 && stats.myMoviesList.length === 0 ? (
              <div className="activity-empty">
                You have no books or movies currently issued.
              </div>
            ) : (
              <div className="activity-list">
                {[...stats.myBooksList, ...stats.myMoviesList].map((item) => (
                  <div key={item.id} className="activity-item">
                    <div className={`activity-icon ${item.item_type === 'book' ? 'stat-icon--blue' : 'stat-icon--purple'}`}>
                      {item.item_type === 'book' ? <BookOpen size={18} color="white" /> : <Film size={18} color="white" />}
                    </div>
                    <div className="activity-details">
                      <p className="activity-name">{item.item_name}</p>
                      <p className="activity-member">{item.item_author}</p>
                      <p className="activity-due" style={{ color: new Date(item.expected_return_date) < new Date() ? '#dc2626' : undefined }}>
                        Due: {new Date(item.expected_return_date).toLocaleDateString()} 
                        {new Date(item.expected_return_date) < new Date() && ' (Overdue)'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADMIN VIEW: Recent Activity */}
      {isAdmin && (
        <div className="main-grid" style={{ marginTop: '1.5rem' }}>
          <div className="card">
            <div className="activity-header">
              <h2 className="section-title">Recent Library Activity</h2>
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
      )}
    </div>
  );
};

export default Dashboard;