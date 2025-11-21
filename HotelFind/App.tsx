import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
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
    <NavigationContainer>
      {isLoggedIn ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}