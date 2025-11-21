import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/color';

const ProfileScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>User Profile</Text>
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
        color: colors.darkGray,
    },
});

export default ProfileScreen;