import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/color';

const Header = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>HotelFind</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.deepBlue,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: colors.pureWhite,
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default Header;