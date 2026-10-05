import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Play,
  Check,
  UserX,
  PlusCircle,
  Clock,
  Radio,
  RefreshCw,
  Search
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function StaffDashboard() {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [selectedHospitalId, setSelectedHospitalId] = useState(
    user?.hospitalId || 'hosp-01'
  );
  const [selectedDeptId, setSelectedDeptId] = useState('dept-gm');

  const [departments, setDepartments] = useState([]);
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Walk-in Quick Token Modal / Drawer
  const [walkinOpen, setWalkinOpen] = useState(false);
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinAge, setWalkinAge] = useState('');
  const [walkinGender, setWalkinGender] = useState('Male');
  const [walkinPriority, setWalkinPriority] = useState('NORMAL');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  useEffect(() => {
    loadDepts();
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [selectedHospitalId, selectedDeptId]);

  const loadDepts = async () => {
    try {
      const res = await api.getDepartments();
      setDepartments(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await api.getQueue(selectedHospitalId, selectedDeptId);
      setQueueData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const executeAction = async (action, tokenId = null) => {
    try {
      const res = await api.queueAction({
        hospitalId: selectedHospitalId,
        departmentId: selectedDeptId,
        action,
        tokenId,
        staffName: user?.fullName || 'Staff'
      });
      setActionSuccessMsg(res.message);
      setTimeout(() => setActionSuccessMsg(''), 4000);
      fetchQueue();
    } catch (err) {
      alert('Error updating queue: ' + err.message);
    }
  };

  const handleWalkinSubmit = async (e) => {
    e.preventDefault();
    if (!walkinName.trim() || !walkinPhone.trim()) return;

    try {
      await api.createToken({
        patientName: walkinName.trim(),
        patientPhone: walkinPhone.trim(),
        patientAge: parseInt(walkinAge, 10) || 35,
        patientGender: walkinGender,
        hospitalId: selectedHospitalId,
        departmentId: selectedDeptId,
        priority: walkinPriority,
        symptoms: 'Counter Walk-in OPD Registration'
      });

      setWalkinName('');
      setWalkinPhone('');
      setWalkinAge('');
      setWalkinOpen(false);
      setActionSuccessMsg('Walk-in token generated and queued successfully.');
      setTimeout(() => setActionSuccessMsg(''), 4000);
      fetchQueue();
    } catch (err) {
      alert('Failed to register walk-in token: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header with Counter Badge */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
            Hospital Staff Portal · Registration Counter Desk
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {user?.hospitalName || 'Victoria Hospital (BMCRI)'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operator: {user?.fullName || 'Sunitha K.'} · Desk: {user?.counterNumber || 'Counter 3 - General OPD'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setWalkinOpen(true)}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-2xs flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register Walk-in Patient</span>
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* OPD Department Selector & Quick Stats */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-700">Managing Department:</label>
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden"
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>

        {/* Global queue trigger: Call next */}
        <button
          onClick={() => executeAction('CALL_NEXT')}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-colors"
        >
          <Play className="w-4 h-4 text-emerald-400" />
          <span>Call Next Waiting Patient</span>
        </button>
      </div>

      {/* Live Queue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 uppercase font-semibold">Active Token</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {queueData?.currentToken?.tokenNumber || 'None'}
          </div>
          <span className="text-[11px] text-emerald-700 mt-1 block">
            {queueData?.currentToken ? queueData.currentToken.status : 'Idle'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 uppercase font-semibold">Waiting Count</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {queueData?.waitingCount || 0}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">In Waiting Hall</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 uppercase font-semibold">Completed Today</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {queueData?.completedCount || 0}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Seen by Doctor</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 uppercase font-semibold">Total Issued</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {queueData?.tokens?.length || 0}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Digital + Walk-in</span>
        </div>
      </div>

      {/* Interactive Queue Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900">
            Queue Action Console · {queueData?.departmentName}
          </h3>
          <span className="text-xs text-slate-400">Real-time sync</span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading queue records...</div>
        ) : !queueData?.tokens || queueData.tokens.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No patients registered for this department today.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Token #</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Age / Phone</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4 text-right">Staff Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queueData.tokens.map((tok) => (
                  <tr
                    key={tok.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      tok.status === 'CONSULTING' ? 'bg-emerald-50/50 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {tok.tokenNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-800">{tok.patientName}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {tok.patientAge} Yrs · {tok.patientPhone}
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
                    <td className="py-3 px-4">
                      {tok.priority === 'EMERGENCY' ? (
                        <span className="font-bold text-rose-600">EMERGENCY</span>
                      ) : (
                        <span className="text-slate-500">Normal</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {tok.status === 'CALLED' && (
                          <button
                            onClick={() => executeAction('START_CONSULT', tok.id)}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-medium"
                          >
                            Start Consult
                          </button>
                        )}

                        {tok.status === 'CONSULTING' && (
                          <button
                            onClick={() => executeAction('COMPLETE', tok.id)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-[11px] font-medium"
                          >
                            Mark Complete
                          </button>
                        )}

                        {(tok.status === 'WAITING' || tok.status === 'CALLED') && (
                          <>
                            <button
                              onClick={() => executeAction('NO_SHOW', tok.id)}
                              className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded text-[11px]"
                              title="Patient absent"
                            >
                              No-Show
                            </button>
                            {tok.priority !== 'EMERGENCY' && (
                              <button
                                onClick={() => executeAction('EMERGENCY_PRIORITY', tok.id)}
                                className="px-2 py-1 text-rose-700 hover:bg-rose-50 rounded text-[11px] font-semibold"
                                title="Prioritize urgent case"
                              >
                                Urgent Priority
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Walk-in Registration Modal */}
      {walkinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">
              Counter Walk-In Patient Registration
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Issue an instant token for a rural patient arriving physically at the counter.
            </p>

            <form onSubmit={handleWalkinSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  placeholder="e.g. Somanna Gowda"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={walkinAge}
                    onChange={(e) => setWalkinAge(e.target.value)}
                    placeholder="e.g. 58"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={walkinGender}
                    onChange={(e) => setWalkinGender(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={walkinPriority}
                  onChange={(e) => setWalkinPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                >
                  <option value="NORMAL">Normal Queue</option>
                  <option value="EMERGENCY">Emergency / Priority</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setWalkinOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-sm"
                >
                  Issue Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
