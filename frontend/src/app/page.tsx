'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon, 
  CameraIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { RecipeCard } from '@/components/RecipeCard';
import { DietarySelector } from '@/components/DietarySelector';
import { AllergyInput } from '@/components/AllergyInput';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface RecipeResponse {
  original_recipe: string;
  adapted_recipe: string;
  dietary_restrictions: string[];
  allergies: string[];
  substitutions_made: string[];
  nutrition_facts: string[];
}

export default function Home() {
  const [recipe, setRecipe] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RecipeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const dietaryOptions = [
    'vegan', 'vegetarian', 'gluten-free', 'keto', 'paleo', 
    'dairy-free', 'nut-free', 'low-sodium', 'diabetic-friendly'
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const captureFromCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      setShowCamera(true);
      
      // Use useEffect-like behavior with a ref
      const setupCamera = () => {
        const container = document.getElementById('camera-container');
        if (container) {
          container.innerHTML = `
            <div class="space-y-4">
              <video id="camera-video" autoplay playsinline style="width: 100%; max-height: 400px; border-radius: 0.75rem; object-fit: cover;"></video>
              <div class="flex gap-4 justify-center">
                <button id="capture-btn" class="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium">
                  📸 Capture Photo
                </button>
                <button id="cancel-btn" class="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium">
                  ❌ Cancel
                </button>
              </div>
            </div>
          `;
          
          const video = document.getElementById('camera-video') as HTMLVideoElement;
          const captureBtn = document.getElementById('capture-btn');
          const cancelBtn = document.getElementById('cancel-btn');
          
          if (video) {
            video.srcObject = stream;
          }
          
          if (captureBtn) {
            captureBtn.onclick = () => capturePhoto(video, stream);
          }
          
          if (cancelBtn) {
            cancelBtn.onclick = () => {
              stream.getTracks().forEach(track => track.stop());
              setShowCamera(false);
            };
          }
        }
      };
      
      // Setup camera after state update
      setTimeout(setupCamera, 100);
    } catch (error) {
      alert('Camera access denied or not available. Please use file upload instead.');
    }
  };

  const capturePhoto = (video: HTMLVideoElement, stream: MediaStream) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    if (context) {
      context.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          setImageFile(file);
          setImagePreview(URL.createObjectURL(blob));
        }
      }, 'image/jpeg', 0.8);
    }
    
    // Stop camera stream
    stream.getTracks().forEach(track => track.stop());
    setShowCamera(false);
    
    // Clear camera container
    const container = document.getElementById('camera-container');
    if (container) {
      container.innerHTML = '';
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Cleanup camera stream when component unmounts or showCamera changes
  useEffect(() => {
    return () => {
      if (showCamera) {
        // Cleanup any active camera streams
        navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
          stream.getTracks().forEach(track => track.stop());
        }).catch(() => {
          // Ignore errors during cleanup
        });
      }
    };
  }, [showCamera]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipe.trim() && !imageFile) {
      setError('Please enter a recipe or choose an image.');
      return;
    }

    if (dietaryRestrictions.length === 0 && allergies.length === 0) {
      if (!confirm('No dietary restrictions or allergies selected. Continue with no adaptations?')) {
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      let response;
      
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        dietaryRestrictions.forEach(restriction => {
          formData.append('dietary_restrictions', restriction);
        });
        allergies.forEach(allergy => {
          formData.append('allergies', allergy);
        });
        
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/adapt-from-image`, {
          method: 'POST',
          body: formData
        });
      } else {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/adapt-recipe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipe_text: recipe,
            dietary_restrictions: dietaryRestrictions,
            allergies: allergies
          })
        });
      }

      if (!response.ok) {
        throw new Error('Failed to adapt recipe');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/20 backdrop-blur-md border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                <img src="/logo.svg" alt="AdaptiveEats Logo" className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">AdaptiveEats</h1>
                <p className="text-sm text-gray-300">AI-powered recipe adaptation</p>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-4">Transform Any Recipe</h2>
            <p className="text-xl text-gray-300">Upload an image or paste a recipe to get AI-powered adaptations for your dietary needs</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Recipe Input */}
            <div className="space-y-4">
              <label className="flex items-center space-x-2 text-white font-medium">
                <DocumentTextIcon className="w-5 h-5" />
                <span>Recipe</span>
              </label>
              <textarea
                value={recipe}
                onChange={(e) => setRecipe(e.target.value)}
                placeholder="Paste your recipe here... (optional if uploading image)"
                className="w-full h-32 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <label className="flex items-center space-x-2 text-white font-medium">
                <CameraIcon className="w-5 h-5" />
                <span>Or upload a food image</span>
              </label>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-64 object-cover rounded-xl border border-white/20"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Camera Container */}
              {showCamera && (
                <div className="border-2 border-white/30 rounded-xl p-6 bg-black/30">
                  <div id="camera-container" className="text-center">
                    <p className="text-white/70 mb-4">Camera is starting...</p>
                    {/* Camera feed will be inserted here */}
                  </div>
                </div>
              )}


              {/* Upload Options */}
              {!imagePreview && !showCamera && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* File Upload */}
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="border-2 border-dashed border-white/30 rounded-xl p-6 text-center hover:border-white/50 transition-colors h-32 flex flex-col items-center justify-center">
                      <DocumentTextIcon className="w-8 h-8 text-white/50 mb-2" />
                      <p className="text-white/70 text-sm">Choose from files</p>
                    </div>
                  </div>

                  {/* Camera Capture */}
                  <button
                    type="button"
                    onClick={captureFromCamera}
                    className="border-2 border-dashed border-white/30 rounded-xl p-6 text-center hover:border-white/50 transition-colors h-32 flex flex-col items-center justify-center"
                  >
                    <CameraIcon className="w-8 h-8 text-white/50 mb-2" />
                    <p className="text-white/70 text-sm">Take a photo</p>
                  </button>
                </div>
              )}

              <p className="text-sm text-white/50 text-center">
                If an image is selected, the app will recognize the dish and generate a suitable recipe.
              </p>
            </div>

            {/* Dietary Restrictions */}
            <DietarySelector
              options={dietaryOptions}
              selected={dietaryRestrictions}
              onChange={setDietaryRestrictions}
            />

            {/* Allergies */}
            <AllergyInput
              allergies={allergies}
              onChange={setAllergies}
            />

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-orange-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
            >
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <img src="/logo.svg" alt="Adapt" className="w-5 h-5" />
                  <span>Adapt Recipe</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200"
              >
                <div className="flex items-center space-x-2">
                  <XMarkIcon className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8"
              >
                <RecipeCard result={result} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}