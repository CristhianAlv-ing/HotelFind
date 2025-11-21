import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

import HomeScreen from '../../screens/HomeScreen';
import SearchScreen from '../../screens/SearchScreen';
import ProfileScreen from '../../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

interface MainTabsProps {
  setIsLoggedIn: (value: boolean) => void;
}

const MainTabs: React.FC<MainTabsProps> = ({ setIsLoggedIn }) => {
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
        tabBarStyle: { backgroundColor: colors.pureWhite, borderTopColor: colors.darkGray },
        headerShown: true,
        headerStyle: { backgroundColor: colors.deepBlue },
        headerTintColor: colors.pureWhite,
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        initialParams={{ setIsLoggedIn }}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;