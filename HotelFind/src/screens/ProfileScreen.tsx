import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { lightTheme, darkTheme } from '../theme/themes';
import { getTranslation } from '../utils/translations';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/Store';
import { removeFavoriteHotel, removeFavoriteOffer } from '../slices/userReducer';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen: React.FC<any> = ({ route, navigation: navProp }) => {
  const { setIsLoggedIn } = route.params;
  const { language, theme } = useApp();
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', 'Estas seguro que deseas cerrar sesión?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Cerrar Sesión',
        onPress: () => {
          setIsLoggedIn(false);
        },
      },
    ]);
  };

  const confirmRemoveHotel = (h: any) => {
    Alert.alert(
      getTranslation(language, 'removeFavorite') || 'Quitar favorito',
      getTranslation(language, 'removeFavoriteConfirm') || 'Deseas quitar este hotel de favoritos?',
      [
        { text: getTranslation(language, 'cancel') || 'Cancelar', style: 'cancel' },
        { text: getTranslation(language, 'remove') || 'Quitar', style: 'destructive', onPress: () => dispatch(removeFavoriteHotel({ place_id: h.place_id, id: h.id, name: h.name })) }
      ]
    );
  };

  const confirmRemoveOffer = (o: any) => {
    Alert.alert(
      getTranslation(language, 'removeFavorite') || 'Quitar favorito',
      getTranslation(language, 'removeFavoriteConfirm') || 'Deseas quitar esta oferta de favoritos?',
      [
        { text: getTranslation(language, 'cancel') || 'Cancelar', style: 'cancel' },
        { text: getTranslation(language, 'remove') || 'Quitar', style: 'destructive', onPress: () => dispatch(removeFavoriteOffer({ id: o.id, url: o.url })) }
      ]
    );
  };

  const renderFavHotel = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.favItem} onPress={() => navigation.navigate('HotelDetails', { hotel: item })}>
      {item.image ? <Image source={{ uri: item.image }} style={styles.favImage} /> : <Ionicons name="bed-outline" size={36} color={colors.deepBlue} style={{ marginRight: 10 }} />}
      <View style={{ flex: 1 }}>
        <Text style={styles.favTitle}>{item.name}</Text>
        {item.rating ? <Text style={styles.favMeta}>⭐ {item.rating}</Text> : null}
      </View>
      <TouchableOpacity onPress={() => confirmRemoveHotel(item)} style={styles.removeBtn}>
        <Ionicons name="trash-outline" size={22} color="#FF3B30" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderFavOffer = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.favItem} onPress={() => navigation.navigate('OfferDetails', { offer: item })}>
      {item.image ? <Image source={{ uri: item.image }} style={styles.favImage} /> : <Ionicons name="pricetag-outline" size={36} color={colors.deepBlue} style={{ marginRight: 10 }} />}
      <View style={{ flex: 1 }}>
        <Text style={styles.favTitle}>{item.title}</Text>
        <Text style={styles.favMeta}>{item.currency ?? 'USD'} {item.price}</Text>
      </View>
      <TouchableOpacity onPress={() => confirmRemoveOffer(item)} style={styles.removeBtn}>
        <Ionicons name="trash-outline" size={22} color="#FF3B30" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={styles.profileHeader}>
        <Ionicons name="person-circle" size={80} color={colors.vibrantOrange} />
        <Text style={[styles.name, { color: currentTheme.text }]}>{user.name || 'Invitado'}</Text>
        <Text style={[styles.email, { color: currentTheme.secondaryText }]}>{user.email || 'No registrado'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>{getTranslation(language, 'savedHotels')}</Text>
        {user.favoriteHotels && user.favoriteHotels.length > 0 ? (
          <FlatList data={user.favoriteHotels} keyExtractor={(i) => i.place_id ?? i.id ?? i.name} renderItem={renderFavHotel} />
        ) : (
          <Text style={styles.emptyText}>{getTranslation(language, 'noSavedHotels') || 'No tienes hoteles guardados'}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>{getTranslation(language, 'favoriteOffers')}</Text>
        {user.favoriteOffers && user.favoriteOffers.length > 0 ? (
          <FlatList data={user.favoriteOffers} keyExtractor={(i) => i.id} renderItem={renderFavOffer} />
        ) : (
          <Text style={styles.emptyText}>{getTranslation(language, 'noSavedOffers') || 'No tienes ofertas guardadas'}</Text>
        )}
      </View>

      <View style={{ marginTop: 12 }}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={colors.pureWhite} />
          <Text style={styles.logoutText}>
            {getTranslation(language, 'logout')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  email: {
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    color: colors.darkGray,
    fontSize: 14,
  },
  favItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  favImage: {
    width: 64,
    height: 48,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  favTitle: {
    fontWeight: '700',
    color: colors.deepBlue,
  },
  favMeta: {
    color: colors.darkGray,
    marginTop: 4,
    fontSize: 12,
  },
  removeBtn: {
    padding: 8,
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: colors.vibrantOrange,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  logoutText: {
    color: colors.pureWhite,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ProfileScreen;