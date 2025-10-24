import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
  Linking,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RecipeResponse } from '../types';
import { SvgXml } from 'react-native-svg';
import { analytics } from '../utils/Analytics';
import { performanceMonitor } from '../utils/PerformanceMonitor';

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

type RecipeResultScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RecipeResult'>;
type RecipeResultScreenRouteProp = RouteProp<RootStackParamList, 'RecipeResult'>;

interface Props {
  navigation: RecipeResultScreenNavigationProp;
  route: RecipeResultScreenRouteProp;
}

export default function RecipeResultScreen({ navigation, route }: Props) {
  const { result } = route.params;
  
  // Debug logging
  console.log('RecipeResultScreen received data:', {
    adapted_recipe_preview: result.adapted_recipe?.substring(0, 100) + '...',
    substitutions_count: result.substitutions_made?.length || 0,
    nutrition_count: result.nutrition_facts?.length || 0,
    substitutions: result.substitutions_made,
    nutrition: result.nutrition_facts
  });
  
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Start animations on mount
  useEffect(() => {
    // Track screen view
    analytics.trackScreenView('RecipeResult');
    
    // Track screen transition performance
    const trackTransition = performanceMonitor.trackScreenTransition('RecipeResult');
    trackTransition();
    
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
  }, []);

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

  const shareRecipe = async () => {
    animateButtonPress();
    analytics.trackUserInteraction('share_recipe', 'Recipe Sharing');
    
    try {
      await Share.share({
        message: `Check out this adapted recipe!\n\n${result.adapted_recipe}`,
        title: 'Adapted Recipe from AdaptiveEats',
      });
      analytics.track('recipe_shared', {
        method: 'native_share',
        success: true,
      });
    } catch (error) {
      analytics.track('recipe_shared', {
        method: 'native_share',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
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
          <View style={styles.header}>
            <Text style={styles.title}>Recipe Adapted!</Text>
            <Text style={styles.subtitle}>Your personalized recipe is ready</Text>
          </View>
          
          <View style={styles.recipeCard}>
            <Text style={styles.cardTitle}>📝 Adapted Recipe</Text>
            <Text style={styles.recipeText}>{result.adapted_recipe}</Text>
          </View>

          {result.substitutions_made.length > 0 && (
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>🔄 Substitutions Made</Text>
              {result.substitutions_made.map((substitution, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>{substitution}</Text>
                </View>
              ))}
            </View>
          )}

          {result.nutrition_facts.length > 0 && (
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>📊 Nutrition Facts</Text>
              {result.nutrition_facts.map((fact, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>{fact}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.buttonContainer}>
            <Animated.View
              style={{
                transform: [{ scale: buttonScale }]
              }}
            >
              <TouchableOpacity style={styles.shareButton} onPress={shareRecipe}>
                <Text style={styles.shareButtonText}>📤 Share Recipe</Text>
              </TouchableOpacity>
            </Animated.View>
            <Animated.View
              style={{
                transform: [{ scale: buttonScale }]
              }}
            >
              <TouchableOpacity
                style={styles.newRecipeButton}
                onPress={() => {
                  animateButtonPress();
                  navigation.navigate('Home');
                }}
              >
                <Text style={styles.newRecipeButtonText}>Adapt Another</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#e0e0e0',
    textAlign: 'center',
  },
  recipeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6b35',
    marginBottom: 12,
  },
  recipeText: {
    fontSize: 15,
    color: '#e0e0e0',
    lineHeight: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 12,
    borderRadius: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    color: '#ff6b35',
    marginRight: 8,
    marginTop: 2,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    color: '#e0e0e0',
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 20,
    gap: 12,
  },
  shareButton: {
    backgroundColor: '#28a745',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#28a745',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  newRecipeButton: {
    backgroundColor: '#ff6b35',
    borderRadius: 16,
    padding: 16,
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
  newRecipeButtonText: {
    color: '#fff',
    fontSize: 16,
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
