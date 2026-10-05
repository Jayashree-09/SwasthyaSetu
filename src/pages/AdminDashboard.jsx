import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  Activity,
  FileText
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminAnalytics();
      setAnalytics(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stats = analytics?.stats || {
    totalHospitals: 6,
    totalDepartments: 11,
    totalDoctors: 5,
    totalPatientsRegistered: 184,
    totalTokensToday: 526,
    completedToday: 388,
    waitingNow: 98,
    noShowToday: 32,
    avgWaitingTimeMinutes: 24,
    cancellationRate: '4.2%',
    opdUtilization: '88.5%',
    dailyTrend: []
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
            Government of Karnataka · Health Administration Console
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Hospital Analytics & OPD Operations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin: {user?.fullName || 'Dr. S. Nagaraj'} · Victoria Hospital & State Health Network
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            Network Status: Operational
          </span>
        </div>
      </div>

      {/* Primary Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Tokens Issued Today</span>
          <div className="text-3xl font-black text-slate-900 mt-2">{stats.totalTokensToday}</div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
            {stats.completedToday} completed ({stats.opdUtilization} utilization)
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Avg. Waiting Time</span>
          <div className="text-3xl font-black text-emerald-700 mt-2">
            {stats.avgWaitingTimeMinutes} <span className="text-sm font-medium text-slate-500">mins</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            Target benchmark: &lt;30 mins
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Active Government Hospitals</span>
          <div className="text-3xl font-black text-slate-900 mt-2">{stats.totalHospitals}</div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            Across 6 Karnataka districts
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Cancellation / No-Show</span>
          <div className="text-3xl font-black text-slate-900 mt-2">{stats.cancellationRate}</div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            {stats.noShowToday} no-shows recorded today
          </span>
        </div>
      </div>

      {/* OPD Utilization Chart & District Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">
              Weekly OPD Volume & Consultation Progression
            </h3>
            <span className="text-xs text-slate-400">Tokens vs Completed</span>
          </div>

          <div className="grid grid-cols-6 gap-2 text-center pt-4">
            {stats.dailyTrend?.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="text-xs font-mono font-bold text-slate-800">{item.tokens}</div>
                <div className="h-32 bg-slate-100 rounded-lg flex flex-col justify-end p-1">
                  <div
                    style={{ height: `${(item.completed / 800) * 100}%` }}
                    className="w-full bg-emerald-700 rounded-md transition-all"
                    title={`Completed: ${item.completed}`}
                  ></div>
                </div>
                <span className="text-xs font-semibold text-slate-600 block">{item.day}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-6 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-700"></span>
              <span>Consultations Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-slate-300"></span>
              <span>Total Tokens Requested</span>
            </div>
          </div>
        </div>

        {/* Karnataka District Load */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h3 className="font-bold text-base text-slate-900">
            District OPD Load
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-slate-700">Bengaluru Urban (Victoria & KCGH)</span>
                <span className="font-bold text-slate-900">46%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '46%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-slate-700">Mysuru (K.R. Hospital)</span>
                <span className="font-bold text-slate-900">24%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '24%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-slate-700">Dakshina Kannada (Wenlock)</span>
                <span className="font-bold text-slate-900">18%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '18%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-slate-700">Kodagu (Madikeri & Virajpet)</span>
                <span className="font-bold text-slate-900">12%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '12%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Administrative Audit Logs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <h3 className="font-bold text-base text-slate-900">
          System Audit & Queue Activity Log
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Event Details</th>
                <th className="py-2.5 px-4">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {analytics?.auditLogs?.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-900">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-4">{log.details}</td>
                  <td className="py-2.5 px-4 text-slate-600">{log.performedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
