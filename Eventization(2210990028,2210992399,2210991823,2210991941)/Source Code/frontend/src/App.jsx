import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import EventDetails from './pages/EventDetails.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Chatbot from './components/Chatbot.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

function PrivateRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLink = (to, label) => {
    const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
    return (
      <Link
        to={to}
        onClick={() => setMobileOpen(false)}
        className={`text-sm font-medium transition-colors ${
          active ? 'text-teal-700' : 'text-gray-600 hover:text-teal-700'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">Eventization</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLink('/', 'Home')}
          {user && (user.role === 'organizer' || user.role === 'admin') && navLink('/dashboard', 'Dashboard')}
          {!user && navLink('/#features', 'Features')}
          {!user && navLink('/#help', 'Help Centre')}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 bg-teal-50 rounded-full px-3 py-1.5">
                <div className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center font-semibold">{user.name?.charAt(0)?.toUpperCase()}</div>
                <span className="text-sm font-medium text-teal-800">{user.name}</span>
              </div>
              <button onClick={logout} className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Log in</Link>
              <Link to="/signup" className="text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-full px-5 py-2 transition-colors">Get Started</Link>
            </>
          )}
        </div>

        <button className="md:hidden text-gray-600" onClick={() => setMobileOpen(!mobileOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {mobileOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          {navLink('/', 'Home')}
          {!user && navLink('/#features', 'Features')}
          {!user && navLink('/#help', 'Help Centre')}
          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            {user ? (
              <button onClick={() => { logout(); setMobileOpen(false); }} className="text-sm text-left text-gray-600">Log out</button>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm text-gray-600">Log in</Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)} className="text-sm text-teal-600 font-semibold">Get Started Free</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  const { user } = useAuth();

  if (user) {
    return (
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between text-xs text-gray-400">
          <span>&copy; 2026 Eventization</span>
          <span>Crafted by <span className="text-teal-600 font-medium">Chitkarian</span></span>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </div>
              <span className="text-white font-bold text-lg">Eventization</span>
            </div>
            <p className="text-sm leading-relaxed">The all-in-one campus event platform. Discover, organize, and attend events that matter.</p>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-teal-400 transition-colors">Browse Events</Link></li>
              <li><Link to="/#features" className="hover:text-teal-400 transition-colors">Features</Link></li>
              <li><Link to="/signup" className="hover:text-teal-400 transition-colors">Get Started</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/#help" className="hover:text-teal-400 transition-colors">Help Centre</Link></li>
              <li><Link to="/#faq" className="hover:text-teal-400 transition-colors">FAQs</Link></li>
              <li><a href="mailto:support@eventization.com" className="hover:text-teal-400 transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-teal-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span>&copy; 2026 Eventization. All rights reserved.</span>
          <span>Crafted by <span className="text-teal-400 font-medium">Chitkarian</span></span>
        </div>
      </div>
    </footer>
  );
}

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <Chatbot />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={
              <PrivateRoute roles={['organizer', 'admin']}>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/pass" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
