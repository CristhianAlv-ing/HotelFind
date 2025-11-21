import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from '../theme/color';

const HotelDetailsScreen = ({ route }) => {
    const { hotel } = route.params;

    return (
        <View style={styles.container}>
            <Image source={{ uri: hotel.image }} style={styles.image} />
            <Text style={styles.title}>{hotel.name}</Text>
            <Text style={styles.description}>{hotel.description}</Text>
            <Text style={styles.price}>${hotel.price} per night</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.pureWhite,
        padding: 16,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.deepBlue,
        marginVertical: 10,
    },
    description: {
        fontSize: 16,
        color: colors.darkGray,
        marginVertical: 5,
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.goldenYellow,
        marginTop: 10,
    },
});

export default HotelDetailsScreen;