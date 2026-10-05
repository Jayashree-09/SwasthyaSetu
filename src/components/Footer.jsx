import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, HeartHandshake, PhoneCall } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Footer() {
  const { language, t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Identity & Govt Attribution */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                <span>ಸ್ವ</span>
              </div>
              <span className="font-bold text-lg text-white">SwasthyaSetu</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('tagline')}
            </p>
            <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Ayushman Bharat - Arogya Karnataka (AB-ArK) Integrated</span>
            </div>
          </div>

          {/* Column 2: Citizen Services */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Citizen Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/book-token" className="hover:text-emerald-400 transition-colors">
                  Generate OPD Token Online
                </Link>
              </li>
              <li>
                <Link to="/live-queue" className="hover:text-emerald-400 transition-colors">
                  Track Live Waiting Queue
                </Link>
              </li>
              <li>
                <Link to="/hospitals" className="hover:text-emerald-400 transition-colors">
                  Find Karnataka Govt Hospitals
                </Link>
              </li>
              <li>
                <Link to="/departments" className="hover:text-emerald-400 transition-colors">
                  Hospital Departments Directory
                </Link>
              </li>
              <li>
                <Link to="/ai-assistant" className="hover:text-emerald-400 transition-colors">
                  AI Symptom-to-OPD Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Helplines & Emergency */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Toll-Free Helplines
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded bg-slate-800 border border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-400">108 Emergency</span>
                  <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">24x7 Ambulance & Life-Threatening Casualty</p>
              </div>

              <div className="p-2.5 rounded bg-slate-800 border border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-400">104 Arogya Vani</span>
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Free Medical Consultation & Grievances</p>
              </div>
            </div>
          </div>

          {/* Column 4: Important Rules */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              OPD Timings & Rules
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>• General OPD: 8:30 AM - 1:30 PM (Mon-Sat)</li>
              <li>• Casualty / Emergency: 24 Hours Open</li>
              <li>• Consultation Fee: Free for BPL & APL Cardholders</li>
              <li>• Present digital token at express counter 15 mins prior to slot</li>
            </ul>
            <div className="mt-3">
              <Link to="/about" className="text-xs text-emerald-400 hover:underline">
                Read all hospital guidelines →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>{t('copyright')}</p>
          <p className="text-[11px] text-slate-400">
            {language === 'kn'
              ? 'ಸರ್ಕಾರಿ ಆರೋಗ್ಯ ಸೇವೆಗಳನ್ನು ಡಿಜಿಟಲೀಕರಣಗೊಳಿಸುವ ಅಧಿಕೃತ ವೇದಿಕೆ'
              : 'Official Karnataka Government Healthcare Queue Portal'}
          </p>
        </div>
      </div>
    </footer>
  );
}
