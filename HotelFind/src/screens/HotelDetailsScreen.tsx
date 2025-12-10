import React from 'react';
import { View, Text, StyleSheet, Image, Linking, TouchableOpacity, ScrollView, FlatList, Dimensions, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import { useDispatch, useSelector } from 'react-redux';
import { addFavoriteHotel, removeFavoriteHotel } from '../slices/userReducer';
import { RootState } from '../redux/Store';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const HotelDetailsScreen: React.FC<any> = ({ route, navigation }) => {
  const { language } = useApp();
  const hotel = route?.params?.hotel;
  const dispatch = useDispatch();
  const favorites = useSelector((state: RootState) => state.user.favoriteHotels || []);

  if (!hotel) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{getTranslation(language, 'noHotelData')}</Text>
      </View>
    );
  }

  const isFavorite = favorites.some(f => (f.place_id && hotel.place_id && f.place_id === hotel.place_id) || (f.name === hotel.name && f.lat === hotel.lat && f.lng === hotel.lng));

  const toggleFavorite = () => {
    if (isFavorite) {
      dispatch(removeFavoriteHotel({ place_id: hotel.place_id, id: hotel.id, name: hotel.name }));
      Alert.alert(getTranslation(language, 'removed') || 'Eliminado', getTranslation(language, 'removedFromFavorites') || 'El hotel fue quitado de favoritos');
    } else {
      const fav = {
        id: hotel.id,
        place_id: hotel.place_id,
        name: hotel.name,
        description: hotel.description || hotel.address,
        image: hotel.image,
        photos: hotel.photos,
        price: hotel.price,
        rating: hotel.rating,
        phone: hotel.phone,
        website: hotel.website,
        lat: hotel.lat,
        lng: hotel.lng,
      };
      dispatch(addFavoriteHotel(fav));
      Alert.alert(getTranslation(language, 'added') || 'Añadido', getTranslation(language, 'addedToFavorites') || 'El hotel fue agregado a favoritos');
    }
  };

  const openWebsite = () => {
    if (hotel.website) {
      Linking.openURL(hotel.website).catch(() => {});
    }
  };

  const openPhone = () => {
    if (hotel.phone) {
      Linking.openURL(`tel:${hotel.phone}`).catch(() => {});
    }
  };

  const images: string[] = hotel.photos && Array.isArray(hotel.photos) && hotel.photos.length > 0
    ? hotel.photos
    : hotel.image ? [hotel.image] : [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {images.length > 0 ? (
        <FlatList
          data={images}
          keyExtractor={(i: string, idx: number) => `${i}-${idx}`}
          renderItem={({ item }) => <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imageList}
        />
      ) : null}

      <View style={styles.headerRow}>
        <Text style={styles.title}>{hotel.name}</Text>
        <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
          <Icon name={isFavorite ? 'heart' : 'heart-outline'} size={22} color={isFavorite ? colors.vibrantOrange : colors.deepBlue} />
        </TouchableOpacity>
      </View>

      {hotel.rating ? <Text style={styles.rating}>⭐ {hotel.rating}</Text> : null}
      <Text style={styles.description}>{hotel.description || hotel.address}</Text>
      {hotel.price ? <Text style={styles.price}>${hotel.price} {getTranslation(language, 'perNight')}</Text> : null}

      {hotel.phone ? (
        <TouchableOpacity onPress={openPhone} style={styles.linkRow}>
          <Text style={styles.linkText}>{getTranslation(language, 'call') || 'Llamar'}: {hotel.phone}</Text>
        </TouchableOpacity>
      ) : null}

      {hotel.website ? (
        <TouchableOpacity onPress={openWebsite} style={styles.linkRow}>
          <Text style={styles.linkText}>{getTranslation(language, 'website') || 'Sitio web'}</Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.pureWhite,
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
  imageList: {
    marginBottom: 12,
  },
  image: {
    width: width * 0.9,
    height: 220,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.deepBlue,
    marginVertical: 10,
    flex: 1,
  },
  favoriteButton: {
    marginLeft: 12,
  },
  rating: {
    fontSize: 16,
    color: '#444',
    marginBottom: 6,
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
  linkRow: {
    marginTop: 12,
    paddingVertical: 10,
  },
  linkText: {
    color: colors.vibrantOrange,
    fontWeight: '600',
  },
});

export default HotelDetailsScreen;