import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Stack = createNativeStackNavigator();

const AuthStack = ({ setIsLoggedIn }: { setIsLoggedIn: (value: boolean) => void }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login">
        {(props) => (
          <LoginScreen
            {...props}
            route={{ ...props.route, params: { setIsLoggedIn } }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Register">
        {(props) => (
          <RegisterScreen
            {...props}
            route={{ ...props.route, params: { setIsLoggedIn } }}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default AuthStack;
