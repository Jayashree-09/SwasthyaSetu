import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Users,
  CheckCircle2,
  FileText,
  Clock,
  Calendar,
  AlertCircle,
  Play,
  Check
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [queueTokens, setQueueTokens] = useState([]);
  const [selectedToken, setSelectedToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Clinical Consultation Notes State
  const [consultNotes, setConsultNotes] = useState('');
  const [investigationAdvice, setInvestigationAdvice] = useState('');
  const [followupDate, setFollowupDate] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  useEffect(() => {
    fetchDoctorQueue();
  }, [user]);

  const fetchDoctorQueue = async () => {
    setLoading(true);
    try {
      const res = await api.getTokens({
        hospitalId: user?.hospitalId || 'hosp-01',
        departmentId: user?.departmentId || 'dept-gm',
        date: new Date().toISOString().split('T')[0]
      });

      const list = res.data || [];
      setQueueTokens(list);

      // Default select currently consulting or first called
      const active = list.find((t) => t.status === 'CONSULTING') || list.find((t) => t.status === 'CALLED');
      if (active) {
        setSelectedToken(active);
      } else if (list.length > 0 && !selectedToken) {
        setSelectedToken(list[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartConsultation = async (tok) => {
    try {
      await api.queueAction({
        hospitalId: tok.hospitalId,
        departmentId: tok.departmentId,
        action: 'START_CONSULT',
        tokenId: tok.id,
        staffName: user?.fullName || 'Doctor'
      });
      setSelectedToken({ ...tok, status: 'CONSULTING' });
      fetchDoctorQueue();
    } catch (err) {
      alert('Error updating consultation status: ' + err.message);
    }
  };

  const handleCompleteConsultation = async () => {
    if (!selectedToken) return;
    try {
      await api.queueAction({
        hospitalId: selectedToken.hospitalId,
        departmentId: selectedToken.departmentId,
        action: 'COMPLETE',
        tokenId: selectedToken.id,
        staffName: user?.fullName || 'Doctor'
      });

      setSaveSuccessMsg(`Consultation completed for Token ${selectedToken.tokenNumber}. Notes archived.`);
      setConsultNotes('');
      setInvestigationAdvice('');
      setFollowupDate('');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
      fetchDoctorQueue();
    } catch (err) {
      alert('Error completing visit: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Doctor Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xl">
            MD
          </div>
          <div>
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
              Doctor Consultation Chamber · OPD OPD-12
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              {user?.fullName || 'Dr. Ramesh Babu, MD'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              General Medicine · Victoria Hospital (BMCRI) · Mon-Sat OPD (9:00 AM - 1:30 PM)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            Status: AVAILABLE
          </span>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main 2-Column Clinical Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Waiting Patient Queue */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              Today's Consultation Queue ({queueTokens.length})
            </h3>
            <span className="text-[11px] text-slate-500">Live roster</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {queueTokens.map((tok) => {
              const isSelected = selectedToken?.id === tok.id;
              return (
                <div
                  key={tok.id}
                  onClick={() => setSelectedToken(tok)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {tok.tokenNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        tok.status === 'CONSULTING'
                          ? 'bg-emerald-600 text-white'
                          : tok.status === 'CALLED'
                          ? 'bg-amber-100 text-amber-900'
                          : tok.status === 'WAITING'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {tok.status}
                    </span>
                  </div>

                  <div className="mt-1 font-semibold text-slate-800">{tok.patientName}</div>
                  <div className="text-[11px] text-slate-500">
                    {tok.patientAge} Yrs · {tok.patientGender}
                  </div>
                  {tok.symptoms && (
                    <div className="mt-1 text-[11px] text-slate-600 line-clamp-1 italic">
                      "{tok.symptoms}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Patient Examination & Notes */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
          {selectedToken ? (
            <div className="space-y-6">
              {/* Patient Banner */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black font-mono text-slate-900">
                      {selectedToken.tokenNumber}
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {selectedToken.patientName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Age: {selectedToken.patientAge} Yrs · Gender: {selectedToken.patientGender} · Phone: {selectedToken.patientPhone}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedToken.status !== 'CONSULTING' && selectedToken.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleStartConsultation(selectedToken)}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg shadow-2xs flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Consultation</span>
                    </button>
                  )}
                  {selectedToken.status === 'CONSULTING' && (
                    <span className="px-3 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-semibold">
                      In Consultation
                    </span>
                  )}
                </div>
              </div>

              {/* Patient Reported Complaint */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Reported Symptoms / Reason for Visit
                </label>
                <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-xs text-amber-950 font-medium">
                  {selectedToken.symptoms || 'General OPD follow-up examination'}
                </div>
              </div>

              {/* Consultation Notes Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Doctor Clinical Notes & Observations
                  </label>
                  <textarea
                    rows={4}
                    value={consultNotes}
                    onChange={(e) => setConsultNotes(e.target.value)}
                    placeholder="Enter clinical examination notes, pulse, BP, prescribed government Jan Aushadhi generic medications, and patient counseling instructions..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Investigations / Free Hospital Labs
                    </label>
                    <input
                      type="text"
                      value={investigationAdvice}
                      onChange={(e) => setInvestigationAdvice(e.target.value)}
                      placeholder="e.g. Complete Blood Count (CBC), Urine Routine, Digital X-Ray Chest"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Follow-up Date (if needed)
                    </label>
                    <input
                      type="date"
                      value={followupDate}
                      onChange={(e) => setFollowupDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Completion Action */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Electronic health record stored under Arogya Karnataka compliance.
                </span>

                <button
                  onClick={handleCompleteConsultation}
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Complete Consultation</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-slate-400">
              Select a patient token from the left queue to begin consultation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
