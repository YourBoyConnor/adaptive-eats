import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import RecipeResultScreen from './src/screens/RecipeResultScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a1a2e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ 
            title: 'AdaptiveEats',
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="RecipeResult" 
          component={RecipeResultScreen}
          options={{ 
            title: 'Recipe Adapted',
            headerBackTitle: 'Back'
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}