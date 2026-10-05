import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Clock,
  Building2,
  Stethoscope,
  RefreshCw,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  Radio
} from 'lucide-react';
import { api } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function LiveQueuePage() {
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();

  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState(
    searchParams.get('hospitalId') || 'hosp-01'
  );
  const [selectedDeptId, setSelectedDeptId] = useState(
    searchParams.get('deptId') || 'dept-gm'
  );

  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [userTokenSearch, setUserTokenSearch] = useState('');
  const [foundTokenStatus, setFoundTokenStatus] = useState(null);

  useEffect(() => {
    loadSelectors();
  }, []);

  useEffect(() => {
    if (selectedHospitalId && selectedDeptId) {
      fetchQueue();
    }
  }, [selectedHospitalId, selectedDeptId]);

  // Periodic polling for real-time queue updates
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchQueue(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedHospitalId, selectedDeptId, autoRefresh]);

  const loadSelectors = async () => {
    try {
      const [hRes, dRes] = await Promise.all([
        api.getHospitals(),
        api.getDepartments(),
      ]);
      setHospitals(hRes.data || []);
      setDepartments(dRes.data || []);
    } catch (err) {
      console.error('Error loading queue options:', err);
    }
  };

  const fetchQueue = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await api.getQueue(selectedHospitalId, selectedDeptId);
      setQueueData(res);
    } catch (err) {
      console.error('Failed to fetch queue:', err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const handleSearchMyToken = (e) => {
    e.preventDefault();
    if (!userTokenSearch.trim() || !queueData?.tokens) return;

    const term = userTokenSearch.trim().toUpperCase();
    const token = queueData.tokens.find(
      (t) => t.tokenNumber.toUpperCase() === term
    );

    if (!token) {
      setFoundTokenStatus({
        found: false,
        message: `Token ${term} not found in this department today.`
      });
      return;
    }

    // Calculate ahead count
    const waitingTokens = queueData.tokens.filter((t) => t.status === 'WAITING');
    const myIndex = waitingTokens.findIndex((t) => t.id === token.id);
    const ahead = myIndex >= 0 ? myIndex : 0;
    const estimatedMinutes = (ahead + 1) * 8;

    setFoundTokenStatus({
      found: true,
      token,
      ahead,
      estimatedMinutes
    });
  };

  const currentHospital = hospitals.find((h) => h.id === selectedHospitalId);
  const currentDept = departments.find((d) => d.id === selectedDeptId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page Title & Auto-refresh banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
            Real-Time Outpatient Status
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            {language === 'kn' ? 'ಲೈವ್ ಒಪಿಡಿ ಸರದಿ ಸಾಲು' : 'Live OPD Waiting Board'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {language === 'kn'
              ? 'ಪ್ರಸ್ತುತ ಸಮಾಲೋಚನೆ ನಡೆಯುತ್ತಿರುವ ಟೋಕನ್ ಮತ್ತು ಸರದಿಯ ಅಂದಾಜು ಕಾಯುವ ಸಮಯ'
              : 'Real-time broadcast of current consultation tokens and queue progression'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live Broadcast Active</span>
          </div>

          <button
            onClick={() => fetchQueue(true)}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium shadow-2xs transition-colors"
            title="Refresh queue manually"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hospital & Department Selectors */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Select Hospital
          </label>
          <select
            value={selectedHospitalId}
            onChange={(e) => setSelectedHospitalId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden"
          >
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.district})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            OPD Department
          </label>
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden"
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Big Digital Display Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Currently Calling / Consulting Token */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="uppercase font-semibold tracking-wider text-emerald-400">
                Now Consulting / Calling
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-mono text-[11px]">
                OPD Room
              </span>
            </div>

            <div className="py-4 text-center">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono">
                {queueData?.currentToken ? queueData.currentToken.tokenNumber : 'None'}
              </span>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                {queueData?.currentToken
                  ? `Patient: ${queueData.currentToken.patientName} (${queueData.currentToken.status})`
                  : 'Waiting for next patient to be called'}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>{currentHospital?.name}</span>
            <span className="font-semibold text-emerald-400">{currentDept?.code}</span>
          </div>
        </div>

        {/* Card 2: Total Patients Waiting Ahead */}
        <div className="bg-white rounded-2xl p-6 shadow-2xs border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="uppercase font-semibold tracking-wider text-slate-600">
                Patients in Queue
              </span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>

            <div className="py-4 text-center">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
                {queueData?.waitingCount || 0}
              </span>
              <p className="text-xs text-slate-500 mt-2">
                Patients currently waiting in OPD waiting hall
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Completed consultations:</span>
            <span className="font-bold text-slate-800">{queueData?.completedCount || 0}</span>
          </div>
        </div>

        {/* Card 3: Estimated Wait Time */}
        <div className="bg-white rounded-2xl p-6 shadow-2xs border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="uppercase font-semibold tracking-wider text-slate-600">
                Est. Waiting Duration
              </span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>

            <div className="py-4 text-center">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-emerald-700">
                {queueData?.estimatedTotalWaitMinutes || 0}
                <span className="text-lg font-medium text-slate-500 ml-1">mins</span>
              </span>
              <p className="text-xs text-slate-500 mt-2">
                Based on ~{currentDept?.avgConsultationMinutes || 8} mins per consultation
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Average pace:</span>
            <span className="font-medium text-slate-700">Smooth / Normal</span>
          </div>
        </div>
      </div>

      {/* Check My Token Position Tool */}
      <div className="bg-emerald-950 text-white rounded-2xl p-6 shadow-md border border-emerald-900">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-bold text-white">
              {language === 'kn' ? 'ನಿಮ್ಮ ಟೋಕನ್ ಸ್ಥಿತಿ ತಿಳಿಯಿರಿ' : 'Track Your Personal Token Position'}
            </h3>
            <p className="text-xs text-emerald-200 mt-1">
              Enter your token number (e.g. GM-044) to see exactly how many patients are ahead of you.
            </p>
          </div>

          <form onSubmit={handleSearchMyToken} className="flex gap-2">
            <input
              type="text"
              value={userTokenSearch}
              onChange={(e) => setUserTokenSearch(e.target.value)}
              placeholder="e.g. GM-044"
              className="grow px-4 py-2.5 rounded-xl bg-white text-slate-900 font-mono text-sm placeholder:text-slate-400 focus:outline-hidden"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-sm shrink-0"
            >
              Check Position
            </button>
          </form>

          {foundTokenStatus && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-900/80 border border-emerald-700 text-xs space-y-2">
              {foundTokenStatus.found ? (
                <div>
                  <div className="flex items-center justify-between font-bold text-sm text-emerald-100">
                    <span>Token: {foundTokenStatus.token.tokenNumber}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 text-xs">
                      {foundTokenStatus.token.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-emerald-800 text-emerald-200">
                    <div>
                      <span className="block text-[11px] text-emerald-300">Patients Ahead of You:</span>
                      <span className="text-xl font-extrabold text-white">
                        {foundTokenStatus.ahead} patients
                      </span>
                    </div>
                    <div>
                      <span className="block text-[11px] text-emerald-300">Estimated Waiting Time:</span>
                      <span className="text-xl font-extrabold text-white">
                        ~{foundTokenStatus.estimatedMinutes} minutes
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-rose-300 font-medium">{foundTokenStatus.message}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Live OPD Token List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <h3 className="font-bold text-base text-slate-900">
          Today's Queue Roster · {currentHospital?.name} ({currentDept?.name})
        </h3>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading queue roster...</div>
        ) : !queueData?.tokens || queueData.tokens.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No tokens issued for this department yet today.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Token #</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Age / Gender</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queueData.tokens.map((tok) => (
                  <tr
                    key={tok.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      tok.status === 'CONSULTING' ? 'bg-emerald-50/40 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {tok.tokenNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-800">{tok.patientName}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {tok.patientAge} Yrs / {tok.patientGender}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          tok.status === 'CONSULTING'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tok.status === 'CALLED'
                            ? 'bg-amber-100 text-amber-900 animate-pulse'
                            : tok.status === 'WAITING'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {tok.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {tok.priority === 'EMERGENCY' ? (
                        <span className="font-bold text-rose-600">EMERGENCY</span>
                      ) : (
                        'Normal'
                      )}
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
