import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

const LoginScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput 
                style={styles.input} 
                placeholder="Email" 
                keyboardType="email-address" 
                autoCapitalize="none" 
            />
            <TextInput 
                style={styles.input} 
                placeholder="Password" 
                secureTextEntry 
            />
            <Button title="Login" onPress={() => {}} color={colors.vibrantOrange} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
        backgroundColor: colors.pureWhite,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.deepBlue,
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderColor: colors.darkGray,
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 16,
    },
});

export default LoginScreen;