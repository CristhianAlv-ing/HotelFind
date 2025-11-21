import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { lightTheme, darkTheme } from '../theme/themes';
import { getTranslation } from '../utils/translations';

const SettingsScreen: React.FC<any> = ({ navigation }) => {
  const { language, setLanguage, theme, setTheme } = useApp();
  const [expandLanguage, setExpandLanguage] = useState(false);
  const [expandAppearance, setExpandAppearance] = useState(false);

  const currentTheme = theme === 'light' ? lightTheme : darkTheme;
  const isDarkMode = theme === 'dark';

  const languages = [
    { code: 'es' as const, name: getTranslation(language, 'spanish') },
    { code: 'en' as const, name: getTranslation(language, 'english') },
    { code: 'zh' as const, name: getTranslation(language, 'chinese') },
    { code: 'fr' as const, name: getTranslation(language, 'french') },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {/* Language Section */}
      <View style={[styles.section, { borderBottomColor: currentTheme.border }]}>
        <TouchableOpacity
          style={styles.header}
          onPress={() => setExpandLanguage(!expandLanguage)}
        >
          <View style={styles.headerLeft}>
            <Ionicons name="language" size={24} color={colors.vibrantOrange} />
            <Text style={[styles.headerText, { color: currentTheme.text }]}>
              {getTranslation(language, 'language')}
            </Text>
          </View>
          <Ionicons
            name={expandLanguage ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={currentTheme.text}
          />
        </TouchableOpacity>

        {expandLanguage && (
          <View style={styles.expandedContent}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.option,
                  {
                    backgroundColor:
                      language === lang.code ? colors.vibrantOrange : 'transparent',
                    borderBottomColor: currentTheme.border,
                  },
                ]}
                onPress={() => setLanguage(lang.code)}
              >
                <Ionicons
                  name={language === lang.code ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={language === lang.code ? colors.pureWhite : colors.vibrantOrange}
                />
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: language === lang.code ? colors.pureWhite : currentTheme.text,
                    },
                  ]}
                >
                  {lang.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Appearance Section */}
      <View style={[styles.section, { borderBottomColor: currentTheme.border }]}>
        <TouchableOpacity
          style={styles.header}
          onPress={() => setExpandAppearance(!expandAppearance)}
        >
          <View style={styles.headerLeft}>
            <Ionicons
              name={isDarkMode ? 'moon' : 'sunny'}
              size={24}
              color={colors.goldenYellow}
            />
            <Text style={[styles.headerText, { color: currentTheme.text }]}>
              {getTranslation(language, 'appearance')}
            </Text>
          </View>
          <Ionicons
            name={expandAppearance ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={currentTheme.text}
          />
        </TouchableOpacity>

        {expandAppearance && (
          <View style={styles.expandedContent}>
            <View
              style={[
                styles.themeOption,
                { borderBottomColor: currentTheme.border },
              ]}
            >
              <View style={styles.themeLeft}>
                <Ionicons name="sunny" size={20} color={colors.goldenYellow} />
                <Text style={[styles.optionText, { color: currentTheme.text }]}>
                  {getTranslation(language, 'lightMode')}
                </Text>
              </View>
              <Switch
                value={!isDarkMode}
                onValueChange={() => setTheme(isDarkMode ? 'light' : 'dark')}
                trackColor={{ false: '#767577', true: colors.vibrantOrange }}
                thumbColor={!isDarkMode ? colors.goldenYellow : '#f4f3f4'}
              />
            </View>

            <View style={styles.themeOption}>
              <View style={styles.themeLeft}>
                <Ionicons name="moon" size={20} color={colors.deepBlue} />
                <Text style={[styles.optionText, { color: currentTheme.text }]}>
                  {getTranslation(language, 'darkMode')}
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={() => setTheme(isDarkMode ? 'light' : 'dark')}
                trackColor={{ false: '#767577', true: colors.vibrantOrange }}
                thumbColor={isDarkMode ? colors.deepBlue : '#f4f3f4'}
              />
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    borderBottomWidth: 1,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  expandedContent: {
    paddingBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  themeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  themeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default SettingsScreen;