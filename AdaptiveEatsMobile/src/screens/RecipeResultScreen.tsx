import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
  Linking,
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

  const shareRecipe = async () => {
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Recipe Adapted!</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Original Recipe</Text>
            <Text style={styles.recipeText}>{result.original_recipe}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Adapted Recipe</Text>
            <Text style={styles.recipeText}>{result.adapted_recipe}</Text>
          </View>

          {result.substitutions_made.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Substitutions Made</Text>
              {result.substitutions_made.map((substitution, index) => (
                <View key={index} style={styles.substitutionItem}>
                  <Text style={styles.substitutionText}>• {substitution}</Text>
                </View>
              ))}
            </View>
          )}

          {result.nutrition_facts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nutrition Facts</Text>
              {result.nutrition_facts.map((fact, index) => (
                <View key={index} style={styles.nutritionItem}>
                  <Text style={styles.nutritionText}>• {fact}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.shareButton} onPress={shareRecipe}>
              <Text style={styles.shareButtonText}>Share Recipe</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.newRecipeButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.newRecipeButtonText}>Adapt Another Recipe</Text>
            </TouchableOpacity>
          </View>

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
        </View>
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
  content: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    backdropFilter: 'blur(10px)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff6b35',
    marginBottom: 12,
  },
  recipeText: {
    fontSize: 16,
    color: '#e0e0e0',
    lineHeight: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 15,
    borderRadius: 12,
  },
  substitutionItem: {
    marginBottom: 8,
  },
  substitutionText: {
    fontSize: 16,
    color: '#e0e0e0',
    lineHeight: 22,
  },
  nutritionItem: {
    marginBottom: 8,
  },
  nutritionText: {
    fontSize: 16,
    color: '#e0e0e0',
    lineHeight: 22,
  },
  buttonContainer: {
    marginTop: 20,
    gap: 15,
  },
  shareButton: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  newRecipeButton: {
    backgroundColor: '#ff6b35',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  newRecipeButtonText: {
    color: '#fff',
    fontSize: 16,
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
