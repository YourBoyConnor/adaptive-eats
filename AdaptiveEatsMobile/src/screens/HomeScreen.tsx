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

type RootStackParamList = {
  Home: undefined;
  RecipeResult: { result: RecipeResponse };
};

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
    if (name.trim() && !allergies.find(a => a.name === name.trim())) {
      setAllergies(prev => [...prev, { id: Date.now().toString(), name: name.trim() }]);
    }
  };

  const removeAllergy = (id: string) => {
    setAllergies(prev => prev.filter(a => a.id !== id));
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

      const responseText = await response.text();
      
      let data: RecipeResponse;
      try {
        // Clean the response text in case there's extra content
        let cleanResponse = responseText.trim();
        
        // If response starts with HTML, extract JSON from it
        if (cleanResponse.startsWith('<')) {
          const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            cleanResponse = jsonMatch[0];
          } else {
            throw new Error('No JSON found in HTML response');
          }
        }
        
        data = JSON.parse(cleanResponse);
        
        // Validate the response structure
        if (!data.adapted_recipe) {
          console.log('Invalid response structure:', data);
          
          // Try to extract recipe from nutrition_facts if it's there
          if (data.nutrition_facts && data.nutrition_facts.length > 0) {
            console.log('Attempting to extract recipe from nutrition_facts');
            const nutritionText = data.nutrition_facts.join(' ');
            if (nutritionText.includes('Title:') || nutritionText.includes('Ingredients:')) {
              data.adapted_recipe = nutritionText;
              data.nutrition_facts = [];
            }
          }
          
          if (!data.adapted_recipe) {
            throw new Error('Invalid response: missing adapted_recipe');
          }
        }
        
        console.log('Parsed data successfully');
      } catch (parseError) {
        console.log('JSON Parse Error:', parseError);
        console.log('Raw response:', responseText);
        throw new Error(`Failed to parse server response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
      
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.title}>AdaptiveEats</Text>
          <Text style={styles.subtitle}>AI-powered recipe adaptation</Text>
        </Animated.View>

        {/* Main Content */}
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
          <Text style={styles.sectionTitle}>Transform Any Recipe</Text>
          <Text style={styles.sectionSubtitle}>
            Upload an image or paste a recipe to get AI-powered adaptations for your dietary needs
          </Text>

          {/* Recipe Input */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Recipe</Text>
            <TextInput
              style={styles.textInput}
              value={recipe}
              onChangeText={setRecipe}
              placeholder="Paste your recipe here... (optional if uploading image)"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Image Upload */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Or upload a food image</Text>
            <View style={styles.imageButtons}>
              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Text style={styles.imageButtonText}>📷 Choose Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                <Text style={styles.imageButtonText}>📸 Take Photo</Text>
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

          {/* Dietary Restrictions */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Dietary Restrictions</Text>
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

          {/* Submit Button */}
          <Animated.View
            style={{
              transform: [
                { scale: buttonScale },
                ...(isLoading ? [{ scale: pulseAnim }] : [])
              ]
            }}
          >
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>🍞 Adapt Recipe</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Footer */}
          <View style={styles.footer}>
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
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e0e0',
  },
  content: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    backdropFilter: 'blur(10px)',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#e0e0e0',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderRadius: 12,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    textAlignVertical: 'top',
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  imageButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  imageButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  imagePreview: {
    marginTop: 10,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionButtonSelected: {
    backgroundColor: '#dc3545',
    borderColor: '#c82333',
  },
  optionText: {
    color: '#e0e0e0',
    fontSize: 14,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#ff6b35',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
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
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  creditText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    textAlign: 'center',
  },
  creditLink: {
    color: 'rgba(255, 255, 255, 0.7)',
    textDecorationLine: 'underline',
  },
});
