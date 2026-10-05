import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, X, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function VoiceMicModal({ isOpen, onClose, onTranscriptionComplete }) {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechError, setSpeechError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setIsListening(false);
      setTranscript('');
      setSpeechError('');
      return;
    }

    startListening();

    return () => {
      stopListening();
    };
  }, [isOpen, language]);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('Speech recognition is not supported in this browser. Please use text input.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'kn' ? 'kn-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError('');
      };

      recognition.onresult = (event) => {
        let current = '';
        for (let i = 0; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setTranscript(current);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          setSpeechError('No speech detected. Please speak into your microphone.');
        } else {
          setSpeechError(`Microphone notice: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      window.__currentRecognition = recognition;
    } catch (err) {
      setSpeechError('Could not start microphone: ' + err.message);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (window.__currentRecognition) {
      try {
        window.__currentRecognition.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  const handleApply = () => {
    if (transcript.trim() && onTranscriptionComplete) {
      onTranscriptionComplete(transcript.trim());
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <div
            className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-rose-50 text-rose-600 ring-8 ring-rose-100 animate-pulse'
                : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            {isListening ? <Mic className="w-10 h-10" /> : <MicOff className="w-10 h-10" />}
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900">
          {language === 'kn' ? 'ಧ್ವನಿ ಮೂಲಕ ಮಾತನಾಡಿ' : 'Voice Interaction'}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {language === 'kn'
            ? 'ಕನ್ನಡದಲ್ಲಿ ನಿಮ್ಮ ರೋಗಲಕ್ಷಣ ಅಥವಾ ಪ್ರಶ್ನೆಯನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಹೇಳಿ'
            : 'Speak your health symptoms or questions clearly'}
        </p>

        {/* Live Transcript Display */}
        <div className="mt-4 p-4 min-h-[90px] bg-slate-50 rounded-xl border border-slate-200 text-left">
          {transcript ? (
            <p className="text-sm font-medium text-slate-900 leading-relaxed">{transcript}</p>
          ) : (
            <p className="text-xs text-slate-400 italic">
              {isListening
                ? language === 'kn'
                  ? 'ಆಲಿಸಲಾಗುತ್ತಿದೆ... ಮಾತನಾಡಿ...'
                  : 'Listening... speak now...'
                : 'Press restart to speak again.'}
            </p>
          )}
        </div>

        {speechError && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 p-2 rounded-lg text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{speechError}</span>
          </div>
        )}

        <div className="mt-5 flex items-center justify-center gap-3">
          {isListening ? (
            <button
              onClick={stopListening}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={startListening}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{language === 'kn' ? 'ಮತ್ತೆ ಮಾತನಾಡಿ' : 'Speak Again'}</span>
            </button>
          )}

          <button
            onClick={handleApply}
            disabled={!transcript.trim()}
            className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {language === 'kn' ? 'ಸಲ್ಲಿಸಿ' : 'Use Spoken Text'}
          </button>
        </div>
      </div>
    </div>
  );
}
