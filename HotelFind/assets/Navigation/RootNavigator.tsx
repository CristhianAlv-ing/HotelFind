import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AppStack from './AppStack';
import AuthStack from './AuthStack';

const Stack = createStackNavigator();

const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthStack} />
        <Stack.Screen name="App" component={AppStack} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;