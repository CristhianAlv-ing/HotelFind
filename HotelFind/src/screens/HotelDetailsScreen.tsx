
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from '../theme/colors';

const HotelDetailsScreen: React.FC<any> = ({ route }) => {
  const hotel = route?.params?.hotel;

  if (!hotel) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No hay datos del hotel disponibles</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {hotel.image ? <Image source={{ uri: hotel.image }} style={styles.image} /> : null}
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
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.pureWhite,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    color: colors.deepBlue,
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 12,
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