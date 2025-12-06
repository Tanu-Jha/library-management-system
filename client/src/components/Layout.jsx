import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, Users, FileText, Settings, LogOut, Menu, X,
  Home, Search, BookPlus, RotateCcw, DollarSign, Film,
  UserPlus, UserCog, ClipboardList, AlertCircle, Clock, ChevronDown
} from 'lucide-react';

const Layout = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({
    transactions: true,
    reports: false,
    maintenance: false
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const transactionsLinks = [
    { to: '/transactions/availability', icon: Search, label: 'Book Availability' },
    { to: '/transactions/issue', icon: BookPlus, label: 'Issue Book' },
    { to: '/transactions/return', icon: RotateCcw, label: 'Return Book' },
    { to: '/transactions/pay-fine', icon: DollarSign, label: 'Pay Fine' },
  ];

  const reportsLinks = [
    { to: '/reports/books', icon: BookOpen, label: 'Master List - Books' },
    { to: '/reports/movies', icon: Film, label: 'Master List - Movies' },
    { to: '/reports/members', icon: Users, label: 'Master List - Members' },
    { to: '/reports/active-issues', icon: ClipboardList, label: 'Active Issues' },
    { to: '/reports/overdue', icon: AlertCircle, label: 'Overdue Returns' },
    { to: '/reports/requests', icon: Clock, label: 'Issue Requests' },
  ];

  const maintenanceLinks = [
    { to: '/maintenance/members/add', icon: UserPlus, label: 'Add Membership' },
    { to: '/maintenance/members/update', icon: UserCog, label: 'Update Membership' },
    { to: '/maintenance/items/add', icon: BookPlus, label: 'Add Book/Movie' },
    { to: '/maintenance/items/update', icon: Settings, label: 'Update Book/Movie' },
    { to: '/maintenance/users', icon: Users, label: 'User Management' },
  ];

  const NavSection = ({ title, links, menuKey, icon: Icon }) => (
    <div className="mb-2">
      <button
        onClick={() => toggleMenu(menuKey)}
        className="w-full flex items-center justify-between px-4 py-3 text-library-cream/80 hover:text-library-cream hover:bg-white/5 rounded-xl transition-all duration-200"
      >
        <span className="flex items-center gap-3">
          <Icon size={18} />
          <span className="font-medium">{title}</span>
        </span>
        <ChevronDown 
          size={16} 
          className={`transform transition-transform duration-200 ${expandedMenus[menuKey] ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {expandedMenus[menuKey] && (
        <div className="mt-1 ml-4 space-y-1 animate-slide-down">
          {links.map(({ to, icon: LinkIcon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200
                ${isActive 
                  ? 'bg-library-accent/20 text-library-cream' 
                  : 'text-library-cream/60 hover:text-library-cream hover:bg-white/5'}`
              }
            >
              <LinkIcon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-library-paper flex">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-library-dark text-library-cream rounded-lg shadow-lg"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-library-dark transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-library-accent/20 rounded-xl flex items-center justify-center">
                <BookOpen className="text-library-accent" size={24} />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-library-cream">Library</h1>
                <p className="text-library-cream/50 text-sm">Management System</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-library-accent/30 rounded-full flex items-center justify-center">
                <span className="text-library-cream font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-library-cream font-medium">{user?.name}</p>
                <p className="text-library-cream/50 text-sm">
                  {isAdmin ? 'Administrator' : 'User'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl mb-4 transition-all duration-200
                ${isActive 
                  ? 'bg-library-accent/20 text-library-cream' 
                  : 'text-library-cream/70 hover:text-library-cream hover:bg-white/10'}`
              }
            >
              <Home size={20} />
              <span className="font-medium">Dashboard</span>
            </NavLink>

            <NavSection 
              title="Transactions" 
              links={transactionsLinks} 
              menuKey="transactions"
              icon={FileText}
            />
            
            <NavSection 
              title="Reports" 
              links={reportsLinks} 
              menuKey="reports"
              icon={ClipboardList}
            />

            {isAdmin && (
              <NavSection 
                title="Maintenance" 
                links={maintenanceLinks} 
                menuKey="maintenance"
                icon={Settings}
              />
            )}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-library-cream/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
            >
              <LogOut size={20} />
              <span className="font-medium">Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen lg:ml-0">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;