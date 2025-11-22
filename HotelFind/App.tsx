import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { AppProvider, useApp } from './src/context/AppContext';
import MainTabs from './src/Navigation/MainTabs';
import AuthStack from './src/Navigation/AuthStack';
import { Provider } from 'react-redux';
import { store } from './src/redux/Store';

const AppContent = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const { theme } = useApp();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        setIsLoggedIn(!!token);
      } catch (error) {
        console.log('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#004DCC" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={theme === 'light' ? DefaultTheme : DarkTheme}>
      {isLoggedIn ? (
        <MainTabs setIsLoggedIn={setIsLoggedIn} />
      ) : (
        <AuthStack setIsLoggedIn={setIsLoggedIn} />
      )}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </Provider>
  );
}
