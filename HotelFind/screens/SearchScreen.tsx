import React from 'react';
import { View, Text, StyleSheet, TextInput, Button } from 'react-native';
import { colors } from '../theme/colors';

const SearchScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Search for Hotels</Text>
            <TextInput 
                style={styles.input} 
                placeholder="Enter location" 
                placeholderTextColor={colors.DarkGray} 
            />
            <Button title="Search" onPress={() => {}} color={colors.VibrantOrange} />
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
        color: colors.DeepBlue,
        marginBottom: 20,
    },
    input: {
        height: 40,
        borderColor: colors.DarkGray,
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 10,
        width: '80%',
    },
});

export default SearchScreen;