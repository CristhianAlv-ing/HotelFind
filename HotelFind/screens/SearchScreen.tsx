import React from 'react';
import { View, Text, StyleSheet, TextInput, Button } from 'react-native';
import { colors } from '../theme/color'

const SearchScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Search for Hotels</Text>
            <TextInput 
                style={styles.input} 
                placeholder="Enter location" 
                placeholderTextColor={colors.darkGray} 
            />
            <Button title="Search" onPress={() => {}} color={colors.vibrantOrange} />
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
        color: colors.deepBlue,
        marginBottom: 20,
    },
    input: {
        height: 40,
        borderColor: colors.darkGray,
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 10,
        width: '80%',
    },
});

export default SearchScreen;