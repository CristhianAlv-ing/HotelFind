import React, { useState } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/Store';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import { colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { fetchPublicOffers, Offer } from '../services/offers';

const HomeScreen = () => {
  const { language } = useApp();
  const user = useSelector((state: RootState) => state.user);
  const hotel = useSelector((state: RootState) => state.hotel);
  const navigation = useNavigation<any>();

  const [offersModalVisible, setOffersModalVisible] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);

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

      <View style={styles.userInfo}>
        <Text style={styles.infoText}>🧑 {getTranslation(language, 'profile')}: {user.name || 'Invitado'}</Text>
        <Text style={styles.infoText}>📧 {user.email || 'No registrado'}</Text>
        <Text style={styles.infoText}>🏨 {getTranslation(language, 'savedHotels')}: {hotel.selectedHotel || 'Ninguno'}</Text>
      </View>

      <View style={styles.reservationContainer}>
        <Text style={styles.reservationTitle}>{getTranslation(language, 'home')}</Text>

        <TouchableOpacity style={styles.buttonPrimary} onPress={handleReserveNow}>
          <Icon name="hotel" size={22} color="#FFFFFF" style={styles.icon} />
          <Text style={styles.buttonText}>{getTranslation(language, 'reserveNow')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonSecondary} onPress={handleViewOffers}>
          <Icon name="local-offer" size={22} color="#FFFFFF" style={styles.icon} />
          <Text style={styles.buttonText}>{getTranslation(language, 'viewOffers')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonAccent} onPress={() => navigation.navigate('Search')}>
          <Icon name="restaurant" size={22} color="#FFFFFF" style={styles.icon} />
          <Text style={styles.buttonText}>{getTranslation(language, 'specialPackages')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonDark} onPress={() => Alert.alert(getTranslation(language, 'membersBenefits') || 'Members', getTranslation(language, 'comingSoon') || 'Próximamente')}>
          <Icon name="card-membership" size={22} color="#FFFFFF" style={styles.icon} />
          <Text style={styles.buttonText}>{getTranslation(language, 'membersBenefits')}</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de ofertas */}
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
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#004DCC',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
  },
  userInfo: {
    marginBottom: 20,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#333333',
    marginVertical: 2,
  },
  reservationContainer: {
    padding: 10,
    width: '100%',
    alignItems: 'center',
  },
  reservationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF8000',
    marginBottom: 15,
  },
  buttonPrimary: {
    flexDirection: 'row',
    backgroundColor: '#004DCC',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    flexDirection: 'row',
    backgroundColor: '#FF8000',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonAccent: {
    flexDirection: 'row',
    backgroundColor: '#004DCC',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDark: {
    flexDirection: 'row',
    backgroundColor: '#333333',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  icon: {
    marginRight: 8,
  },

  /* Modal ofertas */
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