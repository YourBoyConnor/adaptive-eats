'use client';

import { motion } from 'framer-motion';

interface DietarySelectorProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function DietarySelector({ options, selected, onChange }: DietarySelectorProps) {
  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="space-y-4">
      <label className="text-white font-medium">Dietary Restrictions</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <motion.button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                isSelected
                  ? 'bg-purple-600 text-white border-2 border-purple-500'
                  : 'bg-white/10 text-gray-300 border-2 border-white/20 hover:bg-white/20 hover:border-white/30'
              }`}
            >
              {option.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </motion.button>
          );
        })}
      </div>
      <p className="text-sm text-gray-400">
        Click buttons to select/deselect dietary restrictions
      </p>
    </div>
  );
}
