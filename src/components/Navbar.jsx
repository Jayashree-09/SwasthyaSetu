import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  Calendar,
  Clock,
  Sparkles,
  Ticket,
  LogIn,
  LogOut,
  Menu,
  X,
  Languages,
  UserCheck,
  ChevronDown,
  User
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useLanguage();
  const { user, switchRole, logout } = useAuth();

  // Primary navigation links explicitly including Home, Departments, and My Tokens
  const navLinks = [
    {
      name: language === 'kn' ? 'ಮುಖಪುಟ' : 'Home',
      path: '/'
    },
    {
      name: language === 'kn' ? 'ವಿಭಾಗಗಳು' : 'Departments',
      path: '/departments'
    },
    {
      name: language === 'kn' ? 'ನನ್ನ ಟೋಕನ್‌ಗಳು' : 'My Tokens',
      path: '/patient/dashboard',
      icon: Ticket
    },
    {
      name: language === 'kn' ? 'ಆಸ್ಪತ್ರೆಗಳು' : 'Hospitals',
      path: '/hospitals'
    },
    {
      name: language === 'kn' ? 'ಲೈವ್ ಸರದಿ' : 'Live Queue',
      path: '/live-queue'
    },
    {
      name: language === 'kn' ? 'ಎಐ ಸಹಾಯಕ' : 'AI Assistant',
      path: '/ai-assistant'
    }
  ];

  const handleRoleSwitch = (role) => {
    switchRole(role);
    setRoleMenuOpen(false);
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-xs">
      {/* Top Micro-Bar: Govt of Karnataka, Bilingual Toggle & Quick Role Switcher */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-medium text-slate-200 tracking-wide text-[11px] sm:text-xs">
              {t('govKarnataka')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Bilingual Language Switcher Button */}
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors border border-slate-700 text-[11px]"
              title="Switch language between English and Kannada"
            >
              <Languages className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
            </button>

            {/* Quick Role Persona Switcher for Evaluation */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="inline-flex items-center gap-1 text-slate-300 hover:text-white px-2 py-0.5 rounded hover:bg-slate-800 transition-colors text-[11px]"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span className="capitalize font-medium text-slate-200">
                  {user ? `${user.role}: ${user.fullName.split(' ')[0]}` : 'Demo Role'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-60 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Switch Test Persona
                  </div>
                  <button
                    onClick={() => handleRoleSwitch('patient')}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 ${user?.role === 'patient' ? 'bg-emerald-50 text-emerald-800 font-semibold' : ''}`}
                  >
                    <span>Patient (Basavaraj Patil)</span>
                    {user?.role === 'patient' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>}
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('staff')}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 ${user?.role === 'staff' ? 'bg-emerald-50 text-emerald-800 font-semibold' : ''}`}
                  >
                    <span>Counter Staff (Sunitha K.)</span>
                    {user?.role === 'staff' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>}
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('doctor')}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 ${user?.role === 'doctor' ? 'bg-emerald-50 text-emerald-800 font-semibold' : ''}`}
                  >
                    <span>Doctor (Dr. Ramesh Babu)</span>
                    {user?.role === 'doctor' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>}
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('admin')}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 ${user?.role === 'admin' ? 'bg-emerald-50 text-emerald-800 font-semibold' : ''}`}
                  >
                    <span>Admin (Dr. S. Nagaraj)</span>
                    {user?.role === 'admin' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Branding: SwasthyaSetu */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xl shadow-sm ring-1 ring-emerald-800/10 group-hover:scale-105 transition-transform">
              <span>ಸ್ವ</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">
                  SwasthyaSetu
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded tracking-wide">
                  OPD
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-none hidden sm:block">
                {language === 'kn' ? 'ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆ ಸ್ಮಾರ್ಟ್ ಟೋಕನ್' : 'Govt Hospital OPD & Queue System'}
              </p>
            </div>
          </Link>

          {/* Desktop Nav Items: Home, Departments, My Tokens, etc. */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    active
                      ? 'text-emerald-800 bg-emerald-50 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 text-emerald-600" />}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Sign In Button & Book OPD Token */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            {/* Explicit Sign In Button */}
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors border border-slate-200"
            >
              <LogIn className="w-4 h-4 text-slate-600" />
              <span>{language === 'kn' ? 'ಲಾಗಿನ್' : 'Sign In'}</span>
            </Link>

            {/* Quick Action: Book Token */}
            <Link
              to="/book-token"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-sm transition-all hover:shadow focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <Calendar className="w-4 h-4" />
              <span>{language === 'kn' ? 'ಟೋಕನ್ ಪಡೆಯಿರಿ' : 'Get OPD Token'}</span>
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              to="/login"
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              {language === 'kn' ? 'ಲಾಗಿನ್' : 'Sign In'}
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active
                    ? 'text-emerald-800 bg-emerald-50 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {Icon && <Icon className="w-4 h-4 text-emerald-600" />}
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm rounded-lg flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 text-slate-600" />
              <span>{language === 'kn' ? 'ಲಾಗಿನ್' : 'Sign In'}</span>
            </Link>

            <Link
              to="/book-token"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>{language === 'kn' ? 'ಒಪಿಡಿ ಟೋಕನ್ ಪಡೆಯಿರಿ' : 'Get OPD Token'}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
