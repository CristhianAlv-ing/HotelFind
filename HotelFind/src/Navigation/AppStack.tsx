// src/Navigation/AppStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreenNew from '../screens/HomeScreenNew';
import SearchScreenNew from '../screens/SearchScreenNew';
import HotelDetailsScreen from '../screens/HotelDetailsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OfferDetailsScreen from '../screens/OfferDetailsScreen';
import ReservationsScreen from '../screens/ReservationsScreen';
import CreateReservationScreen from '../screens/CreateReservationScreen';

const Stack = createNativeStackNavigator();

const AppStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="Home" component={HomeScreenNew} />
            <Stack.Screen name="Search" component={SearchScreenNew} />
            <Stack.Screen name="Reservations" component={ReservationsScreen} />
            <Stack.Screen name="CreateReservation" component={CreateReservationScreen} />
            <Stack.Screen name="HotelDetails" component={HotelDetailsScreen} />
            <Stack.Screen name="OfferDetails" component={OfferDetailsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
    );
};

export default AppStack;