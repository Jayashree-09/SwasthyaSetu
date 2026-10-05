import React from 'react';
import { PhoneCall, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function EmergencyBanner() {
  const { t } = useLanguage();

  return (
    <div className="bg-rose-900 text-rose-50 border-b border-rose-800 text-sm px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" aria-hidden="true" />
          <p className="font-medium text-xs sm:text-sm leading-tight text-rose-100">
            {t('emergencyNotice')}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="tel:108"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-slate-950 font-bold text-xs rounded hover:bg-amber-300 transition-colors shadow-sm"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>108</span>
          </a>
          <a
            href="tel:104"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-800 text-rose-100 font-semibold text-xs rounded hover:bg-rose-700 transition-colors"
          >
            <span>104 Health Helpline</span>
          </a>
        </div>
      </div>
    </div>
  );
}
