import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { lightTheme, darkTheme } from '../theme/themes';
import { getTranslation } from '../utils/translations';
import { searchHotels, searchHotelsBooking, Hotel, SearchParams } from '../services/api';

const SearchScreenNew: React.FC<any> = ({ navigation }) => {
  const { language, theme } = useApp();
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(new Date(Date.now() + 86400000));
  const [adults, setAdults] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!destination.trim()) {
      Alert.alert('Error', getTranslation(language, 'enterDestination') || 'Ingresa un destino');
      return;
    }

    if (checkOut <= checkIn) {
      Alert.alert('Error', getTranslation(language, 'invalidDates') || 'Las fechas no son válidas');
      return;
    }

    setLoading(true);
    setSearched(true);

    const params: SearchParams = {
      destination: destination.trim(),
      checkIn: checkIn.toISOString().split('T')[0],
      checkOut: checkOut.toISOString().split('T')[0],
      adults,
      rooms,
      currency: 'USD',
    };

    try {
      // Intentar con Hotels4 API primero (con fallback automático a mock)
      const result = await searchHotels(params);
      setHotels(result.hotels);
      
      // Si no hay resultados después del fallback, mostrar mensaje
      if (result.hotels.length === 0) {
        Alert.alert(
          getTranslation(language, 'noResults') || 'Sin resultados',
          `No se encontraron hoteles en "${destination}"`
        );
      }
    } catch (error) {
      console.error('Error searching hotels:', error);
      // No mostrar alert de error, ya que el API ya usa fallback automático
      // Solo establecer array vacío
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const renderHotel = ({ item }: { item: Hotel }) => (
    <TouchableOpacity
      style={[styles.hotelCard, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}
      onPress={() => navigation.navigate('HotelDetails', { hotel: item })}
    >
      <Image
        source={{ uri: item.images?.[0] || 'https://via.placeholder.com/400x200' }}
        style={styles.hotelImage}
      />

      <View style={styles.hotelInfo}>
        <View style={styles.hotelHeader}>
          <Text style={[styles.hotelName, { color: currentTheme.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          {item.rating && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color={colors.goldenYellow} />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location" size={14} color={colors.vibrantOrange} />
          <Text style={[styles.locationText, { color: currentTheme.secondaryText }]} numberOfLines={1}>
            {item.city}, {item.country}
          </Text>
        </View>

        {item.reviewScore && (
          <View style={styles.reviewRow}>
            <View style={[styles.scoreBadge, { backgroundColor: colors.vibrantOrange }]}>
              <Text style={styles.scoreText}>{item.reviewScore.toFixed(1)}</Text>
            </View>
            <Text style={[styles.reviewCount, { color: currentTheme.secondaryText }]}>
              ({item.reviewCount} reviews)
            </Text>
          </View>
        )}

        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.vibrantOrange }]}>
            ${item.price} <Text style={[styles.currency, { color: currentTheme.secondaryText }]}>{item.currency}</Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={styles.searchForm}>
        {/* Destination */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: currentTheme.text }]}>
            <Ionicons name="location" size={16} color={colors.vibrantOrange} /> {getTranslation(language, 'destination')}
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: currentTheme.inputBackground, color: currentTheme.text, borderColor: currentTheme.border }]}
            placeholder={getTranslation(language, 'enterDestination') || 'Tegucigalpa, Honduras'}
            placeholderTextColor={currentTheme.secondaryText}
            value={destination}
            onChangeText={setDestination}
          />
        </View>

        {/* Check-in Date */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: currentTheme.text }]}>
            <Ionicons name="calendar" size={16} color={colors.deepBlue} /> {getTranslation(language, 'checkIn')}
          </Text>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: currentTheme.inputBackground, borderColor: currentTheme.border }]}
            onPress={() => setShowCheckInPicker(true)}
          >
            <Text style={[styles.dateText, { color: currentTheme.text }]}>
              {checkIn.toLocaleDateString()}
            </Text>
            <Ionicons name="chevron-down" size={20} color={currentTheme.secondaryText} />
          </TouchableOpacity>
        </View>

        {showCheckInPicker && (
          <DateTimePicker
            value={checkIn}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(event, date) => {
              setShowCheckInPicker(false);
              if (date) setCheckIn(date);
            }}
          />
        )}

        {/* Check-out Date */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: currentTheme.text }]}>
            <Ionicons name="calendar" size={16} color={colors.deepBlue} /> {getTranslation(language, 'checkOut')}
          </Text>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: currentTheme.inputBackground, borderColor: currentTheme.border }]}
            onPress={() => setShowCheckOutPicker(true)}
          >
            <Text style={[styles.dateText, { color: currentTheme.text }]}>
              {checkOut.toLocaleDateString()}
            </Text>
            <Ionicons name="chevron-down" size={20} color={currentTheme.secondaryText} />
          </TouchableOpacity>
        </View>

        {showCheckOutPicker && (
          <DateTimePicker
            value={checkOut}
            mode="date"
            display="default"
            minimumDate={checkIn}
            onChange={(event, date) => {
              setShowCheckOutPicker(false);
              if (date) setCheckOut(date);
            }}
          />
        )}

        {/* Guests & Rooms */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={[styles.label, { color: currentTheme.text }]}>
              <Ionicons name="people" size={16} color={colors.deepBlue} /> {getTranslation(language, 'guests')}
            </Text>
            <View style={styles.counterRow}>
              <TouchableOpacity
                style={[styles.counterButton, { borderColor: currentTheme.border }]}
                onPress={() => setAdults(Math.max(1, adults - 1))}
              >
                <Ionicons name="remove" size={20} color={colors.vibrantOrange} />
              </TouchableOpacity>
              <Text style={[styles.counterText, { color: currentTheme.text }]}>{adults}</Text>
              <TouchableOpacity
                style={[styles.counterButton, { borderColor: currentTheme.border }]}
                onPress={() => setAdults(Math.min(10, adults + 1))}
              >
                <Ionicons name="add" size={20} color={colors.vibrantOrange} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={[styles.label, { color: currentTheme.text }]}>
              <Ionicons name="bed" size={16} color={colors.deepBlue} /> {getTranslation(language, 'rooms')}
            </Text>
            <View style={styles.counterRow}>
              <TouchableOpacity
                style={[styles.counterButton, { borderColor: currentTheme.border }]}
                onPress={() => setRooms(Math.max(1, rooms - 1))}
              >
                <Ionicons name="remove" size={20} color={colors.vibrantOrange} />
              </TouchableOpacity>
              <Text style={[styles.counterText, { color: currentTheme.text }]}>{rooms}</Text>
              <TouchableOpacity
                style={[styles.counterButton, { borderColor: currentTheme.border }]}
                onPress={() => setRooms(Math.min(5, rooms + 1))}
              >
                <Ionicons name="add" size={20} color={colors.vibrantOrange} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Search Button */}
        <TouchableOpacity
          style={[styles.searchButton, loading && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.pureWhite} />
          ) : (
            <>
              <Ionicons name="search" size={20} color={colors.pureWhite} />
              <Text style={styles.searchButtonText}>{getTranslation(language, 'searchHotels')}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Results */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.vibrantOrange} />
          <Text style={[styles.loadingText, { color: currentTheme.text }]}>
            {getTranslation(language, 'searching')}
          </Text>
        </View>
      )}

      {!loading && searched && hotels.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={[styles.resultsTitle, { color: currentTheme.text }]}>
            {hotels.length} {getTranslation(language, 'hotelsFound')}
          </Text>
          <FlatList
            data={hotels}
            renderItem={renderHotel}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      )}

      {!loading && searched && hotels.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={80} color={currentTheme.secondaryText} />
          <Text style={[styles.emptyText, { color: currentTheme.text }]}>
            {getTranslation(language, 'noHotelsFound')}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchForm: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counterButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
  counterText: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchButton: {
    flexDirection: 'row',
    backgroundColor: colors.vibrantOrange,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    color: colors.pureWhite,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  resultsContainer: {
    padding: 20,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  hotelCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  hotelImage: {
    width: '100%',
    height: 200,
  },
  hotelInfo: {
    padding: 16,
  },
  hotelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.goldenYellow + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.goldenYellow,
    marginLeft: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    marginLeft: 4,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  scoreText: {
    color: colors.pureWhite,
    fontSize: 14,
    fontWeight: 'bold',
  },
  reviewCount: {
    fontSize: 13,
    marginLeft: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  currency: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default SearchScreenNew;
