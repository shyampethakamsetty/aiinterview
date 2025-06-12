import React, { useState, useRef } from 'react';
import { Mic } from 'lucide-react';

const Input = React.forwardRef(({ className, type, onVoiceInput, ...props }, ref) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (onVoiceInput) {
          onVoiceInput(transcript);
        }
      };
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  React.useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="relative">
      <input
        type={type}
        className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pr-10 ${className || ''}`}
        ref={ref}
        {...props}
      />
      <button
        type="button"
        onClick={isListening ? stopListening : startListening}
        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${
          isListening ? 'text-red-500 hover:bg-red-100' : 'text-gray-500 hover:bg-gray-100'
        }`}
      >
        <Mic className="w-4 h-4" />
      </button>
    </div>
  );
});

Input.displayName = "Input";

export { Input }; 