import React from 'react';
import { View, Text, StyleSheet, TextInput, Button } from 'react-native';
import { colors } from '../theme/colors'

const SearchScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Buscar Hoteles</Text>
            <TextInput 
                style={styles.input} 
                placeholder="Introduzca su destino" 
                placeholderTextColor={colors.darkGray} 
            />
            <Button title="Buscar" onPress={() => {}} color={colors.vibrantOrange} />
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