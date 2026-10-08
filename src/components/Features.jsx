import React from 'react';
import {
  Clock,
  Stethoscope,
  Languages,
  QrCode,
  ShieldCheck,
  Mic,
  ArrowRight,
  CheckCircle2,
  Users,
  BellRing
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Features() {
  const { language } = useLanguage();

  const featureCards = [
    {
      icon: Clock,
      title: language === 'kn' ? 'ಲೈವ್ ಸರದಿ ಸಾಲು ಪರಿಶೀಲನೆ' : 'Real-Time Queue Tracking',
      kicker: language === 'kn' ? 'ನಿಖರ ಕಾಯುವ ಸಮಯ' : 'Live OPD Progression',
      description: language === 'kn'
        ? 'ಆಸ್ಪತ್ರೆಯ ಹೊರರೋಗಿ ವಿಭಾಗದಲ್ಲಿ ಪ್ರಸ್ತುತ ಯಾವ ಸಂಖ್ಯೆಯ ರೋಗಿಯನ್ನು ವೈದ್ಯರು ನೋಡುತ್ತಿದ್ದಾರೆ ಮತ್ತು ನಿಮ್ಮ ಸರದಿ ಯಾವಾಗ ಎಂದು ಮೊಬೈಲ್‌ನಲ್ಲೇ ಲೈವ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.'
        : 'Monitor which token is currently consulting in real-time, see how many patients are ahead of you, and arrive only when your slot is near.',
      accent: 'emerald',
      link: '/live-queue',
      linkText: language === 'kn' ? 'ಸರದಿ ವೀಕ್ಷಿಸಿ' : 'Track Queue'
    },
    {
      icon: Stethoscope,
      title: language === 'kn' ? 'ವಿಭಾಗವಾರು ಆರೋಗ್ಯ ಮಾರ್ಗದರ್ಶನ' : 'Department-Wise Guidance',
      kicker: language === 'kn' ? 'ರೋಗಲಕ್ಷಣ ಆಧಾರಿತ ವಿಭಾಗ' : 'Clinical Routing Assistance',
      description: language === 'kn'
        ? 'ಜನರಲ್ ಮೆಡಿಸಿನ್, ಪೀಡಿಯಾಟ್ರಿಕ್ಸ್, ಆರ್ಥೋಪೆಡಿಕ್ಸ್, ಪ್ರಸೂತಿ ಮತ್ತು ಸ್ತ್ರೀರೋಗ ಸೇರಿದಂತೆ 11+ ವಿಭಾಗಗಳಿಗೆ ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳ ಆಧಾರದ ಮೇಲೆ ನಿಖರ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ.'
        : 'Confused about where to go? Get guided recommendations across 11+ hospital specialties based on your described symptoms and health complaints.',
      accent: 'blue',
      link: '/departments',
      linkText: language === 'kn' ? 'ವಿಭಾಗಗಳನ್ನು ನೋಡಿ' : 'Explore Departments'
    },
    {
      icon: Languages,
      title: language === 'kn' ? 'ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್ ಭಾಷಾ ಬೆಂಬಲ' : 'Bilingual Language Support',
      kicker: language === 'kn' ? 'ಗ್ರಾಮೀಣ ಸ್ನೇಹಿ ವೇದಿಕೆ' : 'Kannada & English Native',
      description: language === 'kn'
        ? 'ಕರ್ನಾಟಕದ ಪ್ರತಿಯೊಬ್ಬ ನಾಗರಿಕರಿಗೂ ಸುಲಭವಾಗುವಂತೆ ಸಂಪೂರ್ಣ ಪೋರ್ಟಲ್ ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್ ಎರಡೂ ಭಾಷೆಗಳಲ್ಲಿ ಸುಲಭವಾಗಿ ಲಭ್ಯವಿದೆ.'
        : 'Effortlessly switch between Kannada (ಕನ್ನಡ) and English with a single tap. Designed to be accessible and intuitive for all citizens across Karnataka.',
      accent: 'purple',
      link: '/ai-assistant',
      linkText: language === 'kn' ? 'ಎಐ ಸಹಾಯಕ' : 'Try Assistant'
    },
    {
      icon: QrCode,
      title: language === 'kn' ? 'ಡಿಜಿಟಲ್ ಒಪಿಡಿ ಟೋಕನ್' : 'Digital Token & QR Pass',
      kicker: language === 'kn' ? 'ಮುಂಜಾನೆ ಸರದಿ ಸಾಲು ಮುಕ್ತ' : 'Zero Dawn Gate Rush',
      description: language === 'kn'
        ? 'ಬೆಳಗಿನ ಜಾವ 5 ಗಂಟೆಯಿಂದಲೇ ಆಸ್ಪತ್ರೆಯ ಕೌಂಟರ್‌ನಲ್ಲಿ ಕಾಯುವುದನ್ನು ತಪ್ಪಿಸಿ. ಮನೆಯಿಂದಲೇ ಅಧಿಕೃತ ಕ್ಯೂ ಪಾಸ್ ಮತ್ತು ಕ್ಯೂಆರ್ ಕೋಡ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.'
        : 'Generate verified digital queue passes (e.g. GM-042) with QR codes. Scan at the hospital express counter and head directly to consultation.',
      accent: 'amber',
      link: '/book-token',
      linkText: language === 'kn' ? 'ಟೋಕನ್ ಪಡೆಯಿರಿ' : 'Book Token'
    },
    {
      icon: ShieldCheck,
      title: language === 'kn' ? '100% ಉಚಿತ ಆರೋಗ್ಯ ಸೇವೆ' : 'Free Arogya Karnataka Care',
      kicker: language === 'kn' ? 'ಸರ್ಕಾರಿ ಯೋಜನೆ ಸಂಯೋಜನೆ' : 'AB-ArK & Jan Aushadhi',
      description: language === 'kn'
        ? 'ಬಿಪಿಎಲ್ ಮತ್ತು ಎಪಿಎಲ್ ಕಾರ್ಡ್‌ದಾರರಿಗೆ ಉಚಿತ ಒಪಿಡಿ ಸಮಾಲೋಚನೆ, ರಕ್ತ ಪರೀಕ್ಷೆಗಳು, ಎಕ್ಸ್‌ರೇ ಮತ್ತು ಉಚಿತ ಜನೌಷಧಿ ಔಷಧಿಗಳು ಲಭ್ಯ.'
        : 'Zero registration fee. Free outpatient consultations, lab investigations, ultrasound, and essential medicines under government healthcare programs.',
      accent: 'emerald',
      link: '/about',
      linkText: language === 'kn' ? 'ನಿಯಮಗಳು ಓದಿ' : 'Read Scheme Rules'
    },
    {
      icon: Mic,
      title: language === 'kn' ? 'ಧ್ವನಿ ಸಂವಾದ ಬೆಂಬಲ' : 'Voice-First Accessibility',
      kicker: language === 'kn' ? 'ಹಿರಿಯ ನಾಗರಿಕರಿಗೆ ಸುಲಭ' : 'Elderly-Friendly Speech Input',
      description: language === 'kn'
        ? 'ಟೈಪ್ ಮಾಡುವ ಅಗತ್ಯವಿಲ್ಲ. ಮೈಕ್ರೋಫೋನ್ ಬಟನ್ ಒತ್ತಿ ಕನ್ನಡದಲ್ಲಿ ನೇರವಾಗಿ ಮಾತನಾಡಿ ರೋಗಲಕ್ಷಣ ಅಥವಾ ಆಸ್ಪತ್ರೆ ಮಾಹಿತಿ ಪಡೆಯಿರಿ.'
        : 'Speak symptoms directly into your phone microphone in Kannada or English. Receive voice-assisted guidance tailored for elderly users.',
      accent: 'rose',
      link: '/ai-assistant',
      linkText: language === 'kn' ? 'ಧ್ವನಿ ಮೂಲಕ ಮಾತನಾಡಿ' : 'Try Voice Search'
    }
  ];

  const getAccentStyles = (accent) => {
    switch (accent) {
      case 'emerald':
        return {
          iconBg: 'bg-emerald-50 text-emerald-800',
          badge: 'text-emerald-800 bg-emerald-50 border-emerald-100',
          link: 'text-emerald-700 hover:text-emerald-800'
        };
      case 'blue':
        return {
          iconBg: 'bg-blue-50 text-blue-800',
          badge: 'text-blue-800 bg-blue-50 border-blue-100',
          link: 'text-blue-700 hover:text-blue-800'
        };
      case 'purple':
        return {
          iconBg: 'bg-purple-50 text-purple-800',
          badge: 'text-purple-800 bg-purple-50 border-purple-100',
          link: 'text-purple-700 hover:text-purple-800'
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-50 text-amber-900',
          badge: 'text-amber-900 bg-amber-50 border-amber-100',
          link: 'text-amber-800 hover:text-amber-900'
        };
      case 'rose':
        return {
          iconBg: 'bg-rose-50 text-rose-800',
          badge: 'text-rose-800 bg-rose-50 border-rose-100',
          link: 'text-rose-700 hover:text-rose-800'
        };
      default:
        return {
          iconBg: 'bg-slate-50 text-slate-800',
          badge: 'text-slate-800 bg-slate-50 border-slate-100',
          link: 'text-emerald-700 hover:text-emerald-800'
        };
    }
  };

  return (
    <section className="py-12 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
            {language === 'kn' ? 'ಪ್ರಮುಖ ವೇದಿಕೆ ವೈಶಿಷ್ಟ್ಯಗಳು' : 'Core Platform Benefits'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {language === 'kn'
              ? 'ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆ ಸೇವೆಗಳನ್ನು ಸುಲಭ ಮತ್ತು ಪಾರದರ್ಶಕವಾಗಿಸುವ ಸೌಲಭ್ಯಗಳು'
              : 'Empowering Citizens With Transparent, Queue-Free Healthcare'}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {language === 'kn'
              ? 'ಲೈವ್ ಸರದಿ ಟ್ರ್ಯಾಕಿಂಗ್, ವಿಭಾಗವಾರು ಮಾರ್ಗದರ್ಶನ ಮತ್ತು ಸ್ಥಳೀಯ ಭಾಷಾ ಬೆಂಬಲದೊಂದಿಗೆ ಕರ್ನಾಟಕ ಸಾರ್ವಜನಿಕ ಆರೋಗ್ಯ ವ್ಯವಸ್ಥೆಯನ್ನು ಆಧುನೀಕರಿಸಲಾಗಿದೆ.'
              : 'Built for rural, semi-urban, and metropolitan government hospitals to eliminate counter congestion and respect patient time.'}
          </p>
        </div>

        {/* 6 Visual Icon Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((feat, idx) => {
            const Icon = feat.icon;
            const styles = getAccentStyles(feat.accent);

            return (
              <div
                key={idx}
                className="bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Icon & Kicker */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${styles.iconBg}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${styles.badge}`}
                    >
                      {feat.kicker}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-emerald-900 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {feat.desc || feat.description}
                    </p>
                  </div>
                </div>

                {/* Footer Action Link */}
                <div className="mt-6 pt-4 border-t border-slate-200/70 flex items-center justify-between">
                  <Link
                    to={feat.link}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold transition-colors ${styles.link}`}
                  >
                    <span>{feat.linkText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <CheckCircle2 className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
