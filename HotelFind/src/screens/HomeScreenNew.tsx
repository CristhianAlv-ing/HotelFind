import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { lightTheme, darkTheme } from '../theme/themes';
import { getTranslation } from '../utils/translations';
import { getPopularHotels, Hotel } from '../services/api';

const HomeScreenNew: React.FC<any> = ({ navigation }) => {
  const { language, theme } = useApp();
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Tegucigalpa');

  const cities = [
    { name: 'Tegucigalpa', icon: '🏛️' },
    { name: 'Roatán', icon: '🏝️' },
    { name: 'San Pedro Sula', icon: '🏢' },
    { name: 'La Ceiba', icon: '🌴' },
    { name: 'Copán Ruinas', icon: '🏛️' },
  ];

  useEffect(() => {
    loadHotels();
  }, [selectedCity]);

  const loadHotels = async () => {
    setLoading(true);
    try {
      const data = await getPopularHotels(selectedCity);
      setHotels(data);
    } catch (error) {
      console.error('Error loading hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHotels();
    setRefreshing(false);
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
            <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(item.reviewScore) }]}>
              <Text style={styles.scoreText}>{item.reviewScore.toFixed(1)}</Text>
            </View>
            <Text style={[styles.reviewCount, { color: currentTheme.secondaryText }]}>
              ({item.reviewCount} {getTranslation(language, 'reviews')})
            </Text>
          </View>
        )}

        <View style={styles.priceRow}>
          <Text style={[styles.priceLabel, { color: currentTheme.secondaryText }]}>
            {getTranslation(language, 'from')}
          </Text>
          <Text style={[styles.price, { color: colors.vibrantOrange }]}>
            ${item.price} <Text style={styles.currency}>{item.currency}</Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getScoreColor = (score: number) => {
    if (score >= 9) return '#00B300';
    if (score >= 8) return '#34C759';
    if (score >= 7) return colors.goldenYellow;
    return colors.vibrantOrange;
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.deepBlue }]}>
        <Text style={styles.headerTitle}>HotelFind</Text>
        <Text style={styles.headerSubtitle}>{getTranslation(language, 'findBestHotels')}</Text>
      </View>

      {/* Search Bar */}
      <TouchableOpacity
        style={[styles.searchBar, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}
        onPress={() => navigation.navigate('Search')}
      >
        <Ionicons name="search" size={20} color={colors.vibrantOrange} />
        <Text style={[styles.searchPlaceholder, { color: currentTheme.secondaryText }]}>
          {getTranslation(language, 'searchHotels')}
        </Text>
      </TouchableOpacity>

      {/* City Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.citiesScroll}
        contentContainerStyle={styles.citiesContent}
      >
        {cities.map((city) => (
          <TouchableOpacity
            key={city.name}
            style={[
              styles.cityChip,
              selectedCity === city.name && styles.cityChipActive,
              { borderColor: currentTheme.border },
            ]}
            onPress={() => setSelectedCity(city.name)}
          >
            <Text style={styles.cityIcon}>{city.icon}</Text>
            <Text
              style={[
                styles.cityName,
                { color: selectedCity === city.name ? colors.pureWhite : currentTheme.text },
              ]}
            >
              {city.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Hotels List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.vibrantOrange} />
          <Text style={[styles.loadingText, { color: currentTheme.text }]}>
            {getTranslation(language, 'loadingHotels')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={hotels}
          renderItem={renderHotel}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.vibrantOrange]}
              tintColor={colors.vibrantOrange}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="business-outline" size={80} color={currentTheme.secondaryText} />
              <Text style={[styles.emptyText, { color: currentTheme.text }]}>
                {getTranslation(language, 'noHotelsFound')}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.pureWhite,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.pureWhite,
    marginTop: 2,
    opacity: 0.9,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchPlaceholder: {
    marginLeft: 12,
    fontSize: 16,
  },
  citiesScroll: {
    marginTop: 8,
    marginBottom: 12,
    flexGrow: 0,
  },
  citiesContent: {
    paddingHorizontal: 16,
    paddingRight: 32,
  },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    marginRight: 10,
    minWidth: 100,
  },
  cityChipActive: {
    backgroundColor: colors.vibrantOrange,
    borderColor: colors.vibrantOrange,
    minWidth: 100,
  },
  cityIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  cityName: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
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
  priceLabel: {
    fontSize: 14,
    marginRight: 6,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  currency: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});

export default HomeScreenNew;
