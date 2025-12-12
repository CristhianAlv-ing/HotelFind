import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/Store';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import { colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { fetchPublicOffers, Offer } from '../services/offers';
import { searchHotels, getPlaceDetails, HotelPlace, PlaceDetails } from '../services/googleMaps';
import { addFavoriteHotel, removeFavoriteHotel } from '../slices/userReducer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.86);
const CARD_HEIGHT = 220;

type HotelCardProps = {
  item: PlaceDetails;
  onPress: (h: PlaceDetails) => void;
  onToggleFavorite: (h: PlaceDetails) => void;
  isFav: boolean;
};

const HotelCard: React.FC<HotelCardProps> = ({ item, onPress, onToggleFavorite, isFav }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const confirmOpacity = useRef(new Animated.Value(0)).current;
  const [confirmText, setConfirmText] = useState<string>('');

  const playConfirm = (text: string) => {
    setConfirmText(text);
    // pop animation
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.15, useNativeDriver: true, friction: 6 }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 6 }),
    ]).start();

    // show confirm label fade in/out
    Animated.sequence([
      Animated.timing(confirmOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.delay(900),
      Animated.timing(confirmOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  };

  const onBookmarkPress = () => {
    onToggleFavorite(item);
    playConfirm(isFav ? (getTranslation('es' as any, 'removed') || 'Quitado') : (getTranslation('es' as any, 'saved') || 'Guardado'));
  };

  return (
    <TouchableOpacity activeOpacity={0.95} style={styles.card} onPress={() => onPress(item)}>
      <View style={styles.cardImageWrap}>
        {item.photoUrl ? (
          <Image source={{ uri: item.photoUrl }} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImage, styles.imagePlaceholder]}>
            <Ionicons name="bed-outline" size={42} color="#fff" />
          </View>
        )}

        <Animated.View style={[styles.bookmarkBtnWrap, { transform: [{ scale: scaleAnim }] }]}>
          <TouchableOpacity
            style={[styles.bookmarkBtn, isFav ? styles.bookmarkActive : null]}
            onPress={onBookmarkPress}
            activeOpacity={0.85}
          >
            <Ionicons name={isFav ? 'bookmark' : 'bookmark-outline'} size={20} color={isFav ? '#fff' : colors.deepBlue} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View pointerEvents="none" style={[styles.confirmBox, { opacity: confirmOpacity }]}>
          <Text style={styles.confirmText}>{confirmText}</Text>
        </Animated.View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
          {item.rating ? <Text style={styles.cardRating}>⭐ {item.rating}</Text> : null}
        </View>

        {item.address ? <Text style={styles.cardAddress} numberOfLines={1}>{item.address}</Text> : null}
        <Text style={styles.cardDesc} numberOfLines={2}>{item.website ?? 'Descripción no disponible'}</Text>
      </View>
    </TouchableOpacity>
  );
};

const HomeScreen = () => {
  const { language } = useApp();
  const user = useSelector((state: RootState) => state.user);
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  const [offersModalVisible, setOffersModalVisible] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);

  const [hotels, setHotels] = useState<PlaceDetails[]>([]);
  const [hotelsLoading, setHotelsLoading] = useState(false);

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    setHotelsLoading(true);
    try {
      const places: HotelPlace[] = await searchHotels('hotels');
      const limited = places.slice(0, 10);
      const detailsPromises = limited.map(p => getPlaceDetails(p.place_id || p.id));
      const details = await Promise.all(detailsPromises);
      const merged: PlaceDetails[] = limited.map((p, idx) => {
        const d = details[idx];
        if (d) return d;
        return {
          place_id: p.place_id ?? p.id,
          name: p.name,
          address: p.address,
          lat: p.lat,
          lng: p.lng,
          rating: p.rating,
          photoUrl: undefined,
          photoUrls: [],
        };
      });
      setHotels(merged);
    } catch (err) {
      console.error('Error loading hotels:', err);
      Alert.alert(getTranslation(language, 'error') || 'Error', getTranslation(language, 'cannotFetchHotels') || 'No se pudieron obtener hoteles');
      setHotels([]);
    } finally {
      setHotelsLoading(false);
    }
  };

  const handleReserveNow = () => {
    navigation.navigate('Search');
  };

  const handleViewOffers = async () => {
    setOffersLoading(true);
    setOffersModalVisible(true);
    try {
      const data = await fetchPublicOffers();
      setOffers(data);
    } catch (err) {
      console.error('Error fetching offers:', err);
      Alert.alert(getTranslation(language, 'error') || 'Error', getTranslation(language, 'cannotFetchOffers') || 'No se pudieron obtener las ofertas');
      setOffers([]);
    } finally {
      setOffersLoading(false);
    }
  };

  const isFavorite = useCallback(
    (placeId?: string, name?: string) => {
      if (!user?.favoriteHotels) return false;
      return user.favoriteHotels.some(f => (placeId && f.place_id && f.place_id === placeId) || (name && f.name === name));
    },
    [user?.favoriteHotels]
  );

  const toggleFavorite = (hotel: PlaceDetails) => {
    const fav = isFavorite(hotel.place_id, hotel.name);
    if (fav) {
      dispatch(removeFavoriteHotel({ place_id: hotel.place_id, name: hotel.name }));
      return;
    }
    const payload = {
      place_id: hotel.place_id,
      id: hotel.place_id,
      name: hotel.name,
      description: hotel.address ?? undefined,
      image: hotel.photoUrl ?? hotel.photoUrls?.[0] ?? undefined,
      photos: hotel.photoUrls ?? [],
      rating: hotel.rating,
      lat: hotel.lat,
      lng: hotel.lng,
    };
    dispatch(addFavoriteHotel(payload));
  };

  const onCardPress = (h: PlaceDetails) => {
    navigation.navigate('HotelDetails', { hotel: h });
  };

  const renderHotel = ({ item }: { item: PlaceDetails }) => (
    <HotelCard
      item={item}
      onPress={onCardPress}
      onToggleFavorite={toggleFavorite}
      isFav={isFavorite(item.place_id, item.name)}
    />
  );

  const renderOffer = ({ item }: { item: Offer }) => (
    <TouchableOpacity style={styles.offerCard} onPress={() => navigation.navigate('OfferDetails', { offer: item })}>
      {item.image ? <Image source={{ uri: item.image }} style={styles.offerImage} /> : null}
      <View style={styles.offerContent}>
        <Text style={styles.offerTitle}>{item.title}</Text>
        <Text style={styles.offerProvider}>{item.provider ?? ''}</Text>
        <Text style={styles.offerPrice}>{item.currency ?? 'USD'} {item.price}</Text>
        {item.description ? <Text style={styles.offerDesc} numberOfLines={2}>{item.description}</Text> : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{getTranslation(language, 'welcomeBack')}</Text>
      <Text style={styles.subtitle}>{getTranslation(language, 'joinHotelFind')}</Text>

      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.buttonPrimary} onPress={handleReserveNow}>
          <Icon name="hotel" size={20} color="#FFFFFF" style={styles.icon} />
          <Text style={styles.buttonText}>{getTranslation(language, 'reserveNow')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonSecondary} onPress={handleViewOffers}>
          <Icon name="local-offer" size={20} color="#FFFFFF" style={styles.icon} />
          <Text style={styles.buttonText}>{getTranslation(language, 'viewOffers')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.carouselWrap}>
        {hotelsLoading ? (
          <ActivityIndicator size="large" color={colors.vibrantOrange} />
        ) : hotels.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>{getTranslation(language, 'noSavedHotels') || 'No hay hoteles disponibles'}</Text>
          </View>
        ) : (
          <FlatList
            data={hotels}
            renderItem={renderHotel}
            keyExtractor={(i) => i.place_id ?? i.name}
            horizontal
            pagingEnabled
            snapToAlignment="center"
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carousel}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          />
        )}
      </View>

      <Modal visible={offersModalVisible} animationType="slide" onRequestClose={() => setOffersModalVisible(false)}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{getTranslation(language, 'viewOffers') || 'Ofertas'}</Text>
          <TouchableOpacity onPress={() => setOffersModalVisible(false)} style={styles.modalClose}>
            <Text style={styles.modalCloseText}>{getTranslation(language, 'close') || 'Cerrar'}</Text>
          </TouchableOpacity>
        </View>

        {offersLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.vibrantOrange} />
          </View>
        ) : (
          <FlatList
            data={offers}
            keyExtractor={(i) => i.id}
            renderItem={renderOffer}
            contentContainerStyle={styles.offersList}
            ListEmptyComponent={<Text style={styles.emptyText}>{getTranslation(language, 'noOffers') || 'No hay ofertas disponibles'}</Text>}
          />
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 18,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.deepBlue,
    marginBottom: 4,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 12,
    textAlign: 'left',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  buttonPrimary: {
    flexDirection: 'row',
    backgroundColor: colors.deepBlue,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    flex: 0.48,
    justifyContent: 'center',
  },
  buttonSecondary: {
    flexDirection: 'row',
    backgroundColor: colors.vibrantOrange,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    flex: 0.48,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  icon: {
    marginRight: 8,
  },

  carouselWrap: {
    marginTop: 8,
    height: CARD_HEIGHT + 40,
    alignItems: 'center',
  },
  carousel: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  cardImageWrap: {
    width: '100%',
    height: CARD_HEIGHT - 80,
    backgroundColor: '#ddd',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.deepBlue,
  },
  bookmarkBtnWrap: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  bookmarkBtn: {
    backgroundColor: '#fff',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  bookmarkActive: {
    backgroundColor: colors.vibrantOrange,
  },
  confirmBox: {
    position: 'absolute',
    top: 50,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  confirmText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  cardContent: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.deepBlue,
    flex: 1,
    marginRight: 8,
  },
  cardRating: {
    fontWeight: '700',
    color: colors.darkGray,
  },
  cardAddress: {
    color: colors.darkGray,
    marginTop: 6,
    fontSize: 13,
  },
  cardDesc: {
    marginTop: 8,
    color: colors.darkGray,
    fontSize: 13,
  },

  modalHeader: {
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.deepBlue,
  },
  modalClose: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  modalCloseText: {
    color: colors.vibrantOrange,
    fontWeight: '700',
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offersList: {
    padding: 12,
    backgroundColor: '#fff',
  },
  offerCard: {
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 1,
  },
  offerImage: {
    width: 120,
    height: 90,
  },
  offerContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  offerTitle: {
    fontWeight: '700',
    color: colors.deepBlue,
  },
  offerProvider: {
    color: colors.darkGray,
    fontSize: 12,
    marginTop: 4,
  },
  offerPrice: {
    color: colors.vibrantOrange,
    fontWeight: '700',
    marginTop: 6,
  },
  offerDesc: {
    color: colors.darkGray,
    fontSize: 12,
    marginTop: 6,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: colors.darkGray,
  },
});

export default HomeScreen;