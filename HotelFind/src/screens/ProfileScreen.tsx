import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { lightTheme, darkTheme } from '../theme/themes';
import { getTranslation } from '../utils/translations';

const ProfileScreen: React.FC<any> = ({ route, navigation }) => {
  const { setIsLoggedIn } = route.params;
  const { language, theme } = useApp();
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', 'Estas seguro que deseas cerrar sesión?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Cerrar Sesión',
        onPress: () => {
          setIsLoggedIn(false);
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={styles.profileHeader}>
        <Ionicons name="person-circle" size={80} color={colors.vibrantOrange} />
        <Text style={[styles.name, { color: currentTheme.text }]}>Cristhian Alvarez</Text>
        <Text style={[styles.email, { color: currentTheme.secondaryText }]}>
          CristhianAlvarez@example.com
        </Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity
          style={[styles.menuItem, { borderBottomColor: currentTheme.border }]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={24} color={colors.deepBlue} />
          <Text style={[styles.menuText, { color: currentTheme.text }]}>
            {getTranslation(language, 'settings')}
          </Text>
          <Ionicons name="chevron-forward" size={24} color={currentTheme.secondaryText} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { borderBottomColor: currentTheme.border }]}
        >
          <Ionicons name="bookmark-outline" size={24} color={colors.deepBlue} />
          <Text style={[styles.menuText, { color: currentTheme.text }]}>
            {getTranslation(language, 'savedHotels')}
          </Text>
          <Ionicons name="chevron-forward" size={24} color={currentTheme.secondaryText} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { borderBottomColor: currentTheme.border }]}
        >
          <Ionicons name="help-circle-outline" size={24} color={colors.deepBlue} />
          <Text style={[styles.menuText, { color: currentTheme.text }]}>
            {getTranslation(language, 'helpSupport')}
          </Text>
          <Ionicons name="chevron-forward" size={24} color={currentTheme.secondaryText} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color={colors.pureWhite} />
        <Text style={styles.logoutText}>
          {getTranslation(language, 'logout')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  email: {
    fontSize: 14,
    marginTop: 4,
  },
  menu: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuText: {
    marginLeft: 16,
    fontSize: 16,
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: colors.vibrantOrange,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: colors.pureWhite,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ProfileScreen;