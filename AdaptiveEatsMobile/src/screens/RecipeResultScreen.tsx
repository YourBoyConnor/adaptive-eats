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

type RootStackParamList = {
  Home: undefined;
  RecipeResult: { result: RecipeResponse };
};

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
    try {
      await Share.share({
        message: `Check out this adapted recipe!\n\n${result.adapted_recipe}`,
        title: 'Adapted Recipe from AdaptiveEats',
      });
    } catch (error) {
      // Error sharing recipe - silently fail
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
                <Text style={styles.newRecipeButtonText}>🍞 Adapt Another</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Fixed Footer */}
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
