import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  Linking,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RecipeResponse, DietaryOption, Allergy } from '../types';
import { API_BASE_URL } from '../utils/config';
import { SvgXml } from 'react-native-svg';

type RootStackParamList = {
  Home: undefined;
  RecipeResult: { result: RecipeResponse };
};

const breadLogoSvg = `<svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Bread loaf -->
  <path d="M8 15C8 12.7909 9.79086 11 12 11H28C30.2091 11 32 12.7909 32 15V25C32 27.2091 30.2091 29 28 29H12C9.79086 29 8 27.2091 8 25V15Z" fill="#F4A261" stroke="#D08B3A" stroke-width="1.5"/>
  
  <!-- Bread texture lines -->
  <path d="M10 17H30M10 19H30M10 21H30M10 23H30" stroke="#D08B3A" stroke-width="0.8" opacity="0.6"/>
  
  <!-- Top crust -->
  <path d="M10 15C10 13.8954 10.8954 13 12 13H28C29.1046 13 30 13.8954 30 15V17H10V15Z" fill="#E76F51"/>
  
  <!-- Sparkle 1 (top right) -->
  <path d="M32 8L34 4L36 8L40 10L36 12L34 16L32 12L28 10L32 8Z" fill="#FFD700"/>
  
  <!-- Sparkle 2 (bottom left) -->
  <path d="M4 28L6 24L8 28L12 30L8 32L6 36L4 32L0 30L4 28Z" fill="#FFD700"/>
  
  <!-- Sparkle 3 (top left) -->
  <path d="M6 6L8 2L10 6L14 8L10 10L8 14L6 10L2 8L6 6Z" fill="#FFD700"/>
  
  <!-- Sparkle 4 (bottom right) -->
  <path d="M30 32L32 28L34 32L38 34L34 36L32 40L30 36L26 34L30 32Z" fill="#FFD700"/>
  
  <!-- Small sparkles -->
  <circle cx="35" cy="20" r="1.5" fill="#FFD700"/>
  <circle cx="5" cy="20" r="1.5" fill="#FFD700"/>
  <circle cx="20" cy="5" r="1" fill="#FFD700"/>
  <circle cx="20" cy="35" r="1" fill="#FFD700"/>
</svg>`;

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const DIETARY_OPTIONS: Omit<DietaryOption, 'selected'>[] = [
  { id: 'vegan', label: 'Vegan' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'gluten-free', label: 'Gluten-Free' },
  { id: 'keto', label: 'Keto' },
  { id: 'paleo', label: 'Paleo' },
  { id: 'dairy-free', label: 'Dairy-Free' },
  { id: 'nut-free', label: 'Nut-Free' },
  { id: 'low-sodium', label: 'Low-Sodium' },
  { id: 'diabetic-friendly', label: 'Diabetic-Friendly' },
];

export default function HomeScreen({ navigation }: Props) {
  const [recipe, setRecipe] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<DietaryOption[]>(
    DIETARY_OPTIONS.map(option => ({ ...option, selected: false }))
  );
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [newAllergy, setNewAllergy] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const imageScale = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Create animated values for dietary options
  const dietaryOptionAnims = useRef(
    DIETARY_OPTIONS.map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(30)
    }))
  ).current;

  // Animation functions
  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate dietary options with stagger
    dietaryOptionAnims.forEach((anim, index) => {
      Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 600,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateY, {
          toValue: 0,
          duration: 600,
          delay: index * 100,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateImageAppear = () => {
    Animated.spring(imageScale, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const animatePulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Start animations on mount
  useEffect(() => {
    animateIn();
    if (isLoading) {
      animatePulse();
    }
  }, [isLoading]);

  // Animate image when it appears
  useEffect(() => {
    if (imageUri) {
      animateImageAppear();
    }
  }, [imageUri]);

  const toggleDietaryRestriction = (id: string) => {
    setDietaryRestrictions(prev =>
      prev.map(option =>
        option.id === id ? { ...option, selected: !option.selected } : option
      )
    );
  };

  const addAllergy = (name: string) => {
    if (name.trim() && !allergies.find(a => a.name.toLowerCase() === name.trim().toLowerCase())) {
      setAllergies(prev => [...prev, { id: Date.now().toString(), name: name.trim() }]);
      setNewAllergy('');
    }
  };

  const removeAllergy = (id: string) => {
    setAllergies(prev => prev.filter(a => a.id !== id));
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      addAllergy(newAllergy);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload images!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Gallery Error', 'Unable to access photo library. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera permissions to take photos!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Camera Error', 'Unable to access camera. Please try again.');
    }
  };

  const handleSubmit = async () => {
    animateButtonPress();
    
    if (!recipe.trim() && !imageUri) {
      Alert.alert('Error', 'Please enter a recipe or choose an image.');
      return;
    }

    const selectedRestrictions = dietaryRestrictions
      .filter(option => option.selected)
      .map(option => option.id);

    if (selectedRestrictions.length === 0 && allergies.length === 0) {
      Alert.alert(
        'No restrictions selected',
        'No dietary restrictions or allergies selected. Continue with no adaptations?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => submitRecipe(selectedRestrictions) }
        ]
      );
      return;
    }

    submitRecipe(selectedRestrictions);
  };

  const submitRecipe = async (restrictions: string[]) => {
    setIsLoading(true);

    try {
      console.log('API_BASE_URL:', API_BASE_URL);
      let response;

      if (imageUri) {
        const formData = new FormData();
        formData.append('file', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'image.jpg',
        } as any);
        restrictions.forEach(restriction => {
          formData.append('dietary_restrictions', restriction);
        });
        allergies.forEach(allergy => {
          formData.append('allergies', allergy.name);
        });

        const imageUrl = `${API_BASE_URL}/adapt-from-image`;
        console.log('Image upload URL:', imageUrl);
        response = await fetch(imageUrl, {
          method: 'POST',
          body: formData,
          // Don't set Content-Type header - let fetch set it automatically for FormData
        });
      } else {
        const recipeUrl = `${API_BASE_URL}/adapt-recipe`;
        console.log('Recipe URL:', recipeUrl);
        response = await fetch(recipeUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipe_text: recipe,
            dietary_restrictions: restrictions,
            allergies: allergies.map(a => a.name),
          }),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.log('API Error Response:', errorText);
        throw new Error(`Failed to adapt recipe: ${response.status} ${response.statusText}`);
      }

      const data: RecipeResponse = await response.json();
      
      // Debug logging
      console.log('Raw API response:', JSON.stringify(data, null, 2));
      
      // Validate the response structure
      if (!data.adapted_recipe) {
        console.log('Invalid response structure:', data);
        throw new Error('Invalid response: missing adapted_recipe');
      }
      
      // Ensure arrays are properly initialized
      if (!Array.isArray(data.substitutions_made)) {
        data.substitutions_made = [];
      }
      
      if (!Array.isArray(data.nutrition_facts)) {
        data.nutrition_facts = [];
      }
      
      console.log('Parsed data successfully:', {
        adapted_recipe_preview: data.adapted_recipe?.substring(0, 100) + '...',
        substitutions_count: data.substitutions_made?.length || 0,
        nutrition_count: data.nutrition_facts?.length || 0,
        substitutions: data.substitutions_made,
        nutrition: data.nutrition_facts
      });
      
      navigation.navigate('RecipeResult', { result: data });
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Animated.View 
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.title}>AdaptiveEats</Text>
          <Text style={styles.subtitle}>AI-powered recipe adaptation</Text>
        </Animated.View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          {/* Input Method Selection */}
          <View style={styles.inputMethodSection}>
            <Text style={styles.sectionTitle}>How would you like to start?</Text>
            
            {/* Recipe Input */}
            <View style={styles.inputCard}>
              <Text style={styles.inputCardTitle}>📝 Text Recipe</Text>
              <TextInput
                style={styles.textInput}
                value={recipe}
                onChangeText={setRecipe}
                placeholder="Paste your recipe here..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Image Upload */}
            <View style={styles.inputCard}>
              <Text style={styles.inputCardTitle}>📷 Food Image</Text>
              <View style={styles.imageButtons}>
                <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                  <Text style={styles.imageButtonText}>📷 Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                  <Text style={styles.imageButtonText}>📸 Camera</Text>
                </TouchableOpacity>
              </View>
              {imageUri && (
                <Animated.View 
                  style={[
                    styles.imagePreview,
                    {
                      transform: [{ scale: imageScale }]
                    }
                  ]}
                >
                  <Image source={{ uri: imageUri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setImageUri(null)}
                  >
                    <Text style={styles.removeImageText}>✕</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          </View>

          {/* Dietary Preferences */}
          <View style={styles.preferencesSection}>
            <Text style={styles.sectionTitle}>Your Preferences</Text>
            
            {/* Dietary Restrictions */}
            <View style={styles.preferenceCard}>
              <Text style={styles.preferenceLabel}>Dietary Restrictions</Text>
              <View style={styles.optionsGrid}>
                {dietaryRestrictions.map((option, index) => (
                  <Animated.View
                    key={option.id}
                    style={{
                      opacity: dietaryOptionAnims[index].opacity,
                      transform: [
                        { translateY: dietaryOptionAnims[index].translateY }
                      ]
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        option.selected && styles.optionButtonSelected
                      ]}
                      onPress={() => {
                        animateButtonPress();
                        toggleDietaryRestriction(option.id);
                      }}
                    >
                      <Text style={[
                        styles.optionText,
                        option.selected && styles.optionTextSelected
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            </View>

            {/* Allergies */}
            <View style={styles.preferenceCard}>
              <Text style={styles.preferenceLabel}>Allergies</Text>
              <View style={styles.allergyInputContainer}>
                <TextInput
                  style={styles.allergyInput}
                  value={newAllergy}
                  onChangeText={setNewAllergy}
                  placeholder="Add an allergy..."
                  placeholderTextColor="#999"
                  onSubmitEditing={handleAddAllergy}
                  returnKeyType="done"
                />
                <TouchableOpacity 
                  style={styles.addAllergyButton}
                  onPress={handleAddAllergy}
                >
                  <Text style={styles.addAllergyButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              {allergies.length > 0 && (
                <View style={styles.allergyTags}>
                  {allergies.map((allergy) => (
                    <View key={allergy.id} style={styles.allergyTag}>
                      <Text style={styles.allergyTagText}>{allergy.name}</Text>
                      <TouchableOpacity
                        onPress={() => removeAllergy(allergy.id)}
                        style={styles.removeAllergyButton}
                      >
                        <Text style={styles.removeAllergyText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Submit Button */}
          <Animated.View
            style={[
              styles.submitContainer,
              {
                transform: [
                  { scale: buttonScale },
                  ...(isLoading ? [{ scale: pulseAnim }] : [])
                ]
              }
            ]}
          >
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Adapt Recipe</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </ScrollView>

      {/* Fixed Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLogo}>
          <SvgXml xml={breadLogoSvg} width={24} height={24} />
          <Text style={styles.footerBrand}>AdaptiveEats</Text>
        </View>
        <Text style={styles.footerText}>
          Powered by AI • Transform any recipe to fit your dietary needs
        </Text>
        <Text style={styles.creditText}>
          Made by{' '}
          <Text 
            style={styles.creditLink}
            onPress={() => {
              Linking.openURL('https://connorpymm.com');
            }}
          >
            Connor Pymm
          </Text>
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#e0e0e0',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    paddingHorizontal: 20,
  },
  inputMethodSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  imageButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  imageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  imagePreview: {
    marginTop: 12,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  preferencesSection: {
    marginBottom: 24,
  },
  preferenceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderRadius: 16,
  },
  optionButtonSelected: {
    backgroundColor: '#ff6b35',
    borderColor: '#e55a2b',
  },
  optionText: {
    color: '#e0e0e0',
    fontSize: 13,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#fff',
  },
  allergyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  allergyInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  addAllergyButton: {
    backgroundColor: '#ff6b35',
    borderRadius: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAllergyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  allergyTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    borderColor: '#ff6b35',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  allergyTagText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    marginRight: 6,
  },
  removeAllergyButton: {
    marginLeft: 4,
  },
  removeAllergyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitContainer: {
    marginTop: 8,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#ff6b35',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#ff6b35',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  footerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  footerBrand: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  creditText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
    textAlign: 'center',
  },
  creditLink: {
    color: 'rgba(255, 255, 255, 0.7)',
    textDecorationLine: 'underline',
  },
});
