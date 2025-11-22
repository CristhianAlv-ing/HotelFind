import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { lightTheme, darkTheme } from '../../theme/themes';
import { getTranslation } from '../../utils/translations';

import HomeScreen from '../../screens/HomeScreen';
import SearchScreen from '../../screens/SearchScreen';
import ProfileScreen from '../../screens/ProfileScreen';
import SettingsScreen from '../../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

interface MainTabsProps {
  setIsLoggedIn: (value: boolean) => void;
}

const ProfileStack = ({ setIsLoggedIn }: { setIsLoggedIn: (value: boolean) => void }) => {
  const { language, theme } = useApp();
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.deepBlue },
        headerTintColor: colors.pureWhite,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: getTranslation(language, 'profile') }}
        initialParams={{ setIsLoggedIn }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: getTranslation(language, 'settings') }}
      />
    </Stack.Navigator>
  );
};

const MainTabs: React.FC<MainTabsProps> = ({ setIsLoggedIn }) => {
  const { language, theme } = useApp();
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Search') iconName = focused ? 'search' : 'search-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.vibrantOrange,
        tabBarInactiveTintColor: colors.darkGray,
        tabBarStyle: {
          backgroundColor: currentTheme.background,
          borderTopColor: currentTheme.border,
          borderTopWidth: 1,
        },
        headerShown: true,
        headerStyle: { backgroundColor: colors.deepBlue },
        headerTintColor: colors.pureWhite,
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: getTranslation(language, 'home') }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ title: getTranslation(language, 'search') }}
      />
      <Tab.Screen
        name="Profile"
        component={() => <ProfileStack setIsLoggedIn={setIsLoggedIn} />}
        options={{ title: getTranslation(language, 'profile'), headerShown: false }}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;