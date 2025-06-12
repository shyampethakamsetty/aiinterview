import React from 'react';
import { Input } from './input';

const FormField = ({
  label,
  name,
  type,
  placeholder,
  required = false,
  icon,
  hint,
  value,
  onChange
}) => {
  const handleVoiceInput = (text) => {
    if (onChange) {
      const event = {
        target: {
          name,
          value: text
        }
      };
      onChange(event);
    }
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-purple-200 flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </label>
      <Input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onVoiceInput={handleVoiceInput}
        className="w-full p-3 rounded-lg bg-indigo-800/50 border border-purple-500/40 text-white placeholder:text-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-colors duration-200"
      />
      {hint && (
        <p className="text-xs text-purple-300/70 mt-1">{hint}</p>
      )}
    </div>
  );
};

export default FormField; 