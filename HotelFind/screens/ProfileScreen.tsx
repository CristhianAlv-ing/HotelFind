import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

const ProfileScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>User Profile</Text>
            {/* Additional profile information can be added here */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.PureWhite,
    },
    title: {
        fontSize: 24,
        color: colors.DarkGray,
    },
});

export default ProfileScreen;