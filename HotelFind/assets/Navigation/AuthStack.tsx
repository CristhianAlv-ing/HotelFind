import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../../screens/LoginScreen';
import RegisterScreen from '../../screens/RegisterScreen';
import { colors } from '../../theme/colors';

const Stack = createNativeStackNavigator();

interface AuthStackProps {
  setIsLoggedIn: (value: boolean) => void;
}

const AuthStack: React.FC<AuthStackProps> = ({ setIsLoggedIn }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.pureWhite },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        initialParams={{ setIsLoggedIn }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        initialParams={{ setIsLoggedIn }}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;