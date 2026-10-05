import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Phone,
  Clock,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function HospitalsPage() {
  const { t, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [district, setDistrict] = useState(searchParams.get('district') || 'all');
  const [taluk, setTaluk] = useState(searchParams.get('taluk') || 'all');
  const [selectedDept, setSelectedDept] = useState(searchParams.get('dept') || 'all');

  const districtsList = [
    'Bengaluru Urban',
    'Mysuru',
    'Kodagu',
    'Dakshina Kannada',
    'Belagavi',
    'Ballari'
  ];

  useEffect(() => {
    fetchHospitals();
  }, [district, taluk, selectedDept]);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const params = {};
      if (district !== 'all') params.district = district;
      if (taluk !== 'all') params.taluk = taluk;
      if (selectedDept !== 'all') params.department = selectedDept;
      if (search.trim()) params.search = search.trim();

      const res = await api.getHospitals(params);
      setHospitals(res.data || []);
    } catch (err) {
      console.error('Failed to load hospitals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHospitals();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
          Directory & OPD Schedules
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
          {language === 'kn' ? 'ಕರ್ನಾಟಕ ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆಗಳು' : 'Karnataka Government Hospitals'}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {language === 'kn'
            ? 'ತಾಲೂಕು, ಜಿಲ್ಲಾ ಮತ್ತು ಸರ್ಕಾರಿ ವೈದ್ಯಕೀಯ ಕಾಲೇಜು ಆಸ್ಪತ್ರೆಗಳನ್ನು ಹುಡುಕಿ ಮತ್ತು ಒಪಿಡಿ ಟೋಕನ್ ಕಾಯ್ದಿರಿಸಿ.'
            : 'Find Taluk Hospitals, District Hospitals, and Medical Colleges with real-time OPD token status.'}
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative grow">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchHospitalPlaceholder')}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:bg-white focus:outline-hidden"
            >
              <option value="all">{t('selectDistrict')}</option>
              {districtsList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs rounded-lg transition-colors shadow-2xs"
            >
              Filter
            </button>
          </div>
        </form>

        {/* Quick district tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pt-1 pb-0.5">
          <span className="text-slate-400 text-[11px] shrink-0 font-medium">Quick District:</span>
          <button
            onClick={() => setDistrict('all')}
            className={`px-2.5 py-1 rounded text-xs transition-colors shrink-0 ${
              district === 'all'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {districtsList.map((d) => (
            <button
              key={d}
              onClick={() => setDistrict(d)}
              className={`px-2.5 py-1 rounded text-xs transition-colors shrink-0 ${
                district === d
                  ? 'bg-emerald-700 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Hospital List Results */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-sm">
          Loading government hospital data...
        </div>
      ) : hospitals.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-slate-200 p-8 space-y-3">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-slate-800">No Hospitals Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or reset filters to view all Karnataka hospitals.
          </p>
          <button
            onClick={() => {
              setDistrict('all');
              setSearch('');
            }}
            className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hospitals.map((hosp) => (
            <div
              key={hosp.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider block">
                      {hosp.type}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {language === 'kn' ? hosp.nameKn : hosp.name}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                    OPD Open
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {hosp.address}, {hosp.taluk}, {hosp.district} - {hosp.pincode}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>OPD Hours: {hosp.opdHours}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Helpdesk: {hosp.contactNumber} · Emergency: {hosp.emergencyNumber}
                    </span>
                  </div>
                </div>

                {/* Facilities tags */}
                <div className="pt-2 flex flex-wrap gap-1 text-[11px] text-slate-600">
                  {hosp.facilities?.slice(0, 4).map((f, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-slate-100 text-slate-700"
                    >
                      {f}
                    </span>
                  ))}
                  {hosp.facilities?.length > 4 && (
                    <span className="px-1.5 py-0.5 text-slate-400">
                      +{hosp.facilities.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <Link
                  to={`/hospitals/${hosp.id}`}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-900"
                >
                  View Details & Doctors →
                </Link>

                <Link
                  to={`/book-token?hospitalId=${hosp.id}`}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs rounded-lg shadow-2xs transition-colors"
                >
                  Book OPD Token
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
