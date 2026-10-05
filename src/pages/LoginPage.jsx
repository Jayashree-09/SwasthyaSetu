import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, UserCheck, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function LoginPage() {
  const { login, switchRole } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedUser = await login(email, 'patient');
      redirectUser(loggedUser.role);
    } catch (err) {
      alert('Login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (role) => {
    switchRole(role);
    redirectUser(role);
  };

  const redirectUser = (role) => {
    switch (role) {
      case 'staff':
        navigate('/staff/dashboard');
        break;
      case 'doctor':
        navigate('/doctor/dashboard');
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'patient':
      default:
        navigate('/patient/dashboard');
        break;
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-2xl mx-auto shadow-sm">
          <span>ಸ್ವ</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          {language === 'kn' ? 'ಸ್ವಾಸ್ಥ್ಯಸೇತು ಲಾಗಿನ್' : 'Sign in to SwasthyaSetu'}
        </h1>
        <p className="text-xs text-slate-500">
          Access your digital OPD tokens, patient queue, and health appointments.
        </p>
      </div>

      {/* 1-Click Demo Login Personas Box */}
      <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
          <UserCheck className="w-4 h-4 text-emerald-700" />
          <span>Quick Demo Switcher (Instant 1-Click Access):</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickDemoLogin('patient')}
            className="p-2 rounded-lg bg-white border border-emerald-200 text-emerald-950 font-medium hover:bg-emerald-100/60 text-left transition-colors"
          >
            <span className="font-bold block">Patient</span>
            <span className="text-[11px] text-slate-500">Basavaraj Patil</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoLogin('staff')}
            className="p-2 rounded-lg bg-white border border-emerald-200 text-emerald-950 font-medium hover:bg-emerald-100/60 text-left transition-colors"
          >
            <span className="font-bold block">OPD Counter Staff</span>
            <span className="text-[11px] text-slate-500">Sunitha K.</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoLogin('doctor')}
            className="p-2 rounded-lg bg-white border border-emerald-200 text-emerald-950 font-medium hover:bg-emerald-100/60 text-left transition-colors"
          >
            <span className="font-bold block">Duty Doctor</span>
            <span className="text-[11px] text-slate-500">Dr. Ramesh Babu</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoLogin('admin')}
            className="p-2 rounded-lg bg-white border border-emerald-200 text-emerald-950 font-medium hover:bg-emerald-100/60 text-left transition-colors"
          >
            <span className="font-bold block">Hospital Admin</span>
            <span className="text-[11px] text-slate-500">Dr. S. Nagaraj</span>
          </button>
        </div>
      </div>

      {/* Standard Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Registered Email or Phone Number
          </label>
          <input
            type="text"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. 9845012345 or patient@swasthyasetu.gov.in"
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Password / OTP
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>

        <div className="pt-2 text-center text-slate-500">
          <span>New patient? </span>
          <Link to="/register" className="text-emerald-700 font-semibold hover:underline">
            Register here
          </Link>
        </div>
      </form>
    </div>
  );
}
