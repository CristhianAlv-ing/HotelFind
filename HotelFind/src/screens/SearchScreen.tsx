import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Platform,
  Dimensions,
  Alert,
  Modal,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { searchHotels, HotelPlace, getPlaceDetails, autocompletePlaces, PlacePrediction } from '../services/googleMaps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const DEFAULT_REGION: Region = {
  latitude: 40.4168,
  longitude: -3.7038,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const SearchScreen: React.FC = () => {
  const { language } = useApp();
  const navigation = useNavigation<any>();

  const [query, setQuery] = useState('');
  const [hotels, setHotels] = useState<HotelPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [locating, setLocating] = useState(true);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [predLoading, setPredLoading] = useState(false);

  const mapRef = useRef<MapView | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocating(false);
          Alert.alert(
            getTranslation(language, 'locationPermissionTitle') || 'Permiso de ubicación',
            getTranslation(language, 'locationPermissionMessage') || 'Permite el acceso a la ubicación para mostrar hoteles cercanos.'
          );
          return;
        }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
        if (pos?.coords) {
          const newRegion: Region = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.03,
          };
          setRegion(newRegion);
          setTimeout(() => mapRef.current?.animateToRegion(newRegion, 500), 150);
        }
      } catch (err) {
        console.warn('Error obteniendo ubicación:', err);
      } finally {
        setLocating(false);
      }
    })();
  }, [language]);

  // Debounced autocomplete when user types
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (!query || query.trim().length < 2) {
      setPredictions([]);
      return;
    }

    setPredLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const preds = await autocompletePlaces(query, { lat: region.latitude, lng: region.longitude }, 50000);
        // opcional: filtrar predicciones por presencia de palabras indicativas de hotel (hotel, lodge, inn, alojamiento)
        const filtered = preds.filter(p =>
          /hotel|inn|lodg|hostel|resort|alojam|hospedaje/i.test(p.description)
        );
        // Si no hay filtradas, mostrar todas
        setPredictions(filtered.length > 0 ? filtered : preds);
      } catch (err) {
        console.error('Error en autocomplete:', err);
        setPredictions([]);
      } finally {
        setPredLoading(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, region.latitude, region.longitude]);

  const onSearch = async () => {
    Keyboard.dismiss();
    setPredictions([]);
    setLoading(true);
    try {
      const q = query.trim() || 'hotels';
      const results = await searchHotels(q, { lat: region.latitude, lng: region.longitude });
      setHotels(results);
      if (results.length > 0) {
        const first = results[0];
        const newRegion = {
          latitude: first.lat,
          longitude: first.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.03,
        };
        setRegion(newRegion);
        setTimeout(() => mapRef.current?.animateToRegion(newRegion, 500), 100);
      } else {
        Alert.alert(getTranslation(language, 'noResults') || 'No se encontraron resultados');
      }
    } catch (err) {
      console.error('Error buscando hoteles:', err);
      Alert.alert(getTranslation(language, 'searchError') || 'Error al buscar hoteles');
    } finally {
      setLoading(false);
    }
  };

  async function handlePredictionSelect(pred: PlacePrediction) {
    // cuando el usuario selecciona una predicción, obtenemos detalles del place y centramos el mapa
    setQuery(pred.description);
    setPredictions([]);
    Keyboard.dismiss();

    if (!pred.place_id) return;
    setFetchingDetails(true);
    try {
      const details = await getPlaceDetails(pred.place_id);
      if (!details) {
        Alert.alert(getTranslation(language, 'noResults') || 'No se encontraron detalles');
        return;
      }

      const newRegion: Region = {
        latitude: details.lat || region.latitude,
        longitude: details.lng || region.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      setTimeout(() => mapRef.current?.animateToRegion(newRegion, 500), 80);

      // buscamos hoteles cerca del place seleccionado (opcional)
      const nearbyResults = await searchHotels('hotels near ' + (details.name || ''), { lat: newRegion.latitude, lng: newRegion.longitude });
      setHotels(nearbyResults);

      // mostramos modal con fotos breve, permitir ver detalles completos
      setSelectedDetails(details);
      setModalVisible(true);
    } catch (err) {
      console.error('Error obteniendo detalles de la predicción:', err);
      Alert.alert(getTranslation(language, 'searchError') || 'Error al obtener detalles');
    } finally {
      setFetchingDetails(false);
    }
  }

  async function handleMarkerPress(h: HotelPlace) {
    const newRegion = {
      latitude: h.lat,
      longitude: h.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 300);

    if (!h.place_id) {
      setSelectedDetails({
        name: h.name,
        address: h.address,
        rating: h.rating,
        photoUrls: [],
      });
      setModalVisible(true);
      return;
    }

    setFetchingDetails(true);
    try {
      const details = await getPlaceDetails(h.place_id);
      if (!details) {
        setSelectedDetails({
          name: h.name,
          address: h.address,
          rating: h.rating,
          photoUrls: [],
        });
      } else {
        setSelectedDetails(details);
      }
      setModalVisible(true);
    } catch (err) {
      console.error('Error obteniendo detalles del place:', err);
      Alert.alert(getTranslation(language, 'searchError') || 'Error al obtener detalles');
    } finally {
      setFetchingDetails(false);
    }
  }

  function openHotelDetailsFromModal() {
    if (!selectedDetails) return;
    const hotelParam = {
      name: selectedDetails.name,
      description: selectedDetails.address || '',
      image: (selectedDetails.photoUrls && selectedDetails.photoUrls[0]) || selectedDetails.photoUrl,
      photos: selectedDetails.photoUrls || (selectedDetails.photoUrl ? [selectedDetails.photoUrl] : []),
      price: 0,
      rating: selectedDetails.rating,
      phone: selectedDetails.phone,
      website: selectedDetails.website,
      place_id: selectedDetails.place_id,
      lat: selectedDetails.lat,
      lng: selectedDetails.lng,
    };
    setModalVisible(false);
    navigation.navigate('HotelDetails', { hotel: hotelParam });
  }

  const renderHotelItem = ({ item }: { item: HotelPlace }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        const newRegion = {
          latitude: item.lat,
          longitude: item.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 300);
        handleMarkerPress(item);
      }}
    >
      <Text style={styles.hotelName}>{item.name}</Text>
      <Text style={styles.hotelAddress}>{item.address}</Text>
      {typeof item.rating === 'number' && <Text style={styles.hotelRating}>⭐ {item.rating}</Text>}
    </TouchableOpacity>
  );

  const renderPhoto = ({ item }: { item: string }) => (
    <Image source={{ uri: item }} style={styles.modalImage} resizeMode="cover" />
  );

  const renderPrediction = ({ item }: { item: PlacePrediction }) => (
    <TouchableOpacity style={styles.predItem} onPress={() => handlePredictionSelect(item)}>
      <Text style={styles.predMain}>{item.structured_formatting?.main_text || item.description}</Text>
      {item.structured_formatting?.secondary_text ? <Text style={styles.predSecondary}>{item.structured_formatting.secondary_text}</Text> : null}
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={() => { setPredictions([]); Keyboard.dismiss(); }}>
      <View style={styles.container}>
        <Text style={styles.title}>{getTranslation(language, 'search')}</Text>

        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <TextInput
              style={styles.input}
              placeholder={getTranslation(language, 'enterDestination')}
              placeholderTextColor={colors.darkGray}
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
            />
            {predLoading ? (
              <View style={styles.predLoader}><ActivityIndicator size="small" color={colors.vibrantOrange} /></View>
            ) : null}
            {predictions.length > 0 && (
              <View style={styles.predContainer}>
                <FlatList
                  data={predictions}
                  keyExtractor={(p) => p.place_id}
                  renderItem={renderPrediction}
                  keyboardShouldPersistTaps="handled"
                />
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.searchButton} onPress={onSearch} disabled={loading || locating || fetchingDetails}>
            {loading || locating || fetchingDetails ? <ActivityIndicator color="#fff" /> : <Text style={styles.searchButtonText}>{getTranslation(language, 'searchButton')}</Text>}
          </TouchableOpacity>
        </View>

        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={region}
          region={region}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {hotels.map(h => (
            <Marker
              key={h.id}
              coordinate={{ latitude: h.lat, longitude: h.lng }}
              title={h.name}
              description={h.address}
              onPress={() => handleMarkerPress(h)}
            />
          ))}
        </MapView>

        <View style={styles.listContainer}>
          <FlatList
            data={hotels}
            keyExtractor={(item) => item.id}
            renderItem={renderHotelItem}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              {fetchingDetails ? (
                <ActivityIndicator size="large" color={colors.vibrantOrange} />
              ) : (
                <>
                  <Text style={styles.modalTitle}>{selectedDetails?.name}</Text>
                  <Text style={styles.modalSubtitle}>{selectedDetails?.address}</Text>

                  {(selectedDetails?.photoUrls && selectedDetails.photoUrls.length > 0) ? (
                    <FlatList
                      data={selectedDetails.photoUrls}
                      keyExtractor={(i: string, idx: number) => `${i}-${idx}`}
                      renderItem={renderPhoto}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.photoList}
                    />
                  ) : (
                    <View style={styles.noPhotoBox}>
                      <Text style={styles.noPhotoText}>{getTranslation(language, 'noPhotos') || 'No hay fotografías disponibles'}</Text>
                    </View>
                  )}

                  <View style={styles.modalButtons}>
                    <TouchableOpacity style={styles.modalButtonClose} onPress={() => setModalVisible(false)}>
                      <Text style={styles.modalButtonText}>Cerrar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalButtonDetails} onPress={openHotelDetailsFromModal}>
                      <Text style={[styles.modalButtonText, { color: '#fff' }]}>{getTranslation(language, 'viewDetails') || 'Ver detalles'}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pureWhite,
  },
  title: {
    fontSize: 20,
    color: colors.deepBlue,
    marginTop: Platform.OS === 'ios' ? 50 : 20,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  input: {
    height: 44,
    borderColor: colors.darkGray,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: colors.deepBlue,
    backgroundColor: '#fff',
  },
  predLoader: {
    position: 'absolute',
    right: 10,
    top: 8,
  },
  predContainer: {
    position: 'absolute',
    top: 46,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    maxHeight: 220,
    borderColor: '#eee',
    borderWidth: 1,
    zIndex: 10,
    elevation: 6,
  },
  predItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  predMain: {
    fontWeight: '600',
    color: colors.deepBlue,
  },
  predSecondary: {
    color: colors.darkGray,
    marginTop: 4,
  },
  searchButton: {
    backgroundColor: colors.vibrantOrange,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
    alignSelf: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  map: {
    width: width,
    height: height * 0.56,
  },
  listContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: '#fff',
    padding: 10,
    marginHorizontal: 6,
    borderRadius: 8,
    width: width * 0.7,
    elevation: 2,
  },
  hotelName: {
    fontWeight: '700',
    color: colors.deepBlue,
  },
  hotelAddress: {
    color: colors.darkGray,
    marginTop: 4,
  },
  hotelRating: {
    marginTop: 6,
    color: '#444',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: height * 0.65,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.deepBlue,
  },
  modalSubtitle: {
    color: colors.darkGray,
    marginTop: 4,
    marginBottom: 8,
  },
  photoList: {
    height: 180,
    marginBottom: 8,
  },
  modalImage: {
    width: width * 0.8,
    height: 170,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  noPhotoBox: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f6f6f6',
    borderRadius: 8,
    marginBottom: 8,
  },
  noPhotoText: {
    color: colors.darkGray,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButtonClose: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.darkGray,
  },
  modalButtonDetails: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: colors.vibrantOrange,
  },
  modalButtonText: {
    color: colors.deepBlue,
    fontWeight: '600',
  },
});

export default SearchScreen;