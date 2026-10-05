import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Bell,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import TokenCard from '../components/TokenCard.jsx';

export default function PatientDashboard() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientTokens();
  }, [user]);

  const fetchPatientTokens = async () => {
    setLoading(true);
    try {
      const res = await api.getTokens({ patientPhone: user?.phone || '9845012345' });
      setTokens(res.data || []);
    } catch (err) {
      console.error('Failed to load patient tokens:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelToken = async (tokenId) => {
    if (!window.confirm('Are you sure you want to cancel this OPD token?')) return;
    try {
      await api.cancelToken(tokenId);
      fetchPatientTokens();
    } catch (err) {
      alert('Error cancelling token: ' + err.message);
    }
  };

  const activeTokens = tokens.filter(
    (t) => t.status === 'WAITING' || t.status === 'CALLED' || t.status === 'CONSULTING'
  );
  const pastTokens = tokens.filter(
    (t) => t.status === 'COMPLETED' || t.status === 'CANCELLED' || t.status === 'NO_SHOW'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Patient Welcome Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl">
            {user?.fullName?.charAt(0) || 'P'}
          </div>
          <div>
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
              Patient Portal · Government of Karnataka
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              {user?.fullName || 'Basavaraj Patil'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Phone: {user?.phone || '9845012345'} · Age: {user?.age || '52'} · ABHA:{' '}
              {user?.abhaId || '91-4567-8912-3456'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/book-token"
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-2xs transition-colors"
          >
            + Book New OPD Token
          </Link>
        </div>
      </div>

      {/* Notifications / Live status notification */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-xs text-blue-900">
        <Bell className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Live Hospital Announcement:</span> Victoria Hospital and KC General Hospital OPD registration counters are operating with digital express lanes. Present your digital token QR pass to skip the manual line.
        </div>
      </div>

      {/* Active Tokens Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Active OPD Passes & Tokens ({activeTokens.length})
            </h2>
            <p className="text-xs text-slate-500">
              Tokens for today awaiting consultation or currently being called.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading token records...</div>
        ) : activeTokens.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-semibold text-slate-800 text-sm">No Active OPD Tokens</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You do not have any active tokens for today. Need to visit a government hospital?
            </p>
            <Link
              to="/book-token"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-2xs"
            >
              <span>Book a Token Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeTokens.map((token) => (
              <TokenCard
                key={token.id}
                token={token}
                onCancel={handleCancelToken}
              />
            ))}
          </div>
        )}
      </div>

      {/* Past Consultation History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <h3 className="font-bold text-base text-slate-900">
          Previous Visits & OPD History ({pastTokens.length})
        </h3>

        {pastTokens.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No past consultation records.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Token #</th>
                  <th className="py-3 px-4">Hospital & Department</th>
                  <th className="py-3 px-4">Doctor</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pastTokens.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {t.tokenNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-900 block">{t.departmentName}</span>
                      <span className="text-slate-500 text-[11px]">{t.hospitalName}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{t.doctorName || 'Medical Officer'}</td>
                    <td className="py-3 px-4 text-slate-600">{t.date}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          t.status === 'COMPLETED'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
