import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/color';

const HomeScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to HotelFind</Text>
            <Text style={styles.subtitle}>Find your perfect hotel!</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.pureWhite,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.deepBlue,
    },
    subtitle: {
        fontSize: 16,
        color: colors.darkGray,
    },
});

export default HomeScreen;