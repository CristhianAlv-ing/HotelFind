import 'react-native-url-polyfill/auto';
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { AppProvider } from './src/context/AppContext';
import MainTabs from './src/Navigation/MainTabs';
import AuthStack from './src/Navigation/AuthStack';
import { Provider } from 'react-redux';
import { store, persistor } from './src/redux/Store';
import { PersistGate } from 'redux-persist/integration/react';

const AppContent = ({ isLoggedIn, setIsLoggedIn }: any) => {
  // mantenemos el flujo de login normal; PersistGate rehidrata Redux antes de montar la app
  return (
    <NavigationContainer theme={DefaultTheme}>
      {isLoggedIn ? (
        <MainTabs setIsLoggedIn={setIsLoggedIn} />
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