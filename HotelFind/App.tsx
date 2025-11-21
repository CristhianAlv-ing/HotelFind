import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
type Language = 'es' | 'en' | 'zh' | 'fr';
type Theme = 'light' | 'dark';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('es');
  const [theme, setThemeState] = useState<Theme>('light');
  const [isLoading, setIsLoading] = useState(true);

  // Cargar preferencias guardadas al iniciar
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('appLanguage');
      const savedTheme = await AsyncStorage.getItem('appTheme');

      if (savedLanguage) setLanguageState(savedLanguage as Language);
      if (savedTheme) setThemeState(savedTheme as Theme);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem('appLanguage', lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const setTheme = async (theme: Theme) => {
    setThemeState(theme);
    try {
      await AsyncStorage.setItem('appTheme', theme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <AppContext.Provider value={{ language, setLanguage, theme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};