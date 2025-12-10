import { configureStore, combineReducers } from '@reduxjs/toolkit';
import userReducer from '../slices/userReducer';
import hotelReducer from '../slices/hotelReducer';

// IMPORTS DIRECTOS A ARCHIVOS DE 'redux-persist' PARA EVITAR QUE Metro USE index.js
// Esto evita el error "UnableToResolveError ... ./persistStore" al resolver el index del paquete.
import persistReducer from 'redux-persist/lib/persistReducer';
import persistStore from 'redux-persist/lib/persistStore';
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist/lib/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistStore as createPersistStore } from 'redux-persist'; // opcional si lo necesitas en otros lados

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['user'], // persistimos sólo user (favoritos)
};

const rootReducer = combineReducers({
  user: userReducer,
  hotel: hotelReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorar acciones de redux-persist para evitar warnings de serializabilidad
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Crear el persistor con la función importada directamente
export const persistor = persistStore(store);

// Tipos
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;