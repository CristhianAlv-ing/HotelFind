import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { lightTheme, darkTheme } from '../theme/themes';
import { getTranslation } from '../utils/translations';

const SettingsScreen: React.FC<any> = ({ navigation }) => {
  const { language, theme } = useApp();
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
      contentContainerStyle={{ paddingBottom: 24, paddingTop: 24 }}
    >
      <View style={{ alignItems: 'center', paddingVertical: 60 }}>
        <Ionicons name="settings-outline" size={80} color={colors.vibrantOrange} />
        <Text style={[styles.emptyText, { color: currentTheme.text, marginTop: 20, fontSize: 18 }]}>
          {getTranslation(language, 'settings') || 'Configuración'}
        </Text>
        <Text style={[styles.emptySubtext, { color: currentTheme.secondaryText, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 }]}>
          Las configuraciones de idioma y apariencia están disponibles en tu perfil
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptySubtext: {
    fontSize: 14,
  },
});

export default SettingsScreen;