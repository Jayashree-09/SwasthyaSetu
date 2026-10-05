import React from 'react';
import { ShieldCheck, PhoneCall, Clock, HelpCircle, FileCheck, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function AboutPage() {
  const { t, language } = useLanguage();

  const faqs = [
    {
      q: language === 'kn' ? 'ಸ್ವಾಸ್ಥ್ಯಸೇತು ಮೂಲಕ ಟೋಕನ್ ಪಡೆಯಲು ಶುಲ್ಕವಿದೆಯೇ?' : 'Is there any fee to generate an OPD token online?',
      a: language === 'kn'
        ? 'ಇಲ್ಲ, ಸ್ವಾಸ್ಥ್ಯಸೇತು ಮೂಲಕ ಒಪಿಡಿ ಟೋಕನ್ ಪಡೆಯುವುದು ಸಂಪೂರ್ಣ ಉಚಿತವಾಗಿದೆ. ಆರೋಗ್ಯ ಕರ್ನಾಟಕ ಮತ್ತು ಆಯುಷ್ಮಾನ್ ಭಾರತ್ ಯೋಜನೆಯಡಿ ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆಗಳ ಒಪಿಡಿ ನೋಂದಣಿ ಉಚಿತವಾಗಿದೆ.'
        : 'No, digital token generation on SwasthyaSetu is 100% free of cost under the Government of Karnataka Health Mission.'
    },
    {
      q: language === 'kn' ? 'ಆಸ್ಪತ್ರೆಗೆ ಎಷ್ಟು ಗಂಟೆಗೆ ಹೋಗಬೇಕು?' : 'When should I arrive at the hospital?',
      a: language === 'kn'
        ? 'ನಿಮ್ಮ ಟೋಕನ್‌ನಲ್ಲಿ ನಮೂದಿಸಲಾದ ಸಮಯಕ್ಕಿಂತ 15 ನಿಮಿಷ ಮುಂಚಿತವಾಗಿ ಡಿಜಿಟಲ್ ಎಕ್ಸ್‌ಪ್ರೆಸ್ ಕೌಂಟರ್‌ಗೆ ತಲುಪಿ. ಲೈವ್ ಕ್ಯೂ ಪರಿಶೀಲಿಸಿ ನಿಮ್ಮ ಸರದಿ ಗಮನಿಸಿ.'
        : 'Please report to the Digital Express Registration Counter at least 15 minutes before your slot. You can check the Live Queue board to monitor queue movement.'
    },
    {
      q: language === 'kn' ? 'ತುರ್ತು ಪರಿಸ್ಥಿತಿಯಲ್ಲಿ ಟೋಕನ್ ಪಡೆಯಬೇಕೇ?' : 'Should I book an online token during an emergency?',
      a: language === 'kn'
        ? 'ಖಂಡಿತಾ ಇಲ್ಲ! ಎದೆ ನೋವು, ತೀವ್ರ ಉಸಿರಾಟದ ತೊಂದರೆ, ಹಾವು ಕಡಿತ ಅಥವಾ ಅಪಘಾತದಂತಹ ತುರ್ತು ಸಂದರ್ಭಗಳಲ್ಲಿ ಆನ್‌ಲೈನ್ ಟೋಕನ್‌ಗಾಗಿ ಕಾಯದೆ ತಕ್ಷಣ 108 ಆಂಬ್ಯುಲೆನ್ಸ್‌ಗೆ ಕರೆ ಮಾಡಿ ಅಥವಾ ನೇರವಾಗಿ 24x7 ತುರ್ತು ವಿಭಾಗಕ್ಕೆ (Casualty) ತೆರಳಿ.'
        : 'CRITICAL: In case of acute emergencies, severe trauma, chest pain, or snakebites, DO NOT wait for an OPD token. Immediately dial 108 or proceed directly to the 24x7 Casualty/Emergency entrance.'
    },
    {
      q: language === 'kn' ? 'ಯಾವ ದಾಖಲೆಗಳನ್ನು ತೆಗೆದುಕೊಂಡು ಹೋಗಬೇಕು?' : 'What documents should I carry to the hospital?',
      a: language === 'kn'
        ? 'ಆಧಾರ್ ಕಾರ್ಡ್, ರೇಷನ್ ಕಾರ್ಡ್ (BPL/APL) ಅಥವಾ ನಿಮ್ಮ ಆಭಾ (ABHA) ಹೆಲ್ತ್ ಐಡಿ ಕಾರ್ಡ್ ತೆಗೆದುಕೊಂಡು ಹೋಗಿ.'
        : 'Carry your Aadhaar card, Ration card, or ABHA Health ID for quick verification and free medicine dispensation at Jan Aushadhi counters.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* Hero header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
          Government of Karnataka Healthcare Initiative
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          About SwasthyaSetu
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          SwasthyaSetu is designed to modernize outpatient care in Karnataka's government hospitals, reducing patient waiting times, preventing dawn queues at hospital gates, and providing AI-guided clinical navigation for rural and urban citizens.
        </p>
      </div>

      {/* OPD Rules & Hospital Timings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <Clock className="w-5 h-5 shrink-0" />
            <span>Karnataka Government OPD Timings</span>
          </div>
          <ul className="text-xs text-slate-600 space-y-2 pt-1">
            <li className="flex items-start gap-1.5">
              <span className="font-semibold text-slate-800 min-w-32">Morning OPD:</span>
              <span>8:30 AM – 1:30 PM (Monday to Saturday)</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-semibold text-slate-800 min-w-32">Afternoon Follow-up:</span>
              <span>2:00 PM – 4:00 PM (Selected Taluk/District Hospitals)</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-semibold text-slate-800 min-w-32">Casualty & Emergency:</span>
              <span className="text-rose-700 font-semibold">24 Hours / 7 Days Open</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="font-semibold text-slate-800 min-w-32">Free Pharmacy:</span>
              <span>Open during all OPD operating hours</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span>Ayushman Bharat - Arogya Karnataka (AB-ArK)</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            All Karnataka government hospitals provide cashless outpatient consultations, essential diagnostics (blood routines, digital X-rays, ECGs), and free generic medicines under the Jan Aushadhi mission.
          </p>
          <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
            <span className="px-2.5 py-1 rounded bg-slate-100 font-medium text-slate-700">Free BPL Care</span>
            <span className="px-2.5 py-1 rounded bg-slate-100 font-medium text-slate-700">Subsidized APL</span>
            <span className="px-2.5 py-1 rounded bg-slate-100 font-medium text-slate-700">ABHA Health ID</span>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-4">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900">
            Frequently Asked Questions (FAQ)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Common questions regarding tokens, queues, and hospital visits.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-1.5">
              <h4 className="font-bold text-sm text-slate-900">{faq.q}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
