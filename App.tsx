
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Search, 
  ShieldCheck, 
  User, 
  Bookmark, 
  LogOut, 
  LayoutDashboard, 
  Database, 
  ChevronRight,
  Menu,
  X,
  Globe,
  Lock,
  PieChart
} from 'lucide-react';
import LandingPage from './pages/LandingPage.tsx';
import DealsExplorer from './pages/DealsExplorer.tsx';
import DealProfile from './pages/DealProfile.tsx';
import AboutPage from './pages/AboutPage.tsx';
import MethodologyPage from './pages/MethodologyPage.tsx';
import Dashboard from './pages/Dashboard.tsx';
import WatchlistsPage from './pages/WatchlistsPage.tsx';
import AccountPage from './pages/AccountPage.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import { supabase } from './lib/supabase.ts';

const App: React.FC = () => {
  // MOCK SESSION FOR TESTING
  const [session, setSession] = useState<any>({
    user: {
      id: 'test-user-id',
      email: 'admin@intelligence.pro',
      user_metadata: { full_name: 'Test Administrator' }
    }
  });
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    setSession(null);
    navigate('/');
  };

  const handleLogin = () => {
    setSession({
      user: {
        id: 'test-user-id',
        email: 'admin@intelligence.pro',
      }
    });
    navigate('/app');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-indigo-600" />
                <span className="text-xl font-bold text-slate-900 tracking-tight">
                  M&A <span className="text-indigo-600">Intelligence</span>
                </span>
              </Link>
              
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <Link to="/deals" className={`${location.pathname === '/deals' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-900'} px-1 pt-1 text-sm font-medium h-16 flex items-center`}>
                  Deals Explorer
                </Link>
                {/* <Link to="/methodology" className={`${location.pathname === '/methodology' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-900'} px-1 pt-1 text-sm font-medium h-16 flex items-center`}>
                  Methodology
                </Link> */}
                <Link to="/app/admin" className={`${location.pathname === '/app/admin' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-900'} px-1 pt-1 text-sm font-medium h-16 flex items-center`}>
                  Admin Panel
                </Link>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {session ? (
                <div className="flex items-center space-x-4">
                  <Link to="/app" className="text-slate-500 hover:text-indigo-600 transition" title="Dashboard">
                    <LayoutDashboard className="h-5 w-5" />
                  </Link>
                  <Link to="/app/watchlists" className="text-slate-500 hover:text-indigo-600 transition" title="Watchlists">
                    <Bookmark className="h-5 w-5" />
                  </Link>
                  <div className="h-6 w-px bg-slate-200 mx-2" />
                  <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 transition">
                    <LogOut className="h-5 w-5" />
                  </button>
                  <Link to="/app/account" className="flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-medium border border-indigo-100">
                    <User className="h-4 w-4" />
                    <span>{session.user.email.split('@')[0]}</span>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button onClick={handleLogin} className="text-slate-600 hover:text-indigo-600 text-sm font-medium">Log in</button>
                  <button onClick={handleLogin} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition shadow-sm">
                    Get Access
                  </button>
                </div>
              )}
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-500">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link to="/deals" className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md">Deals Explorer</Link>
              {/* <Link to="/methodology" className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md">Methodology</Link> */}
              <Link to="/app" className="block px-3 py-2 text-base font-medium text-indigo-600 hover:bg-indigo-50 rounded-md">Dashboard</Link>
              <Link to="/app/admin" className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md">Admin</Link>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/methodology" element={<MethodologyPage />} />
          <Route path="/deals" element={<DealsExplorer />} />
          <Route path="/deals/:slug" element={<DealProfile />} />
          <Route path="/app" element={<Dashboard />} />
          <Route path="/app/watchlists" element={<WatchlistsPage />} />
          <Route path="/app/account" element={<AccountPage />} />
          <Route path="/app/admin" element={<AdminDashboard />} />
          <Route path="/login" element={<AuthPlaceholder type="login" onAuth={handleLogin} />} />
          <Route path="/signup" element={<AuthPlaceholder type="signup" onAuth={handleLogin} />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 text-white mb-4">
                <BarChart3 className="h-8 w-8 text-indigo-400" />
                <span className="text-xl font-bold">M&A Intelligence</span>
              </div>
              <p className="max-w-xs text-sm leading-relaxed">
                Institutional-grade M&A tracking and analysis. We provide the most accurate real-time database of mid-market and enterprise deal flow.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/deals" className="hover:text-white transition">Deals Explorer</Link></li>
                {/* <li><Link to="/methodology" className="hover:text-white transition">Methodology</Link></li> */}
                <li><Link to="/app/watchlists" className="hover:text-white transition">Watchlists</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs">
            <p>&copy; 2026 M&A Intelligence Pro. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white">Twitter</a>
              <a href="#" className="hover:text-white">LinkedIn</a>
              <a href="#" className="hover:text-white">Terminal</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const AuthPlaceholder: React.FC<{ type: 'login' | 'signup', onAuth: () => void }> = ({ type, onAuth }) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 mb-4">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{type === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-slate-500 mt-2">Bypassing auth for testing.</p>
        </div>
        
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onAuth(); }}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input type="email" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" defaultValue="admin@intelligence.pro" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" defaultValue="••••••••" />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
            {type === 'login' ? 'Bypass Login (Enter App)' : 'Create Test Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;
