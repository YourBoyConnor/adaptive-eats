'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface RecipeResponse {
  original_recipe: string;
  adapted_recipe: string;
  dietary_restrictions: string[];
  allergies: string[];
  substitutions_made: string[];
  nutrition_facts: string[];
}

interface RecipeCardProps {
  result: RecipeResponse;
}

export function RecipeCard({ result }: RecipeCardProps) {
  const formatRecipeText = (text: string) => {
    const lines = text.split(/\r?\n/);
    let html = '';
    let inList = false;
    let listType = '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        if (inList) {
          html += listType === 'ol' ? '</ol>' : '</ul>';
          inList = false;
        }
        html += '<br>';
        continue;
      }

      // Check for headers
      if (trimmed.toLowerCase().startsWith('title:')) {
        if (inList) {
          html += listType === 'ol' ? '</ol>' : '</ul>';
          inList = false;
        }
        html += `<h3 class="text-xl font-bold text-white mb-4">${trimmed.slice(6).trim()}</h3>`;
        continue;
      }

      if (/^ingredients:?$/i.test(trimmed)) {
        if (inList) {
          html += listType === 'ol' ? '</ol>' : '</ul>';
        }
        html += '<h4 class="text-lg font-semibold text-white mb-3">Ingredients</h4><ul class="space-y-2">';
        inList = true;
        listType = 'ul';
        continue;
      }

      if (/^instructions:?$/i.test(trimmed)) {
        if (inList) {
          html += listType === 'ol' ? '</ol>' : '</ul>';
        }
        html += '<h4 class="text-lg font-semibold text-white mb-3">Instructions</h4><ol class="space-y-2">';
        inList = true;
        listType = 'ol';
        continue;
      }

      if (/^notes?\s*\(optional\)?:?$/i.test(trimmed)) {
        if (inList) {
          html += listType === 'ol' ? '</ol>' : '</ul>';
        }
        html += '<h4 class="text-lg font-semibold text-white mb-3">Notes</h4><ul class="space-y-2">';
        inList = true;
        listType = 'ul';
        continue;
      }

      // Check for list items
      if (/^[-\u2022\*]\s+/.test(trimmed)) {
        if (!inList || listType !== 'ul') {
          if (inList) html += listType === 'ol' ? '</ol>' : '</ul>';
          html += '<ul class="space-y-2">';
          inList = true;
          listType = 'ul';
        }
        html += `<li class="text-gray-200">${trimmed.replace(/^[-\u2022\*]\s+/, '')}</li>`;
        continue;
      }

      if (/^\d+\.\s+/.test(trimmed)) {
        if (!inList || listType !== 'ol') {
          if (inList) html += listType === 'ol' ? '</ol>' : '</ul>';
          html += '<ol class="space-y-2">';
          inList = true;
          listType = 'ol';
        }
        html += `<li class="text-gray-200">${trimmed.replace(/^\d+\.\s+/, '')}</li>`;
        continue;
      }

      // Regular paragraph
      if (inList) {
        html += listType === 'ol' ? '</ol>' : '</ul>';
        inList = false;
      }
      html += `<p class="text-gray-200 mb-2">${trimmed}</p>`;
    }

    if (inList) {
      html += listType === 'ol' ? '</ol>' : '</ul>';
    }

    return html;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-amber-500 rounded-xl flex items-center justify-center">
          <Image src="/logo.svg" alt="Success" width={24} height={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Recipe Adapted!</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            {result.dietary_restrictions.length > 0 && (
              <span className="px-3 py-1 bg-purple-500/30 text-purple-200 rounded-full text-sm">
                {result.dietary_restrictions.join(', ')}
              </span>
            )}
            {result.allergies.length > 0 && (
              <span className="px-3 py-1 bg-red-500/30 text-red-200 rounded-full text-sm">
                Allergies: {result.allergies.join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Recipe Content */}
      <div className="bg-white/5 rounded-xl p-6">
        <div 
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: formatRecipeText(result.adapted_recipe) }}
        />
      </div>

      {/* Substitutions */}
      {result.substitutions_made.length > 0 && (
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-200 mb-4 flex items-center space-x-2">
            <span>🔄</span>
            <span>Substitutions Made</span>
          </h3>
          <ul className="space-y-2">
            {result.substitutions_made.map((sub, index) => (
              <li key={index} className="text-blue-100 flex items-center space-x-2">
                <span>→</span>
                <span>{sub}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Nutrition Facts */}
      {result.nutrition_facts && result.nutrition_facts.length > 0 && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-yellow-200 mb-4">📊 Nutrition (per serving)</h3>
          <ul className="space-y-1">
            {result.nutrition_facts.map((fact, index) => (
              <li key={index} className="text-yellow-100">{fact}</li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
