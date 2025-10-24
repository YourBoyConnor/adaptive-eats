'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface AllergyInputProps {
  allergies: string[];
  onChange: (allergies: string[]) => void;
}

export function AllergyInput({ allergies, onChange }: AllergyInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addAllergy = (allergy: string) => {
    const trimmed = allergy.trim();
    if (trimmed && !allergies.includes(trimmed)) {
      onChange([...allergies, trimmed]);
      setInputValue('');
    }
  };

  const removeAllergy = (allergyToRemove: string) => {
    onChange(allergies.filter(allergy => allergy !== allergyToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAllergy(inputValue);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addAllergy(inputValue);
    }
  };

  return (
    <div className="space-y-4">
      <label className="text-white font-medium">Allergies</label>
      <div className="min-h-[60px] p-4 bg-white/10 border border-white/20 rounded-xl flex flex-wrap gap-2 items-center">
        <AnimatePresence>
          {allergies.map((allergy) => (
            <motion.span
              key={allergy}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center space-x-2 px-3 py-2 bg-red-500/30 text-red-200 rounded-full text-sm border border-red-500/50"
            >
              <span>{allergy}</span>
              <button
                type="button"
                onClick={() => removeAllergy(allergy)}
                className="hover:text-red-100 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          onBlur={handleBlur}
          placeholder="Type an allergy and press Enter..."
          className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none min-w-[200px]"
        />
      </div>
      <p className="text-sm text-gray-400">
        Type an allergy and press Enter to add it. Click the × to remove.
      </p>
    </div>
  );
}
