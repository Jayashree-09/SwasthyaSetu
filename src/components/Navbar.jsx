import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  Calendar,
  Clock,
  Sparkles,
  Ticket,
  LogIn,
  Menu,
  X,
  Languages,
  UserCheck,
  ChevronDown,
  Check,
  Compass
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, toggleLanguage, t } = useLanguage();
  const { user, switchRole, logout } = useAuth();

  // Primary navigation links explicitly including Home, Departments, and My Tokens
  const navLinks = [
    {
      name: t('navHome'),
      path: '/'
    },
    {
      name: t('navDepartments'),
      path: '/departments'
    },
    {
      name: t('navMyTokens'),
      path: '/patient/dashboard',
      icon: Ticket
    },
    {
      name: t('navHospitals'),
      path: '/hospitals'
    },
    {
      name: t('navLiveQueue'),
      path: '/live-queue'
    },
    {
      name: t('navNavigator') || 'Hospital Navigator',
      path: '/hospital-navigator',
      icon: Compass
    },
    {
      name: t('navAIAssistant'),
      path: '/ai-assistant'
    }
  ];

  const handleRoleSwitch = (role) => {
    switchRole(role);
    setRoleMenuOpen(false);
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-xs">
      {/* Top Micro-Bar: Govt of Karnataka & Quick Role Switcher */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-medium text-slate-200 tracking-wide text-[11px] sm:text-xs">
              {t('govKarnataka')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Helper Note for Rural Patients */}
            <span className="hidden md:inline text-[11px] text-emerald-400 font-medium">
              {language === 'kn'
                ? 'ಸಾರ್ವಜನಿಕ ಆರೋಗ್ಯ ಸೇವೆ · ಉಚಿತ ಒಪಿಡಿ'
                : 'Karnataka Public Healthcare Mission'}
            </span>

            {/* Quick Role Persona Switcher for Evaluation */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="inline-flex items-center gap-1 text-slate-300 hover:text-white px-2 py-0.5 rounded hover:bg-slate-800 transition-colors text-[11px]"
                aria-label="Switch test persona"
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
        <div className="flex items-center justify-between h-16 gap-3">
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

          {/* Right Action Cluster: Language Toggle, Sign In Button & Book OPD Token */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {/* PROMINENT DUAL LANGUAGE TOGGLE (English | ಕನ್ನಡ) */}
            <div
              className="flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/90 shadow-2xs"
              role="group"
              aria-label="Language selection"
            >
              <button
                type="button"
                onClick={() => setLanguage('en')}
                aria-pressed={language === 'en'}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 min-h-[34px] ${
                  language === 'en'
                    ? 'bg-white text-emerald-900 shadow-xs ring-1 ring-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
                title="Switch UI to English"
              >
                <span>English</span>
                {language === 'en' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              </button>

              <button
                type="button"
                onClick={() => setLanguage('kn')}
                aria-pressed={language === 'kn'}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 min-h-[34px] ${
                  language === 'kn'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-emerald-800 font-semibold hover:text-emerald-950 hover:bg-white/50'
                }`}
                title="ಕನ್ನಡದಲ್ಲಿ ಬಳಸಲು ಇಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ"
              >
                <Languages className="w-3.5 h-3.5 shrink-0" />
                <span>ಕನ್ನಡ</span>
                {language === 'kn' && <Check className="w-3.5 h-3.5 text-amber-300" />}
              </button>
            </div>

            {/* Explicit Sign In Button */}
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors border border-slate-200"
            >
              <LogIn className="w-4 h-4 text-slate-600" />
              <span>{t('navLogin')}</span>
            </Link>

            {/* Quick Action: Book Token */}
            <Link
              to="/book-token"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-sm transition-all hover:shadow focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <Calendar className="w-4 h-4" />
              <span>{t('navBookToken')}</span>
            </Link>
          </div>

          {/* Mobile Header Actions (Language Toggle + Sign In + Menu) */}
          <div className="flex sm:hidden items-center gap-2">
            {/* Quick 1-Tap Mobile Language Switcher (Min 44px touch-target) */}
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label="Switch language between Kannada and English"
              className={`min-h-[44px] min-w-[44px] px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1 shadow-2xs ${
                language === 'kn'
                  ? 'bg-emerald-700 text-white border-emerald-800'
                  : 'bg-slate-100 text-emerald-900 border-slate-200'
              }`}
            >
              <Languages className="w-3.5 h-3.5 shrink-0" />
              <span>{language === 'kn' ? 'ಕನ್ನಡ' : 'Eng'}</span>
            </button>

            <Link
              to="/login"
              className="min-h-[44px] px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 flex items-center transition-colors"
            >
              {t('navLogin')}
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="min-h-[44px] min-w-[44px] p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center border border-slate-200"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-3">
          {/* Dedicated Rural Patient Language Selector in Mobile Drawer */}
          <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
              <Languages className="w-4 h-4 text-emerald-700" />
              <span>{t('switchLanguage')}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setLanguage('kn');
                  setMobileOpen(false);
                }}
                className={`min-h-[48px] p-2.5 rounded-xl border font-bold text-left transition-all flex flex-col justify-center ${
                  language === 'kn'
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                    : 'bg-white text-slate-800 border-emerald-200 hover:bg-emerald-100/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">ಕನ್ನಡ (Kannada)</span>
                  {language === 'kn' && <Check className="w-4 h-4 text-amber-300" />}
                </div>
                <span className={`text-[10px] ${language === 'kn' ? 'text-emerald-100' : 'text-slate-500'}`}>
                  ಸ್ಥಳೀಯ ಗ್ರಾಮೀಣ ಸೇವೆ
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLanguage('en');
                  setMobileOpen(false);
                }}
                className={`min-h-[48px] p-2.5 rounded-xl border font-bold text-left transition-all flex flex-col justify-center ${
                  language === 'en'
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                    : 'bg-white text-slate-800 border-emerald-200 hover:bg-emerald-100/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">English</span>
                  {language === 'en' && <Check className="w-4 h-4 text-amber-300" />}
                </div>
                <span className={`text-[10px] ${language === 'en' ? 'text-emerald-100' : 'text-slate-500'}`}>
                  Statewide Health Portal
                </span>
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            {navLinks.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium min-h-[44px] ${
                    active
                      ? 'text-emerald-800 bg-emerald-50 font-bold border border-emerald-200'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 text-emerald-600" />}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Bottom Actions */}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 min-h-[44px]"
            >
              <LogIn className="w-4 h-4 text-slate-600" />
              <span>{t('navLogin')}</span>
            </Link>

            <Link
              to="/book-token"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Calendar className="w-4 h-4" />
              <span>{t('navBookToken')}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
