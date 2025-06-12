import React, { useState, useRef } from 'react';
import { Input } from './ui/input';

const CityAutocomplete = ({
  value,
  onChange,
  required = false
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef(null);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (newValue.length > 1) {
      setLoading(true);
      timeoutRef.current = setTimeout(() => {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(newValue)}&limit=5`)
          .then(res => res.json())
          .then(data => {
            setSuggestions(data);
            setLoading(false);
            setShowSuggestions(true);
          })
          .catch(() => {
            setLoading(false);
            setSuggestions([]);
          });
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionMouseDown = (displayName) => {
    onChange(displayName);
    setShowSuggestions(false);
  };

  const handleVoiceInput = (text) => {
    onChange(text);
    if (text.length > 1) {
      setLoading(true);
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=5`)
        .then(res => res.json())
        .then(data => {
          setSuggestions(data);
          setLoading(false);
          setShowSuggestions(true);
        })
        .catch(() => {
          setLoading(false);
          setSuggestions([]);
        });
    }
  };

  return (
    <div className="relative w-full">
      <Input
        type="text"
        value={value}
        onChange={handleInputChange}
        onVoiceInput={handleVoiceInput}
        required={required}
        placeholder="City, Area, Country"
        className="w-full p-3 rounded-lg bg-indigo-800/50 border border-purple-500/40 text-white placeholder:text-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
        onFocus={() => value.length > 1 && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-30 left-0 right-0 bg-indigo-900 border border-purple-500/40 rounded-lg mt-1 max-h-56 overflow-y-auto shadow-lg">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className="px-4 py-2 cursor-pointer hover:bg-purple-800/60 text-white"
              onMouseDown={() => handleSuggestionMouseDown(s.display_name)}
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
      {loading && <div className="absolute right-3 top-3 text-purple-300 text-xs">Loading...</div>}
    </div>
  );
};

export default CityAutocomplete; 