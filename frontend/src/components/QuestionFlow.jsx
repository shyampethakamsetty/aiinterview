import React, { useState, useEffect, useRef } from 'react';
import { submitAnswers } from '../api';
import { Mic } from 'lucide-react';

const questions = [
  { id: 1, text: 'What is your name?', type: 'text' },
  { id: 2, text: 'How old are you?', type: 'dropdown', options: Array.from({ length: 43 }, (_, i) => i + 18) },
  { id: 3, text: 'What is your height?', type: 'dropdown', options: ['5\'0"', '5\'1"', '5\'2"', '5\'3"', '5\'4"', '5\'5"', '5\'6"', '5\'7"', '5\'8"', '5\'9"', '5\'10"', '5\'11"', '6\'0"', '6\'1"', '6\'2"', '6\'3"', '6\'4"', '6\'5"', '6\'6"', '6\'7"', '6\'8"', '6\'9"', '6\'10"', '6\'11"', '7\'0"'] },
  { id: 4, text: 'What is your religion?', type: 'dropdown', options: ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other', 'Prefer not to say'] },
  { id: 5, text: 'What is your caste?', type: 'dropdown', options: ['Brahmin', 'Kshatriya', 'Vaishya', 'Shudra', 'Other', 'Prefer not to say'] },
  { id: 6, text: 'What languages do you speak?', type: 'multi-select', options: ['Hindi', 'English', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Urdu', 'Gujarati', 'Kannada', 'Odia', 'Malayalam', 'Punjabi', 'Sanskrit', 'Other'] },
  { id: 7, text: 'What is your education?', type: 'dropdown', options: ['High School', 'Bachelor\'s Degree', 'Master\'s Degree', 'Doctorate', 'Other'] },
  { id: 8, text: 'What is your profession?', type: 'text' },
  { id: 9, text: 'Do you smoke or drink?', type: 'radio', options: ['Yes', 'No', 'Occasionally'] },
  { id: 10, text: 'Tell me what you usually eat in a day.', type: 'text' },
  { id: 11, text: 'How does a typical day look for you?', type: 'text' },
  { id: 12, text: 'What are some things you enjoy doing?', type: 'text' },
  { id: 13, text: 'What values matter most to you in family life?', type: 'text' },
  { id: 14, text: 'Where do you see yourself in 5 years?', type: 'text' },
  { id: 15, text: 'What kind of person are you hoping to meet?', type: 'text' },
  { id: 16, text: 'Describe your perfect Sunday.', type: 'text' },
  { id: 17, text: 'What truly makes you feel happy or at peace?', type: 'text' },
];

const ProgressBar = ({ current, total }) => (
  <div className="w-full bg-gray-200 rounded-full h-3 mt-6 mb-2">
    <div
      className="bg-blue-500 h-3 rounded-full transition-all duration-500"
      style={{ width: `${Math.round((current / total) * 100)}%` }}
    ></div>
  </div>
);

const OptionModal = ({ options, onSelect, onClose, multi, selected, onSubmit }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 animate-fadeIn">
    <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px]">
      <h3 className="mb-4 text-lg font-semibold">Choose option{multi ? 's' : ''}</h3>
      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <button
            key={option}
            className={`px-4 py-2 rounded border text-left transition-all duration-200 ${
              selected && ((multi && selected.includes(option)) || (!multi && selected === option)) 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 hover:bg-blue-100'
            }`}
            onClick={() => onSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="flex justify-end gap-2 mt-4">
        {multi && (
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={onSubmit}
          >
            Submit Selection
          </button>
        )}
        <button 
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" 
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

const QuestionFlow = () => {
  const [started, setStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [voices, setVoices] = useState([]);
  const [isListening, setIsListening] = useState(false);

  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const handleVoicesChanged = () => {
      const loadedVoices = window.speechSynthesis.getVoices();
      setVoices(loadedVoices);
      setVoicesLoaded(true);
    };
    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    handleVoicesChanged();
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = (text) => {
    if ('speechSynthesis' in window && voicesLoaded) {
      const utterance = new window.SpeechSynthesisUtterance(text);
      const femaleVoice = voices.find(
        (voice) =>
          (voice.name && voice.name.toLowerCase().includes('female')) ||
          (voice.gender && voice.gender.toLowerCase() === 'female') ||
          (voice.name && voice.name.toLowerCase().includes('zira'))
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      utterance.pitch = 1.1;
      utterance.rate = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Speak the question when it changes
  useEffect(() => {
    const q = questions[currentQuestionIndex];
    if (started && !completed && voicesLoaded) {
      setInputValue(answers[q.id] || '');
      speak(q.text);
    }
  }, [currentQuestionIndex, started, completed, voicesLoaded]);

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    stopListening();
    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onend = () => setIsListening(false);
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      stopListening();
    };
    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleAnswer = (answer) => {
    stopSpeaking();
    const currentQ = questions[currentQuestionIndex];
    const updatedAnswers = { ...answers, [currentQ.id]: answer };
    setAnswers(updatedAnswers);
    setInputValue('');
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      submitAnswers(updatedAnswers)
        .then(() => setCompleted(true))
        .catch(() => setCompleted(true));
    }
  };

  const handleStart = () => {
    setStarted(true);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setCompleted(false);
    setInputValue('');
  };

  const handleInput = (e) => setInputValue(e.target.value);

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() !== '') {
      handleAnswer(inputValue.trim());
    }
  };

  const handleOptionSelect = (option) => {
    const q = questions[currentQuestionIndex];
    if (q.type === 'multi-select') {
      const prev = answers[q.id] || [];
      const newAnswer = prev.includes(option) 
        ? prev.filter((o) => o !== option)
        : [...prev, option];
      setAnswers(prevAnswers => ({
        ...prevAnswers,
        [q.id]: newAnswer
      }));
    } else {
      stopSpeaking();
      const updatedAnswers = { ...answers, [q.id]: option };
      setAnswers(updatedAnswers);
      setShowOptions(false);
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        submitAnswers(updatedAnswers)
          .then(() => setCompleted(true))
          .catch(() => setCompleted(true));
      }
    }
  };

  const handleMultiSelectSubmit = () => {
    stopSpeaking();
    const q = questions[currentQuestionIndex];
    const currentAnswers = answers[q.id] || [];
    if (currentAnswers.length > 0) {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        submitAnswers(answers)
          .then(() => setCompleted(true))
          .catch(() => setCompleted(true));
      }
    }
    setShowOptions(false);
  };

  const handleSkip = () => {
    stopSpeaking();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      submitAnswers(answers)
        .then(() => setCompleted(true))
        .catch(() => setCompleted(true));
    }
  };

  const openOptions = () => setShowOptions(true);
  const closeOptions = () => setShowOptions(false);

  if (!started) {
    return (
      <div className="question-flow flex flex-col items-center mt-10 animate-fadeIn">
        <button onClick={handleStart} className="text-2xl px-8 py-4 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-200">
          Start Interview
        </button>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="question-flow max-w-xl mx-auto mt-10 animate-fadeIn">
        <h2 className="text-2xl font-bold mb-4">Thank you for completing the interview!</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Your Answers:</h3>
          <ul className="divide-y divide-gray-200">
            {questions.map((q) => (
              <li key={q.id} className="py-2 flex flex-col">
                <span className="font-medium text-gray-700">{q.text}</span>
                <span className="text-blue-700 mt-1">{Array.isArray(answers[q.id]) ? answers[q.id].join(', ') : answers[q.id]}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const q = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isOptionQuestion = q.type === 'dropdown' || q.type === 'radio' || q.type === 'multi-select';

  return (
    <div className="question-flow max-w-xl mx-auto mt-10 bg-white rounded-lg shadow-lg p-8 animate-fadeIn">
      <div className="mb-6">
        <div className="text-lg font-semibold mb-2 animate-fadeInUp">{q.text}</div>
        <div className="text-sm text-gray-500 mb-4">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
        <ProgressBar current={currentQuestionIndex + 1} total={questions.length} />
        
        {isOptionQuestion ? (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-2">
              {q.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleOptionSelect(option)}
                  className={`px-4 py-3 rounded-lg border text-left transition-all duration-200 ${
                    (q.type === 'multi-select' && answers[q.id]?.includes(option)) || 
                    (!q.type.includes('multi') && answers[q.id] === option)
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 hover:bg-blue-100'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              {q.type === 'multi-select' && (
                <button
                  onClick={handleMultiSelectSubmit}
                  className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                >
                  Submit Selection
                </button>
              )}
              <button
                onClick={handleSkip}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Skip
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleInputSubmit} className="flex flex-col gap-4">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={handleInput}
              onFocus={(e) => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
              className="w-full min-h-[120px] px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
              style={{ 
                height: '120px',
                overflowY: 'hidden'
              }}
              onInput={(e) => {
                e.target.style.height = '120px';
                e.target.style.height = Math.max(120, e.target.scrollHeight) + 'px';
              }}
              placeholder="Type your answer..."
              autoFocus
            />
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={startListening}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                  {isListening ? 'Listening...' : 'Use Voice'}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                >
                  Submit
                </button>
              </div>
              <button
                type="button"
                onClick={handleSkip}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Skip
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default QuestionFlow; 