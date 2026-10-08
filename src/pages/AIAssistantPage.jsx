import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Send,
  Mic,
  Volume2,
  Stethoscope,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Bot,
  User,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import VoiceMicModal from '../components/VoiceMicModal.jsx';
import SymptomChecker from '../components/SymptomChecker.jsx';

export default function AIAssistantPage() {
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Mode: 'chat' | 'symptom' | 'rag' | 'agent'
  const [activeTab, setActiveTab] = useState('symptom');

  // Symptom Recommendation State
  const [symptomText, setSymptomText] = useState(searchParams.get('symptoms') || '');
  const [symptomLoading, setSymptomLoading] = useState(false);
  const [symptomResult, setSymptomResult] = useState(null);

  // Chatbot State
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text:
        language === 'kn'
          ? 'ನಮಸ್ಕಾರ! ನಾನು ಸ್ವಾಸ್ಥ್ಯಸೇತು ಎಐ ಸಹಾಯಕ. ಕರ್ನಾಟಕದ ಸರ್ಕಾರಿ ಆಸ್ಪತ್ರೆಗಳು, ಒಪಿಡಿ ಸಮಯ, ಟೋಕನ್ ಕಾಯ್ದಿರಿಸುವಿಕೆ ಮತ್ತು ಸರಿಯಾದ ವಿಭಾಗವನ್ನು ತಿಳಿಯಲು ನಾನು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?'
          : 'Hello! I am SwasthyaSetu AI, your Karnataka government healthcare assistant. I can help you find hospitals, explain OPD procedures, guide you to the right department, and verify rules. How can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Voice State
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [voiceTarget, setVoiceTarget] = useState('symptom'); // 'symptom' or 'chat'

  // RAG Knowledge docs
  const [ragDocs, setRagDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // AI Agent Booking Workflow
  const [agentStep, setAgentStep] = useState('idle'); // 'idle' | 'planning' | 'confirm' | 'booked'
  const [agentPlan, setAgentPlan] = useState(null);

  useEffect(() => {
    loadRAGDocs();
    // Auto-run recommendation if symptoms param provided
    if (searchParams.get('symptoms')) {
      handleRecommendSymptoms(searchParams.get('symptoms'));
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadRAGDocs = async () => {
    try {
      const res = await api.getRAGDocs();
      setRagDocs(res.data || []);
      if (res.data?.length > 0) setSelectedDoc(res.data[0]);
    } catch (err) {
      console.error('Failed to load RAG documents:', err);
    }
  };

  const handleRecommendSymptoms = async (queryText = symptomText) => {
    const textToAnalyze = queryText || symptomText;
    if (!textToAnalyze.trim()) return;

    setSymptomLoading(true);
    setSymptomResult(null);

    try {
      const res = await api.aiDepartmentRecommendation({
        symptoms: textToAnalyze.trim(),
        language
      });
      setSymptomResult(res.data);
    } catch (err) {
      console.error('Recommendation failed:', err);
    } finally {
      setSymptomLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = {
      sender: 'user',
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await api.aiChat({
        message: userMsg.text,
        language
      });

      const aiMsg = {
        sender: 'ai',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Unable to reach the assistant server. Please check your connection.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Text-To-Speech for accessibility (Kannada & English)
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'kn' ? 'kn-IN' : 'en-IN';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceTranscription = (spokenText) => {
    if (voiceTarget === 'symptom') {
      setSymptomText(spokenText);
      handleRecommendSymptoms(spokenText);
    } else {
      setChatInput(spokenText);
    }
  };

  // Agent confirmation flow
  const triggerAgentPlanning = async () => {
    setAgentStep('planning');
    try {
      const res = await api.aiAgent({ action: 'PLAN_BOOKING' });
      setAgentPlan(res.plan);
      setAgentStep('confirm');
    } catch (err) {
      setAgentStep('idle');
    }
  };

  const confirmAgentBooking = async () => {
    if (!agentPlan) return;
    try {
      await api.createToken({
        patientName: 'Basavaraj Patil (AI Agent)',
        patientPhone: '9845012345',
        patientAge: 52,
        patientGender: 'Male',
        hospitalId: agentPlan.hospitalId,
        departmentId: agentPlan.departmentId,
        slot: 'Morning (09:00 AM - 01:00 PM)',
        symptoms: 'Booked via AI Assistant recommendation'
      });
      setAgentStep('booked');
    } catch (err) {
      alert('Booking error: ' + err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-700" />
          </span>
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
            Government Healthcare Navigation & Triage
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
          {language === 'kn' ? 'ಸ್ವಾಸ್ಥ್ಯಸೇತು ಎಐ ಸಹಾಯಕ' : 'SwasthyaSetu AI Healthcare Assistant'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          {language === 'kn'
            ? 'ರೋಗಲಕ್ಷಣ ಆಧಾರಿತ ಒಪಿಡಿ ವಿಭಾಗ ಶಿಫಾರಸು, ಆಸ್ಪತ್ರೆ ಮಾರ್ಗದರ್ಶನ ಮತ್ತು ಧ್ವನಿ ಸಂವಾದ (ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್).'
            : 'Non-diagnostic department routing, bilingual hospital information retrieval, and voice interaction.'}
        </p>
      </div>

      {/* Safety Guardrail Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-bold">Administrative & Triage Notice:</strong> {t('aiDisclaimer')}
        </p>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab('symptom')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'symptom'
              ? 'bg-emerald-700 text-white font-semibold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>{language === 'kn' ? 'ವಿಭಾಗ ಶಿಫಾರಸು' : 'Symptom Triage & Department'}</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'chat'
              ? 'bg-emerald-700 text-white font-semibold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>{language === 'kn' ? 'ಎಐ ಸಂವಾದ (ಚಾಟ್)' : 'Multilingual Hospital Chat'}</span>
        </button>

        <button
          onClick={() => setActiveTab('rag')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'rag'
              ? 'bg-emerald-700 text-white font-semibold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{language === 'kn' ? 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಮತ್ತು ನಿಯಮಗಳು (RAG)' : 'Verified Knowledge Base (RAG)'}</span>
        </button>

        <button
          onClick={() => setActiveTab('agent')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'agent'
              ? 'bg-emerald-700 text-white font-semibold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{language === 'kn' ? 'ಎಐ ಏಜೆಂಟ್ ಬುಕಿಂಗ್' : 'AI Agent Workflow'}</span>
        </button>
      </div>

      {/* TAB 1: AI-Powered Symptom Checker Chat Interface */}
      {activeTab === 'symptom' && (
        <div className="space-y-6">
          <SymptomChecker />
        </div>
      )}

      {/* TAB 2: Multilingual Chatbot */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[520px]">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                AI
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  SwasthyaSetu Assistant
                </h3>
                <span className="text-[11px] text-emerald-700 font-medium">
                  {language === 'kn' ? 'ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್ ಸಕ್ರಿಯವಾಗಿದೆ' : 'Kannada & English Active'}
                </span>
              </div>
            </div>

            <button
              onClick={() =>
                setMessages([
                  {
                    sender: 'ai',
                    text:
                      language === 'kn'
                        ? 'ಸಂಭಾಷಣೆಯನ್ನು ಮರುಹೊಂದಿಸಲಾಗಿದೆ. ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?'
                        : 'Conversation reset. How can I help you?',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                ])
              }
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Clear Chat
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="grow overflow-y-auto p-4 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 max-w-[85%] ${
                  m.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    m.sender === 'user'
                      ? 'bg-slate-800 text-white'
                      : 'bg-emerald-700 text-white'
                  }`}
                >
                  {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div>
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-emerald-700 text-white rounded-tr-xs'
                        : 'bg-slate-100 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    <p>{m.text}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-400">
                    <span>{m.timestamp}</span>
                    {m.sender === 'ai' && (
                      <button
                        onClick={() => speakText(m.text)}
                        className="hover:text-emerald-700"
                        title="Read out text"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 pl-9">
                <span className="animate-spin rounded-full h-3 w-3 border-2 border-emerald-600 border-t-transparent"></span>
                <span>SwasthyaSetu is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-slate-200">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={
                  language === 'kn'
                    ? 'ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ (ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್)...'
                    : 'Ask about OPD timings, doctors, hospital rules, or tokens...'
                }
                className="grow px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-hidden"
              />

              <button
                type="button"
                onClick={() => {
                  setVoiceTarget('chat');
                  setIsVoiceOpen(true);
                }}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="Speak using voice"
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                type="submit"
                disabled={!chatInput.trim() || chatLoading}
                className="p-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white transition-colors disabled:opacity-50 shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: Verified RAG Knowledge Base */}
      {activeTab === 'rag' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block px-2 pb-1 border-b border-slate-100">
              Karnataka Hospital Grounding Docs
            </span>
            <div className="space-y-1">
              {ragDocs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors ${
                    selectedDoc?.id === doc.id
                      ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block truncate font-medium">
                    {language === 'kn' ? doc.titleKn : doc.title}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Category: {doc.category}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            {selectedDoc ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                      Ground Truth Document
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                      {language === 'kn' ? selectedDoc.titleKn : selectedDoc.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => speakText(selectedDoc.content)}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                    title="Read content aloud"
                  >
                    <Volume2 className="w-4 h-4 text-emerald-700" />
                  </button>
                </div>

                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                  {selectedDoc.content}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Grounding Source: Health & Family Welfare Department Karnataka</span>
                  <span className="font-medium text-emerald-700">Verified & Audited</span>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-400">
                Select a document from the left list.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: AI Agent Booking Workflow */}
      {activeTab === 'agent' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
              Autonomous Agent with Explicit Confirmation
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">
              AI Token Reservation Agent
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              The AI Agent evaluates hospital schedules and checks slot availability. To protect patient choice, it ALWAYS requests explicit confirmation before generating a token.
            </p>
          </div>

          {agentStep === 'idle' && (
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <p className="text-xs text-slate-700">
                Example prompt to agent: "Find the earliest available OPD token for General Medicine at Victoria Hospital today and prepare a booking plan."
              </p>
              <button
                onClick={triggerAgentPlanning}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-2xs"
              >
                Start AI Booking Agent
              </button>
            </div>
          )}

          {agentStep === 'planning' && (
            <div className="p-8 text-center text-xs text-slate-500 space-y-2">
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-600 border-t-transparent mx-auto block"></span>
              <span>AI Agent is checking hospital capacity, doctor roster, and today's token pool...</span>
            </div>
          )}

          {agentStep === 'confirm' && agentPlan && (
            <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-300 space-y-4">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Slot Located · Confirmation Required</span>
              </div>

              <div className="bg-white p-4 rounded-lg border border-emerald-200 text-xs space-y-1.5 text-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-500">Hospital:</span>
                  <span className="font-semibold">{agentPlan.hospitalName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-semibold">{agentPlan.departmentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated Token:</span>
                  <span className="font-bold text-emerald-700">{agentPlan.estimatedTokenNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span className="font-medium">{agentPlan.date}</span>
                </div>
              </div>

              <p className="text-xs text-emerald-900 font-medium">{agentPlan.message}</p>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={confirmAgentBooking}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Yes, Confirm & Book Token
                </button>
                <button
                  onClick={() => setAgentStep('idle')}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel Plan
                </button>
              </div>
            </div>
          )}

          {agentStep === 'booked' && (
            <div className="p-6 bg-emerald-100 text-emerald-900 rounded-xl border border-emerald-400 space-y-3">
              <h4 className="font-bold text-base">Token Reserved via AI Agent!</h4>
              <p className="text-xs">
                Your token has been confirmed on the live queue roster. You can track its progression on the Live Queue board or your Patient Dashboard.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => navigate('/patient/dashboard')}
                  className="px-4 py-2 bg-emerald-800 text-white text-xs font-semibold rounded-lg"
                >
                  Go to Patient Dashboard
                </button>
                <button
                  onClick={() => setAgentStep('idle')}
                  className="px-3 py-2 bg-white text-emerald-900 text-xs font-semibold rounded-lg"
                >
                  New Query
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Voice Recognition Modal */}
      <VoiceMicModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onTranscriptionComplete={handleVoiceTranscription}
      />
    </div>
  );
}
