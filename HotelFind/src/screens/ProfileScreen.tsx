import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, Image, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { lightTheme, darkTheme } from '../theme/themes';
import { getTranslation } from '../utils/translations';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/Store';
import { removeFavoriteHotel, removeFavoriteOffer, setProfileImage } from '../slices/userReducer';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

const ProfileScreen: React.FC<any> = ({ route, navigation: navProp }) => {
  const { setIsLoggedIn } = route.params;
  const { language, theme } = useApp();
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const [loadingImage, setLoadingImage] = React.useState(false);

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

  const pickImage = async () => {
    try {
      setLoadingImage(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          getTranslation(language, 'permissionDenied') || 'Permiso denegado',
          getTranslation(language, 'cameraRollPermission') || 'Se requiere acceso a la galería'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        dispatch(setProfileImage(imageUri));
        Alert.alert(
          getTranslation(language, 'success') || 'Éxito',
          getTranslation(language, 'profileImageUpdated') || 'Imagen de perfil actualizada'
        );
      }
    } catch (err) {
      console.error('Error picking image:', err);
      Alert.alert(
        getTranslation(language, 'error') || 'Error',
        getTranslation(language, 'failedToPickImage') || 'Error al seleccionar imagen'
      );
    } finally {
      setLoadingImage(false);
    }
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
      {item.image ? <Image source={{ uri: item.image }} style={styles.favImage} /> : <Ionicons name="bed-outline" size={36} color={colors.deepBlue} />}
      <View style={{ flex: 1, marginLeft: 12 }}>
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
      {item.image ? <Image source={{ uri: item.image }} style={styles.favImage} /> : <Ionicons name="pricetag-outline" size={36} color={colors.deepBlue} />}
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.favTitle}>{item.title}</Text>
        <Text style={styles.favMeta}>{item.currency ?? 'USD'} {item.price}</Text>
      </View>
      <TouchableOpacity onPress={() => confirmRemoveOffer(item)} style={styles.removeBtn}>
        <Ionicons name="trash-outline" size={22} color="#FF3B30" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: currentTheme.background }]}>
      {/* Encabezado de perfil centrado */}
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          {loadingImage ? (
            <ActivityIndicator size="large" color={colors.vibrantOrange} />
          ) : user.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
          ) : (
            <Ionicons name="person-circle" size={120} color={colors.vibrantOrange} />
          )}
          <TouchableOpacity style={styles.editImageBtn} onPress={pickImage} disabled={loadingImage}>
            <Ionicons name="camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={[styles.name, { color: currentTheme.text }]}>{user.name || 'Invitado'}</Text>
        <Text style={[styles.email, { color: currentTheme.secondaryText }]}>{user.email || 'No registrado'}</Text>
      </View>

      {/* Menú de opciones (anterior) centrado */}
      <View style={styles.menu}>
        <TouchableOpacity
          style={[styles.menuItem, { borderBottomColor: currentTheme.border }]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={24} color={colors.deepBlue} />
          <Text style={[styles.menuText, { color: currentTheme.text }]}>
            {getTranslation(language, 'settings')}
          </Text>
          <Ionicons name="chevron-forward" size={24} color={currentTheme.secondaryText} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { borderBottomColor: currentTheme.border }]}
        >
          <Ionicons name="help-circle-outline" size={24} color={colors.deepBlue} />
          <Text style={[styles.menuText, { color: currentTheme.text }]}>
            {getTranslation(language, 'helpSupport')}
          </Text>
          <Ionicons name="chevron-forward" size={24} color={currentTheme.secondaryText} />
        </TouchableOpacity>
      </View>

      {/* Secciones de favoritos */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>{getTranslation(language, 'savedHotels')}</Text>
        {user.favoriteHotels && user.favoriteHotels.length > 0 ? (
          <FlatList data={user.favoriteHotels} keyExtractor={(i) => i.place_id ?? i.id ?? i.name} renderItem={renderFavHotel} scrollEnabled={false} />
        ) : (
          <Text style={styles.emptyText}>{getTranslation(language, 'noSavedHotels') || 'No tienes hoteles guardados'}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>{getTranslation(language, 'favoriteOffers')}</Text>
        {user.favoriteOffers && user.favoriteOffers.length > 0 ? (
          <FlatList data={user.favoriteOffers} keyExtractor={(i) => i.id} renderItem={renderFavOffer} scrollEnabled={false} />
        ) : (
          <Text style={styles.emptyText}>{getTranslation(language, 'noSavedOffers') || 'No tienes ofertas guardadas'}</Text>
        )}
      </View>

      {/* Botón de logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color={colors.pureWhite} />
        <Text style={styles.logoutText}>
          {getTranslation(language, 'logout')}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eee',
  },
  editImageBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.vibrantOrange,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    textAlign: 'center',
  },
  menu: {
    width: '100%',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuText: {
    marginLeft: 16,
    fontSize: 16,
    flex: 1,
  },
  section: {
    width: '100%',
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.darkGray,
    fontSize: 14,
    textAlign: 'center',
  },
  favItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    width: '100%',
  },
  favImage: {
    width: 64,
    height: 48,
    borderRadius: 6,
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
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 30,
    width: '100%',
  },
  logoutText: {
    color: colors.pureWhite,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ProfileScreen;