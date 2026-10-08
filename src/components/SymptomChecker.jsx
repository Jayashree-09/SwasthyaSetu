import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Send,
  Mic,
  Volume2,
  Stethoscope,
  AlertTriangle,
  ArrowRight,
  User,
  Bot,
  RotateCcw,
  CheckCircle2,
  Calendar,
  PhoneCall,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import VoiceMicModal from './VoiceMicModal.jsx';

export default function SymptomChecker() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Department code to department ID mapping for direct booking
  const deptCodeMap = {
    GM: 'dept-gm',
    PED: 'dept-ped',
    OBG: 'dept-obg',
    ORTH: 'dept-orth',
    ENT: 'dept-ent',
    OPH: 'dept-oph',
    DERM: 'dept-derm',
    DENT: 'dept-dent',
    PSYCH: 'dept-psych',
    CARD: 'dept-cardio',
    EMRG: 'dept-emerg'
  };

  const getInitialMessage = () => ({
    id: 'msg-welcome',
    sender: 'ai',
    text:
      language === 'kn'
        ? 'ನಮಸ್ಕಾರ! ನಾನು ಸ್ವಾಸ್ಥ್ಯಸೇತು ಎಐ ರೋಗಲಕ್ಷಣ ಸಹಾಯಕ (Symptom Checker). ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಮಸ್ಯೆ ಅಥವಾ ರೋಗಲಕ್ಷಣಗಳನ್ನು ವಿವರಿಸಿ. ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆಯಲ್ಲಿ ಯಾವ ಒಪಿಡಿ ವಿಭಾಗಕ್ಕೆ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಕಾಯ್ದಿರಿಸಬೇಕು ಎಂದು ನಾನು ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತೇನೆ.'
        : 'Hello! I am your AI Symptom Checker & OPD Guide. Please describe what symptoms or health concerns you are experiencing. I will recommend the right hospital department for your OPD appointment.',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    recommendation: null
  });

  const [messages, setMessages] = useState([getInitialMessage()]);

  // Update welcome message if language changes and only welcome exists
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'msg-welcome') {
        return [getInitialMessage()];
      }
      return prev;
    });
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickPromptChips = [
    {
      en: 'Child with high fever and vomiting',
      kn: 'ಮಗುವಿಗೆ ತೀವ್ರ ಜ್ವರ ಮತ್ತು ವಾಂತಿ',
      dept: 'Pediatrics'
    },
    {
      en: 'Severe knee pain and difficulty walking',
      kn: 'ತೀವ್ರ ಕೀಲು ನೋವು ಮತ್ತು ನಡೆಯಲು ಕಷ್ಟ',
      dept: 'Orthopedics'
    },
    {
      en: 'Pregnancy antenatal checkup',
      kn: 'ಗರ್ಭಿಣಿ ತಪಾಸಣೆ ಮತ್ತು ತಲೆತಿರುಗುವಿಕೆ',
      dept: 'Obstetrics & Gynecology'
    },
    {
      en: 'Ear pain and fluid discharge',
      kn: 'ಕಿವಿ ನೋವು ಮತ್ತು ಕೀವು ಸೋರುವುದು',
      dept: 'ENT'
    },
    {
      en: 'Red eyes, irritation and blurred vision',
      kn: 'ಕಣ್ಣು ಕೆಂಪಾಗುವುದು ಮತ್ತು ಮಸುಕಾದ ದೃಷ್ಟಿ',
      dept: 'Ophthalmology'
    },
    {
      en: 'Skin rash with severe itching',
      kn: 'ಚರ್ಮದ ದದ್ದು ಮತ್ತು ತೀವ್ರ ತುರಿಕೆ',
      dept: 'Dermatology'
    },
    {
      en: 'Severe toothache and swollen gums',
      kn: 'ತೀವ್ರ ಹಲ್ಲು ನೋವು ಮತ್ತು ವಸಡು ಊತ',
      dept: 'Dentistry'
    }
  ];

  const handleSendMessage = async (textToSend = inputMessage) => {
    const text = textToSend.trim();
    if (!text || isLoading) return;

    const userMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Call AI Symptom-to-Department recommendation endpoint
      const res = await api.aiDepartmentRecommendation({
        symptoms: text,
        language
      });

      const rec = res.data;
      const deptCode = rec.departmentCode || 'GM';
      const deptId = deptCodeMap[deptCode] || 'dept-gm';

      let aiNarrative = '';
      if (language === 'kn') {
        aiNarrative = rec.adviceKn
          ? rec.adviceKn
          : `ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳ ವಿಶ್ಲೇಷಣೆಯ ಪ್ರಕಾರ, ನೀವು "${rec.recommendedDepartment}" ವಿಭಾಗಕ್ಕೆ ಭೇಟಿ ನೀಡುವುದು ಸೂಕ್ತ.`;
      } else {
        aiNarrative = `Based on the symptoms you described, the recommended OPD specialty for your consultation is ${rec.recommendedDepartment}.`;
      }

      const aiMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'ai',
        text: aiNarrative,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendation: {
          departmentName: rec.recommendedDepartment,
          departmentCode: deptCode,
          departmentId: deptId,
          reason: rec.reason,
          confidence: rec.confidence || 'high',
          isEmergency: rec.isEmergency || false,
          disclaimer:
            rec.disclaimer ||
            'This is an administrative recommendation to guide you to the right OPD department, not a medical diagnosis. Please consult a qualified doctor.',
          urgency: rec.urgency || (rec.isEmergency ? 'IMMEDIATE' : 'NORMAL'),
          adviceKn: rec.adviceKn
        }
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Symptom analysis failed:', err);
      const fallbackMsg = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'ai',
        text:
          language === 'kn'
            ? 'ಕ್ಷಮಿಸಿ, ವಿಶ್ಲೇಷಣೆಯಲ್ಲಿ ತೊಂದರೆಯಾಗಿದೆ. ನೀವು ಜನರಲ್ ಮೆಡಿಸಿನ್ (General Medicine) ವಿಭಾಗಕ್ಕೆ ಭೇಟಿ ನೀಡಿ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಬಹುದು.'
            : 'We encountered an issue analyzing your input. For adult general complaints, please consult General Medicine OPD where duty physicians can examine you.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendation: {
          departmentName: 'General Medicine',
          departmentCode: 'GM',
          departmentId: 'dept-gm',
          reason: 'General adult symptoms are evaluated first by General Medicine physicians.',
          confidence: 'medium',
          isEmergency: false,
          disclaimer:
            'Administrative department routing only. Not a medical diagnosis. Please consult a qualified physician.',
          urgency: 'NORMAL'
        }
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceTranscription = (spokenText) => {
    if (spokenText) {
      setInputMessage(spokenText);
      handleSendMessage(spokenText);
    }
  };

  const handleResetChat = () => {
    setMessages([getInitialMessage()]);
    setInputMessage('');
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'kn' ? 'kn-IN' : 'en-IN';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[700px] max-h-[85vh] overflow-hidden">
      {/* 1. Chat Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm ring-1 ring-white/10 shrink-0">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base sm:text-lg text-white tracking-tight leading-tight">
                {language === 'kn'
                  ? 'ಎಐ ರೋಗಲಕ್ಷಣ ಸಹಾಯಕ (Symptom Checker)'
                  : 'AI Symptom Checker & OPD Guide'}
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                Non-Diagnostic
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-none mt-1">
              {language === 'kn'
                ? 'ಕರ್ನಾಟಕ ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆಗಳ ಒಪಿಡಿ ವಿಭಾಗ ಶಿಫಾರಸು'
                : 'Guided outpatient department recommendations for Karnataka government hospitals'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetChat}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
          title="Restart conversation"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Safety Notice Strip */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-[11px] text-amber-900 flex items-center gap-2 shrink-0">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>
          <strong>Safety Directive:</strong> This tool assists in routing symptoms to the right hospital OPD. It does NOT diagnose diseases or prescribe medication.
        </span>
      </div>

      {/* 2. Chat Message Thread Area */}
      <div className="grow overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/60">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-full sm:max-w-[85%] ${
                isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs ${
                  isAi
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-900 text-white'
                }`}
              >
                {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Bubble & Content */}
              <div className="space-y-2.5 max-w-full">
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                    isAi
                      ? 'bg-white text-slate-900 border border-slate-200/80 rounded-tl-xs'
                      : 'bg-emerald-700 text-white rounded-tr-xs font-medium'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Recommendation Card inside AI message */}
                  {msg.recommendation && (
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                      {msg.recommendation.isEmergency ? (
                        /* EMERGENCY ALERT BOX */
                        <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-rose-950 space-y-2">
                          <div className="flex items-center gap-1.5 font-extrabold text-xs text-rose-800">
                            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                            <span>EMERGENCY PROTOCOL TRIGGERED</span>
                          </div>
                          <h4 className="text-sm font-extrabold text-rose-900">
                            Recommended: 24x7 Emergency / Casualty
                          </h4>
                          <p className="text-xs text-rose-800 leading-normal">
                            {msg.recommendation.disclaimer}
                          </p>
                          <div className="pt-1 flex items-center gap-2">
                            <a
                              href="tel:108"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-lg shadow-2xs"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span>Call 108 Emergency</span>
                            </a>
                          </div>
                        </div>
                      ) : (
                        /* STRUCTURED DEPARTMENT RECOMMENDATION CARD */
                        <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl text-slate-900 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                              <Stethoscope className="w-3.5 h-3.5" />
                              <span>Recommended OPD Department</span>
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-200/70 text-emerald-900 border border-emerald-300">
                              CODE: {msg.recommendation.departmentCode}
                            </span>
                          </div>

                          <div className="text-base sm:text-lg font-black text-emerald-950 tracking-tight">
                            {msg.recommendation.departmentName}
                          </div>

                          <p className="text-xs text-slate-700 leading-relaxed">
                            {msg.recommendation.reason}
                          </p>

                          {/* ACTION BUTTON: BOOK APPOINTMENT FOR THIS DEPARTMENT */}
                          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-t border-emerald-200/60">
                            <button
                              type="button"
                              onClick={() => speakText(
                                `${msg.recommendation.departmentName}. ${msg.recommendation.reason}`
                              )}
                              className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
                              title="Listen to recommendation"
                            >
                              <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Listen (ಧ್ವನಿ)</span>
                            </button>

                            <Link
                              to={`/book-token?deptId=${msg.recommendation.departmentId}`}
                              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-sm transition-all hover:shadow"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              <span>
                                {language === 'kn'
                                  ? `${msg.recommendation.departmentName} ಟೋಕನ್ ಪಡೆಯಿರಿ`
                                  : `Book OPD Token for ${msg.recommendation.departmentName}`}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* Quiet Medical Disclaimer */}
                      <p className="text-[11px] text-slate-500 italic leading-snug">
                        {msg.recommendation.disclaimer}
                      </p>
                    </div>
                  )}
                </div>

                {/* Timestamp & Text-To-Speech Button */}
                <div className="flex items-center gap-2 px-1 text-[10px] text-slate-400">
                  <span>{msg.timestamp}</span>
                  {isAi && (
                    <button
                      type="button"
                      onClick={() => speakText(msg.text)}
                      className="hover:text-emerald-700 flex items-center gap-1"
                      title="Read out text"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Hear audio</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading / Analyzing Indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl rounded-tl-xs shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>SwasthyaSetu AI is analyzing health concerns...</span>
              </div>
              <p className="text-xs text-slate-500">
                Evaluating symptoms against 11+ clinical OPD specialties and doctor schedules...
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Quick Prompt Chips (Visible when user has few messages) */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>{language === 'kn' ? 'ತ್ವರಿತ ರೋಗಲಕ್ಷಣ ಆಯ್ಕೆಗಳು:' : 'Quick Symptom Prompts:'}</span>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {quickPromptChips.map((chip, idx) => {
            const label = language === 'kn' ? chip.kn : chip.en;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(label)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-200 border border-slate-200 text-slate-700 font-medium transition-all shrink-0 text-left disabled:opacity-50"
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Chat Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
      >
        <div className="relative grow">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
            placeholder={
              language === 'kn'
                ? 'ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ (ಉದಾ: ಕೀಲು ನೋವು, ಮಗುವಿಗೆ ಜ್ವರ)...'
                : 'Describe your symptoms (e.g., knee joint pain, child fever, earache)...'
            }
            className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
          />

          <button
            type="button"
            onClick={() => setIsVoiceModalOpen(true)}
            disabled={isLoading}
            className="absolute right-2.5 top-2.5 p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
            title={language === 'kn' ? 'ಧ್ವನಿ ಮೂಲಕ ಹೇಳಿ' : 'Speak symptoms'}
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>

        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="p-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center justify-center min-w-[44px]"
          aria-label="Send symptom description"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Voice Recognition Modal for Hands-free speech */}
      <VoiceMicModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onTranscriptionComplete={handleVoiceTranscription}
      />
    </div>
  );
}
