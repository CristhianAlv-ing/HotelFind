import 'react-native-url-polyfill/auto';
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppProvider } from './src/context/AppContext';
import MainTabs from './src/Navigation/MainTabs';
import AuthStack from './src/Navigation/AuthStack';
import CreateReservationScreen from './src/screens/CreateReservationScreen';
import HotelDetailsScreen from './src/screens/HotelDetailsScreen';
import OfferDetailsScreen from './src/screens/OfferDetailsScreen';
import { Provider } from 'react-redux';
import { store, persistor } from './src/redux/Store';
import { PersistGate } from 'redux-persist/integration/react';

const AppContent = ({ isLoggedIn, setIsLoggedIn }: any) => {
  const RootStack = createNativeStackNavigator();

  // mantenemos el flujo de login normal; PersistGate rehidrata Redux antes de montar la app
  return (
    <NavigationContainer theme={DefaultTheme}>
      {isLoggedIn ? (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="MainTabs">
            {(props) => <MainTabs {...props} setIsLoggedIn={setIsLoggedIn} />}
          </RootStack.Screen>
          <RootStack.Screen name="CreateReservation" component={CreateReservationScreen} />
          <RootStack.Screen name="HotelDetails" component={HotelDetailsScreen} />
          <RootStack.Screen name="OfferDetails" component={OfferDetailsScreen} />
        </RootStack.Navigator>
      ) : (
        <AuthStack setIsLoggedIn={setIsLoggedIn} />
      )}
    </NavigationContainer>
  );
};

const Root = () => {
  // El control de isLoggedIn lo dejo en AppContent según tu lógica; si quieres auto-login usando token guardado, puedes expandirlo aquí.
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  return (
    <Provider store={store}>
      <AppProvider>
        <PersistGate
          loading={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#004DCC" />
            </View>
          }
          persistor={persistor}
        >
          <AppContent isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        </PersistGate>
      </AppProvider>
    </Provider>
  );
};

export default Root;