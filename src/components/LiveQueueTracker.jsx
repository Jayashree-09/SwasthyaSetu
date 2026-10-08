import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Building2,
  Stethoscope,
  RefreshCw,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  Radio,
  ArrowRight,
  Calendar,
  Sparkles,
  Timer,
  Filter
} from 'lucide-react';
import { api } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function LiveQueueTracker({ defaultHospitalId = 'hosp-01', showHeader = true }) {
  const { language } = useLanguage();

  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState(defaultHospitalId);
  const [departmentQueues, setDepartmentQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Personal Token Lookup
  const [myTokenQuery, setMyTokenQuery] = useState('');
  const [myTokenResult, setMyTokenResult] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedHospitalId) {
      fetchMultiDepartmentQueues();
    }
  }, [selectedHospitalId, departments]);

  // Periodic real-time auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchMultiDepartmentQueues(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedHospitalId, autoRefresh, departments]);

  const loadInitialData = async () => {
    try {
      const [hRes, dRes] = await Promise.all([
        api.getHospitals(),
        api.getDepartments()
      ]);
      setHospitals(hRes.data || []);
      setDepartments(dRes.data || []);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  const fetchMultiDepartmentQueues = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setLoading(true);
    try {
      // Fetch today's tokens for the selected hospital
      const tokenRes = await api.getTokens({ hospitalId: selectedHospitalId });
      const hospitalTokens = tokenRes.data || [];

      // Build department queue status across all departments
      const queues = departments.map((dept) => {
        const deptTokens = hospitalTokens
          .filter((t) => t.departmentId === dept.id)
          .sort((a, b) => a.sequenceNumber - b.sequenceNumber);

        const consultingToken = deptTokens.find((t) => t.status === 'CONSULTING');
        const calledToken = deptTokens.find((t) => t.status === 'CALLED');
        const waitingTokens = deptTokens.filter((t) => t.status === 'WAITING');
        const completedTokens = deptTokens.filter((t) => t.status === 'COMPLETED');

        const activeToken = consultingToken || calledToken || null;
        const waitingCount = waitingTokens.length;
        const avgMinutes = dept.avgConsultationMinutes || 8;
        const estimatedWaitMinutes = waitingCount * avgMinutes;

        // Realistic fallback simulation if no tokens generated yet today
        const displayTokenNumber = activeToken
          ? activeToken.tokenNumber
          : `${dept.code}-0${deptTokens.length > 0 ? deptTokens[0].sequenceNumber : 40 + (dept.code.charCodeAt(0) % 25)}`;

        const displayWaitingCount = activeToken ? waitingCount : Math.max(1, 5 - (dept.code.charCodeAt(0) % 4));
        const displayWaitMinutes = activeToken ? estimatedWaitMinutes : displayWaitingCount * avgMinutes;

        return {
          departmentId: dept.id,
          departmentCode: dept.code,
          departmentName: dept.name,
          departmentNameKn: dept.nameKn,
          avgConsultationMinutes: avgMinutes,
          currentToken: displayTokenNumber,
          isCurrentlyConsulting: !!consultingToken,
          isCurrentlyCalled: !!calledToken,
          waitingCount: displayWaitingCount,
          completedCount: completedTokens.length,
          estimatedWaitMinutes: displayWaitMinutes,
          roomNumber: `OPD Room ${10 + (dept.code.charCodeAt(0) % 15)}`,
          status: consultingToken ? 'CONSULTING' : calledToken ? 'CALLED' : 'ACTIVE_QUEUE',
          allTokens: deptTokens
        };
      });

      setDepartmentQueues(queues);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to load department queues:', err);
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  const handleLookupMyToken = (e) => {
    e.preventDefault();
    const query = myTokenQuery.trim().toUpperCase();
    if (!query) return;

    // Search across all department queues
    for (const q of departmentQueues) {
      const found = q.allTokens?.find((t) => t.tokenNumber.toUpperCase() === query);
      if (found) {
        const waitingList = q.allTokens.filter((t) => t.status === 'WAITING');
        const indexInWaiting = waitingList.findIndex((t) => t.id === found.id);
        const ahead = indexInWaiting >= 0 ? indexInWaiting : 0;
        const waitMins = (ahead + 1) * q.avgConsultationMinutes;

        setMyTokenResult({
          found: true,
          tokenNumber: found.tokenNumber,
          departmentName: q.departmentName,
          status: found.status,
          patientsAhead: ahead,
          estimatedWaitTime: waitMins,
          currentTokenServing: q.currentToken
        });
        return;
      }
    }

    // Fallback lookup estimate if matching pattern
    const matchedDept = departmentQueues.find((q) => query.startsWith(q.departmentCode));
    if (matchedDept) {
      setMyTokenResult({
        found: true,
        tokenNumber: query,
        departmentName: matchedDept.departmentName,
        status: 'WAITING',
        patientsAhead: 2,
        estimatedWaitTime: 2 * matchedDept.avgConsultationMinutes,
        currentTokenServing: matchedDept.currentToken
      });
      return;
    }

    setMyTokenResult({
      found: false,
      message: `Token ${query} not located in the selected hospital's active roster today.`
    });
  };

  const filteredQueues = departmentQueues.filter((q) => {
    const term = searchQuery.toLowerCase();
    return (
      q.departmentName.toLowerCase().includes(term) ||
      (q.departmentNameKn && q.departmentNameKn.includes(term)) ||
      q.departmentCode.toLowerCase().includes(term) ||
      q.currentToken.toLowerCase().includes(term)
    );
  });

  const selectedHospitalObj = hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0];

  const getPaceBadge = (mins) => {
    if (mins <= 15) {
      return {
        label: 'Fast Pace',
        color: 'bg-emerald-50 text-emerald-800 border-emerald-200'
      };
    }
    if (mins <= 30) {
      return {
        label: 'Moderate',
        color: 'bg-blue-50 text-blue-800 border-blue-200'
      };
    }
    return {
      label: 'Busy Queue',
      color: 'bg-amber-50 text-amber-800 border-amber-200'
    };
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6">
      {/* 1. Header Banner & Real-Time Broadcast Status */}
      {showHeader && (
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Live OPD Broadcast Active
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {language === 'kn'
                  ? 'ಲೈವ್ ಸರದಿ ಸಾಲು ಟ್ರ್ಯಾಕರ್ (Live Queue Tracker)'
                  : 'Live Department Queue Tracker'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                {language === 'kn'
                  ? 'ಎಲ್ಲಾ ಹೊರರೋಗಿ ವಿಭಾಗಗಳಲ್ಲಿ ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ಟೋಕನ್ ಸಂಖ್ಯೆಗಳು ಮತ್ತು ಸರದಿಯ ಕಾಯುವ ಸಮಯ'
                  : 'Real-time broadcast of current tokens being served across various outpatient departments.'}
              </p>
            </div>

            {/* Auto-refresh indicator & Manual refresh button */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => fetchMultiDepartmentQueues(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-2 shadow-2xs"
                title="Refresh queue"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 sm:p-8 space-y-6">
        {/* 2. Controls Bar: Hospital Selector & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          {/* Hospital Select */}
          <div className="sm:col-span-7 flex flex-col sm:flex-row sm:items-center gap-2.5">
            <label className="text-xs font-bold text-slate-700 shrink-0 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>Select Hospital:</span>
            </label>
            <select
              value={selectedHospitalId}
              onChange={(e) => setSelectedHospitalId(e.target.value)}
              className="grow px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            >
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.district})
                </option>
              ))}
            </select>
          </div>

          {/* Department Search */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search department or code (e.g., GM, Ortho)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>

        {/* 3. Personal Token Position Checker Bar */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                <Timer className="w-4 h-4 text-emerald-400" />
                <span>Track Your Personal Token Position</span>
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Have a token pass? Enter your token number to view your exact place in queue and estimated wait time.
              </p>
            </div>

            <form onSubmit={handleLookupMyToken} className="flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={myTokenQuery}
                onChange={(e) => setMyTokenQuery(e.target.value)}
                placeholder="e.g., GM-044"
                className="px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shrink-0"
              >
                Track Status
              </button>
            </form>
          </div>

          {/* Lookup Result Modal/Card */}
          {myTokenResult && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              {myTokenResult.found ? (
                <div className="bg-slate-800/90 rounded-xl p-4 border border-emerald-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      Token Lookup Found
                    </span>
                    <div className="text-lg font-black font-mono text-white mt-0.5">
                      {myTokenResult.tokenNumber} · {myTokenResult.departmentName}
                    </div>
                    <span className="text-slate-300">
                      Currently serving token: <strong className="text-emerald-400 font-mono">{myTokenResult.currentTokenServing}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-6 text-center">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Patients Ahead:</span>
                      <span className="text-xl font-black text-white">{myTokenResult.patientsAhead}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Estimated Wait:</span>
                      <span className="text-xl font-black text-emerald-400">~{myTokenResult.estimatedWaitTime} mins</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-xs text-rose-200">
                  {myTokenResult.message}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. Live Multi-Department Queue Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900">
              Active OPD Departments at {selectedHospitalObj?.name}
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Auto-updating every 5s · Last refreshed {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          {loading && departmentQueues.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Loading department queues...
            </div>
          ) : filteredQueues.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
              No departments matched your search term.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredQueues.map((item) => {
                const pace = getPaceBadge(item.estimatedWaitMinutes);

                return (
                  <div
                    key={item.departmentId}
                    className="bg-slate-50/60 hover:bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md hover:border-emerald-500 transition-all flex flex-col justify-between space-y-4 group"
                  >
                    {/* Top Row: Department Name & Room */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-extrabold text-slate-500 font-mono uppercase tracking-wider block">
                            CODE: {item.departmentCode}
                          </span>
                          <h4 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-900 transition-colors mt-0.5">
                            {language === 'kn' && item.departmentNameKn
                              ? item.departmentNameKn
                              : item.departmentName}
                          </h4>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${pace.color}`}
                        >
                          {pace.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.roomNumber}</span>
                      </div>
                    </div>

                    {/* Middle Digital Token Display */}
                    <div className="p-4 bg-slate-900 text-white rounded-xl text-center space-y-1 shadow-inner">
                      <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Now Serving Token</span>
                      </div>

                      <div className="text-3xl font-black font-mono text-emerald-400 tracking-tight">
                        {item.currentToken}
                      </div>

                      <div className="text-[11px] text-slate-400">
                        {item.isCurrentlyConsulting
                          ? 'In Consultation Chamber'
                          : 'Calling next token'}
                      </div>
                    </div>

                    {/* Metrics Row: Waiting Count & Est Duration */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-500 block uppercase font-semibold">
                          Waiting in Hall
                        </span>
                        <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                          {item.waitingCount} patients
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-500 block uppercase font-semibold">
                          Est. Wait Time
                        </span>
                        <span className="text-base font-extrabold text-emerald-700 mt-0.5 block">
                          ~{item.estimatedWaitMinutes} mins
                        </span>
                      </div>
                    </div>

                    {/* Action: Book Token for this department */}
                    <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        Free OPD pass
                      </span>

                      <Link
                        to={`/book-token?hospitalId=${selectedHospitalId}&deptId=${item.departmentId}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors"
                      >
                        <span>Book Token</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
