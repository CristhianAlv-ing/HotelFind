import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, Linking, TouchableOpacity, ScrollView, FlatList, Dimensions, Alert, Modal } from 'react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import { useDispatch, useSelector } from 'react-redux';
import { addFavoriteHotel, removeFavoriteHotel } from '../slices/userReducer';
import { RootState } from '../redux/Store';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Calendar } from 'react-native-calendars';

const { width } = Dimensions.get('window');

const HotelDetailsScreen: React.FC<any> = ({ route, navigation }) => {
  const { language } = useApp();
  const hotel = route?.params?.hotel;
  const dispatch = useDispatch();
  const favorites = useSelector((state: RootState) => state.user.favoriteHotels || []);

  const [calendarVisible, setCalendarVisible] = useState(false);
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);

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

  const onDayPress = (day: any) => {
    const ymd = day?.dateString as string;
    if (!ymd) return;
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(ymd);
      setCheckOut(null);
      return;
    }
    if (checkIn && !checkOut) {
      if (ymd >= checkIn) {
        setCheckOut(ymd);
        setCalendarVisible(false);
      } else {
        setCheckIn(ymd);
      }
    }
  };

  const markedDates = useMemo(() => {
    const map: { [key: string]: any } = {};
    if (checkIn && checkOut) {
      const start = new Date(checkIn + 'T00:00:00');
      const end = new Date(checkOut + 'T00:00:00');
      const dayMs = 24 * 60 * 60 * 1000;
      for (let t = start.getTime(); t <= end.getTime(); t += dayMs) {
        const d = new Date(t);
        const y = d.toISOString().split('T')[0];
        if (y === checkIn) map[y] = { startingDay: true, color: colors.vibrantOrange, textColor: '#fff' };
        else if (y === checkOut) map[y] = { endingDay: true, color: colors.vibrantOrange, textColor: '#fff' };
        else map[y] = { color: '#FFD9C7', textColor: colors.deepBlue };
      }
    } else if (checkIn) {
      map[checkIn] = { startingDay: true, color: colors.vibrantOrange, textColor: '#fff' };
    }
    return map;
  }, [checkIn, checkOut]);

  const formatDisplayDate = (isoYmd?: string | null) => {
    if (!isoYmd) return '';
    try {
      const d = new Date(isoYmd + 'T12:00:00');
      return d.toLocaleDateString();
    } catch {
      return isoYmd;
    }
  };

  const handleUseDates = () => {
    if (!checkIn || !checkOut) {
      Alert.alert(getTranslation(language, 'error') || 'Error', getTranslation(language, 'selectDates') || 'Selecciona fechas');
      return;
    }
    navigation.navigate('Reservations', { hotel, checkIn, checkOut });
  };

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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.deepBlue} />
          <Text style={styles.backText}>{getTranslation(language, 'close') || 'Cerrar'}</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={2}>{hotel.name}</Text>
        <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
          <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={22} color={isFavorite ? colors.vibrantOrange : colors.deepBlue} />
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

      <View style={styles.datesBox}>
        <Text style={styles.sectionLabel}>{getTranslation(language, 'selectDates') || 'Selecciona fechas'}</Text>
        <TouchableOpacity style={styles.dateRangeButton} onPress={() => setCalendarVisible(true)}>
          <Text style={styles.dateRangeText}>
            {checkIn ? `${getTranslation(language, 'checkIn') || 'Entrada'}: ${formatDisplayDate(checkIn)}` : (getTranslation(language, 'checkIn') || 'Entrada')}
            {checkOut ? `  ·  ${getTranslation(language, 'checkOut') || 'Salida'}: ${formatDisplayDate(checkOut)}` : ''}
          </Text>
        </TouchableOpacity>
        {checkIn && checkOut ? (
          <TouchableOpacity style={styles.confirmDatesButton} onPress={handleUseDates}>
            <Text style={styles.confirmDatesText}>{getTranslation(language, 'useTheseDates') || 'Usar estas fechas'}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <Modal visible={calendarVisible} animationType="slide" onRequestClose={() => setCalendarVisible(false)}>
        <View style={styles.calendarWrap}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => setCalendarVisible(false)}>
              <Text style={styles.calendarClose}>{getTranslation(language, 'close') || 'Cerrar'}</Text>
            </TouchableOpacity>
            <Text style={styles.calendarTitle}>{getTranslation(language, 'selectDates') || 'Selecciona fechas'}</Text>
            <View style={{ width: 60 }} />
          </View>

          <Calendar
            onDayPress={onDayPress}
            markedDates={markedDates}
            markingType="period"
            minDate={new Date().toISOString().split('T')[0]}
            theme={{
              selectedDayBackgroundColor: colors.vibrantOrange,
              todayTextColor: colors.vibrantOrange,
              arrowColor: colors.deepBlue,
              monthTextColor: colors.deepBlue,
            }}
            style={{ borderTopWidth: 1, borderColor: '#eee' }}
          />
        </View>
      </Modal>

      <TouchableOpacity style={styles.backReserveButton} onPress={() => navigation.navigate('CreateReservation', { hotel, checkIn, checkOut })}>
        <Text style={styles.backReserveText}>{getTranslation(language, 'reserveNow') || 'Reservar ahora'}</Text>
      </TouchableOpacity>
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  backText: {
    marginLeft: 4,
    color: colors.deepBlue,
    fontWeight: '600',
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
  datesBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f6f8fb',
  },
  sectionLabel: {
    fontWeight: '700',
    color: colors.deepBlue,
    marginBottom: 8,
  },
  dateRangeButton: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e6e8ed',
    backgroundColor: '#fff',
  },
  dateRangeText: {
    color: colors.deepBlue,
    fontWeight: '600',
  },
  confirmDatesButton: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.vibrantOrange,
    alignItems: 'center',
  },
  confirmDatesText: {
    color: '#fff',
    fontWeight: '700',
  },
  calendarWrap: {
    flex: 1,
    backgroundColor: '#fff',
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  calendarClose: {
    color: colors.vibrantOrange,
    fontWeight: '700',
  },
  calendarTitle: {
    fontWeight: '700',
    color: colors.deepBlue,
    fontSize: 16,
  },
  backReserveButton: {
    marginTop: 18,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.deepBlue,
    alignItems: 'center',
  },
  backReserveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default HotelDetailsScreen;