import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Signup from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import BookAvailability from './pages/transactions/BookAvailability';
import IssueBook from './pages/transactions/IssueBook';
import ReturnBook from './pages/transactions/ReturnBook';
import PayFine from './pages/transactions/PayFine';
import BooksList from './pages/reports/BooksList';
import MoviesList from './pages/reports/MoviesList';
import MembersList from './pages/reports/MembersList';
import ActiveIssues from './pages/reports/ActiveIssues';
import OverdueReturns from './pages/reports/OverdueReturns';
import IssueRequests from './pages/reports/IssueRequests';
import AddMember from './pages/maintenance/AddMember';
import UpdateMember from './pages/maintenance/UpdateMember';
import AddBook from './pages/maintenance/AddBook';
import UpdateBook from './pages/maintenance/UpdateBook';
import UserManagement from './pages/maintenance/UserManagement';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-library-paper">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-library-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-library-dark/60 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is pending, prevent access to any page except Dashboard
  if (!isAdmin && user?.membershipStatus === 'pending' && location.pathname !== '/dashboard') {
    return <Navigate to="/dashboard" replace />;
  }
  // --------------------------

  return children;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-library-paper">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-library-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-library-dark/60 font-medium">Loading Library System...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Transactions */}
        <Route path="transactions/availability" element={<BookAvailability />} />
        <Route path="transactions/issue" element={<IssueBook />} />
        <Route path="transactions/return" element={<ReturnBook />} />
        <Route path="transactions/pay-fine" element={<PayFine />} />
        
        {/* Reports */}
        <Route path="reports/books" element={
          <ProtectedRoute adminOnly><BooksList /></ProtectedRoute>
        } />
        <Route path="reports/movies" element={
          <ProtectedRoute adminOnly><MoviesList /></ProtectedRoute>
        } />
        <Route path="reports/members" element={
          <ProtectedRoute adminOnly><MembersList /></ProtectedRoute>
        } />
        <Route path="reports/active-issues" element={
          <ProtectedRoute adminOnly><ActiveIssues /></ProtectedRoute>
        } />
        <Route path="reports/overdue" element={
          <ProtectedRoute adminOnly><OverdueReturns /></ProtectedRoute>
        } />
        <Route path="reports/requests" element={
          <ProtectedRoute adminOnly><IssueRequests /></ProtectedRoute>
        } />
        
        {/* Maintenance (Admin Only) */}
        <Route path="maintenance/members/add" element={
          <ProtectedRoute adminOnly><AddMember /></ProtectedRoute>
        } />
        <Route path="maintenance/members/update" element={
          <ProtectedRoute adminOnly><UpdateMember /></ProtectedRoute>
        } />
        <Route path="maintenance/items/add" element={
          <ProtectedRoute adminOnly><AddBook /></ProtectedRoute>
        } />
        <Route path="maintenance/items/update" element={
          <ProtectedRoute adminOnly><UpdateBook /></ProtectedRoute>
        } />
        <Route path="maintenance/users" element={
          <ProtectedRoute adminOnly><UserManagement /></ProtectedRoute>
        } />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;