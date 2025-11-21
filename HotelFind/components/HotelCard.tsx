import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/color';

const HotelCard = ({ hotel }) => {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>{hotel.name}</Text>
            <Text style={styles.description}>{hotel.description}</Text>
            <Text style={styles.price}>${hotel.price} per night</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.pureWhite,
        borderRadius: 10,
        padding: 15,
        margin: 10,
        shadowColor: colors.darkGray,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.deepBlue,
    },
    description: {
        fontSize: 14,
        color: colors.darkGray,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.goldenYellow,
    },
});

export default HotelCard;