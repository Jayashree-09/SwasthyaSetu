import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Clock,
  Phone,
  Calendar,
  AlertTriangle,
  User,
  Stethoscope,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function HospitalDetailPage() {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHospital();
  }, [id]);

  const fetchHospital = async () => {
    setLoading(true);
    try {
      const res = await api.getHospitalById(id);
      setHospital(res.data);
    } catch (err) {
      console.error('Failed to load hospital details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 text-sm">
        Loading hospital profile...
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <h2 className="text-xl font-bold text-slate-800">Hospital Not Found</h2>
        <Link to="/hospitals" className="text-emerald-700 font-semibold text-sm underline">
          Back to hospitals directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="text-xs text-slate-500 flex items-center gap-1.5">
        <Link to="/hospitals" className="hover:text-slate-900">
          Hospitals
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">{hospital.name}</span>
      </div>

      {/* Hospital Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
              {hospital.type} · Government of Karnataka
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {language === 'kn' ? hospital.nameKn : hospital.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                {hospital.address}, {hospital.taluk}, {hospital.district} - {hospital.pincode}
              </span>
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-700">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>OPD Hours: {hospital.opdHours}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Helpdesk: {hospital.contactNumber}</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-700 font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>24x7 Emergency: {hospital.emergencyNumber}</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col gap-2.5">
            <Link
              to={`/book-token?hospitalId=${hospital.id}`}
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-xl shadow-sm text-center transition-colors"
            >
              Book OPD Token
            </Link>
            <Link
              to={`/live-queue?hospitalId=${hospital.id}`}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl text-center transition-colors"
            >
              Check Live Queue
            </Link>
          </div>
        </div>

        {/* Facilities list */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Available Hospital Facilities & Services
          </h4>
          <div className="flex flex-wrap gap-2 text-xs">
            {hospital.facilities?.map((facility, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-100 font-medium"
              >
                ✓ {facility}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* OPD Departments in this hospital */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {language === 'kn' ? 'ಆಸ್ಪತ್ರೆಯ ಒಪಿಡಿ ವಿಭಾಗಗಳು' : 'OPD Departments & Token Counters'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a department to view available doctors, schedules, or directly book a digital token.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hospital.departmentDetails?.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-emerald-600 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    CODE: {dept.code}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    ~{dept.avgConsultationMinutes} min/patient
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900">
                  {language === 'kn' ? dept.nameKn : dept.name}
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                  {dept.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Counter Active
                </span>
                <Link
                  to={`/book-token?hospitalId=${hospital.id}&deptId=${dept.id}`}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors"
                >
                  Book Token
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hospital Doctors List */}
      {hospital.doctors && hospital.doctors.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {language === 'kn' ? 'ವೈದ್ಯರ ಮಾಹಿತಿ ಮತ್ತು ವೇಳಾಪಟ್ಟಿ' : 'Duty Doctors & OPD Schedule'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Government doctors assigned to outpatient consultation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hospital.doctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="grow space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">
                      {language === 'kn' ? doc.nameKn : doc.name}
                    </h4>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {doc.status}
                    </span>
                  </div>
                  <p className="text-slate-600">{doc.qualification}</p>
                  <p className="text-slate-500">
                    {doc.roomNumber} · {doc.opdHours}
                  </p>
                  <div className="pt-1 text-[11px] text-slate-400">
                    OPD Days: {doc.opdDays.join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
