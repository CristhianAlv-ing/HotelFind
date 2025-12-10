import React from 'react';
import { View, Text, StyleSheet, Image, Linking, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import { useDispatch, useSelector } from 'react-redux';
import { addFavoriteOffer, removeFavoriteOffer } from '../slices/userReducer';
import { RootState } from '../redux/Store';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const OfferDetailsScreen: React.FC<any> = ({ route, navigation }) => {
  const { language } = useApp();
  const offer = route?.params?.offer;
  const dispatch = useDispatch();
  const favOffers = useSelector((state: RootState) => state.user.favoriteOffers || []);

  if (!offer) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{getTranslation(language, 'noOfferData') || 'No hay datos de la oferta'}</Text>
      </View>
    );
  }

  const isFavorite = favOffers.some(f => f.id === offer.id || (f.url && offer.url && f.url === offer.url));

  const toggleFavorite = () => {
    if (isFavorite) {
      dispatch(removeFavoriteOffer({ id: offer.id, url: offer.url }));
      Alert.alert(getTranslation(language, 'removed') || 'Eliminado', getTranslation(language, 'removedFromFavorites') || 'La oferta fue quitada de favoritos');
    } else {
      const fav = {
        id: offer.id,
        title: offer.title,
        price: offer.price,
        currency: offer.currency,
        url: offer.url,
        image: offer.image,
        provider: offer.provider,
        description: offer.description,
      };
      dispatch(addFavoriteOffer(fav));
      Alert.alert(getTranslation(language, 'added') || 'Añadido', getTranslation(language, 'addedToFavorites') || 'La oferta fue agregada a favoritos');
    }
  };

  const openExternal = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert(getTranslation(language, 'error') || 'Error', getTranslation(language, 'cannotOpenUrl') || 'No se puede abrir la URL');
        return;
      }
      await Linking.openURL(url);
    } catch (err) {
      console.error('Error opening offer URL:', err);
      Alert.alert(getTranslation(language, 'error') || 'Error', getTranslation(language, 'cannotOpenUrl') || 'No se pudo abrir la URL');
    }
  };

  const images: string[] = offer.photos && Array.isArray(offer.photos) && offer.photos.length > 0
    ? offer.photos
    : offer.image ? [offer.image] : [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {images.length > 0 ? (
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.imageCarousel}>
          {images.map((uri: string, idx: number) => (
            <Image key={`${uri}-${idx}`} source={{ uri }} style={styles.image} resizeMode="cover" />
          ))}
        </ScrollView>
      ) : null}

      <View style={styles.headerRow}>
        <Text style={styles.title}>{offer.title}</Text>
        <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
          <Icon name={isFavorite ? 'heart' : 'heart-outline'} size={22} color={isFavorite ? colors.vibrantOrange : colors.deepBlue} />
        </TouchableOpacity>
      </View>

      {offer.provider ? <Text style={styles.provider}>{offer.provider}</Text> : null}
      <Text style={styles.price}>{offer.currency ?? 'USD'} {offer.price}</Text>

      {offer.description ? <Text style={styles.description}>{offer.description}</Text> : null}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.openButton} onPress={() => openExternal(offer.url)}>
          <Text style={styles.openButtonText}>{getTranslation(language, 'openBooking') || 'Abrir oferta'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.searchButton} onPress={() => navigation.navigate('Search')}>
          <Text style={styles.searchButtonText}>{getTranslation(language, 'reserveNow') || 'Reservar ahora'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.pureWhite,
    alignItems: 'center',
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
  imageCarousel: {
    width: width,
    marginBottom: 12,
  },
  image: {
    width: width,
    height: 240,
    backgroundColor: '#eee',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.deepBlue,
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'left',
    flex: 1,
  },
  favoriteButton: {
    marginLeft: 12,
  },
  provider: {
    color: colors.darkGray,
    marginBottom: 6,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.vibrantOrange,
    marginBottom: 10,
  },
  description: {
    color: colors.darkGray,
    textAlign: 'left',
    marginBottom: 16,
    width: '100%',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  openButton: {
    backgroundColor: colors.vibrantOrange,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  openButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  searchButton: {
    borderColor: colors.deepBlue,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
  },
  searchButtonText: {
    color: colors.deepBlue,
    fontWeight: '700',
  },
});

export default OfferDetailsScreen;