import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppProvider } from './context/AppContext';
import MainTabs from './assets/Navigation/MainTabs';
import AuthStack from './assets/Navigation/AuthStack';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular verificación de token/sesión
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return null;
  }

  return (
    <AppProvider>
      <NavigationContainer>
        {isLoggedIn ? (
          <MainTabs setIsLoggedIn={setIsLoggedIn} />
        ) : (
          <AuthStack setIsLoggedIn={setIsLoggedIn} />
        )}
      </NavigationContainer>
    </AppProvider>
  );
}