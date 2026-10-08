import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope,
  Search,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Compass
} from 'lucide-react';
import { api } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function DepartmentsPage() {
  const { t, language } = useLanguage();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.getDepartments();
      setDepartments(res.data || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDepts = departments.filter((dept) => {
    const q = search.toLowerCase();
    const matchesName =
      dept.name.toLowerCase().includes(q) ||
      (dept.nameKn && dept.nameKn.includes(q)) ||
      dept.code.toLowerCase().includes(q);
    const matchesSymptom = dept.symptoms?.some((s) => s.toLowerCase().includes(q));
    return matchesName || matchesSymptom;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
          Clinical Services
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
          {language === 'kn' ? 'ಆಸ್ಪತ್ರೆಯ ಹೊರರೋಗಿ ವಿಭಾಗಗಳು (OPD)' : 'Hospital OPD Departments & Specialties'}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {language === 'kn'
            ? 'ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗೆ ಅನುಗುಣವಾಗಿ ಸೂಕ್ತ ವಿಭಾಗವನ್ನು ಆರಿಸಿ ಮತ್ತು ಟೋಕನ್ ಕಾಯ್ದಿರಿಸಿ.'
            : 'Find the appropriate outpatient department mapped to specific symptoms and healthcare needs.'}
        </p>
      </div>

      {/* Symptom Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              language === 'kn'
                ? 'ವಿಭಾಗ ಅಥವಾ ರೋಗಲಕ್ಷಣದ ಮೂಲಕ ಹುಡುಕಿ (ಉದಾ: ಕೀಲು ನೋವು, ಜ್ವರ, ಕಣ್ಣು)...'
                : 'Search departments by symptom keyword (e.g. fever, fracture, pregnancy, cough)...'
            }
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden"
          />
        </div>
      </div>

      {/* Departments Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-sm">
          Loading departments directory...
        </div>
      ) : filteredDepts.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-slate-200 p-8 space-y-3">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-slate-800">No Matching Departments</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching for another symptom or use our AI Health Assistant for guidance.
          </p>
          <Link
            to="/ai-assistant"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI Assistant</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepts.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-400 block">
                      TOKEN CODE: {dept.code}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                      {language === 'kn' ? dept.nameKn : dept.name}
                    </h3>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                    ~{dept.avgConsultationMinutes} min/patient
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {dept.description}
                </p>

                {/* Common Symptoms Handled */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Common Issues Handled:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {dept.symptoms?.map((symp, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200 text-[11px]"
                      >
                        {symp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/hospital-navigator?dept=${dept.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
                >
                  <Compass className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'kn' ? 'ನಕ್ಷೆಯಲ್ಲಿ ನೋಡಿ' : 'Floor Plan'}</span>
                </Link>
                <Link
                  to={`/book-token?deptId=${dept.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs rounded-lg transition-colors shadow-2xs"
                >
                  <span>Book Token</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
