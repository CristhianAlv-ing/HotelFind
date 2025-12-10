import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/Store';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import { colors } from '../theme/colors';

const HomeScreen = () => {
  const { language } = useApp();
  const user = useSelector((state: RootState) => state.user);
  const hotel = useSelector((state: RootState) => state.hotel);

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

        <TouchableOpacity style={styles.buttonPrimary}>
          <Icon name="hotel" size={22} color="#FFFFFF" style={styles.icon} />
          <Text style={styles.buttonText}>{getTranslation(language, 'reserveNow')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonSecondary}>
          <Icon name="local-offer" size={22} color="#FFFFFF" style={styles.icon} />
          <Text style={styles.buttonText}>{getTranslation(language, 'viewOffers')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonAccent}>
          <Icon name="restaurant" size={22} color="#FFFFFF" style={styles.icon} />
          <Text style={styles.buttonText}>{getTranslation(language, 'specialPackages')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonDark}>
          <Icon name="card-membership" size={22} color="#FFFFFF" style={styles.icon} />
          <Text style={styles.buttonText}>{getTranslation(language, 'membersBenefits')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// estilos (invarían)
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
});

export default HomeScreen;