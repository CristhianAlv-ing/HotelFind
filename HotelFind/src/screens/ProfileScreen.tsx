import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, Image, ScrollView, Linking, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { lightTheme, darkTheme } from '../theme/themes';
import { getTranslation } from '../utils/translations';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/Store';
import { removeFavoriteHotel, removeFavoriteOffer } from '../slices/userReducer';
import { useNavigation } from '@react-navigation/native';
import { getCurrentUser } from '../services/supabase';

const ProfileScreen: React.FC<any> = ({ route, navigation: navProp }) => {
  const { setIsLoggedIn } = route.params;
  const { language, theme, setLanguage, setTheme } = useApp();
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    loadSupabaseUser();
  }, []);

  const loadSupabaseUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setSupabaseUser(currentUser);
        console.log('✅ Usuario de Supabase cargado:', currentUser.email);
      }
    } catch (error) {
      console.log('ℹ️ No hay usuario de Supabase autenticado');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      getTranslation(language, 'logout') || 'Cerrar Sesión', 
      language === 'es' ? '¿Estás seguro que deseas cerrar sesión?' : 
      language === 'en' ? 'Are you sure you want to log out?' :
      language === 'zh' ? '您确定要退出登录吗？' :
      'Êtes-vous sûr de vouloir vous déconnecter?',
      [
        { text: getTranslation(language, 'cancel') || 'Cancelar', style: 'cancel' },
        {
          text: getTranslation(language, 'logout') || 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => {
            setIsLoggedIn(false);
          },
        },
      ]
    );
  };

  const handleChangeProfilePicture = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permiso denegado', 'Necesitas otorgar permisos para acceder a tus fotos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo cargar la imagen');
    }
  };

  const handleCustomerService = () => {
    Alert.alert(
      getTranslation(language, 'customerService') || 'Servicio al Cliente',
      getTranslation(language, 'howCanWeHelp') || '¿Cómo podemos ayudarte?',
      [
        {
          text: getTranslation(language, 'whatsapp') || 'WhatsApp',
          onPress: () => Linking.openURL('https://wa.me/50412345678')
        },
        {
          text: getTranslation(language, 'email') || 'Email',
          onPress: () => Linking.openURL('mailto:support@hotelfind.com')
        },
        {
          text: getTranslation(language, 'call') || 'Llamar',
          onPress: () => Linking.openURL('tel:+50412345678')
        },
        { text: getTranslation(language, 'cancel') || 'Cancelar', style: 'cancel' }
      ]
    );
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

  const displayName = supabaseUser?.user_metadata?.name || user.name || 'Invitado';
  const displayEmail = supabaseUser?.email || user.email || 'No registrado';

  return (
    <ScrollView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {/* Header del Usuario */}
      <View style={styles.profileHeader}>
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={handleChangeProfilePicture}
        >
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person-circle" size={80} color={colors.vibrantOrange} />
          )}
          <View style={styles.editIconContainer}>
            <Ionicons name="camera" size={20} color={colors.pureWhite} />
          </View>
        </TouchableOpacity>
        <Text style={[styles.name, { color: currentTheme.text, textAlign: 'center' }]}>{displayName}</Text>
        <Text style={[styles.email, { color: currentTheme.secondaryText, textAlign: 'center' }]}>{displayEmail}</Text>
        {supabaseUser && (
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={14} color={colors.goldenYellow} />
            <Text style={styles.badgeText}>{getTranslation(language, 'verifiedAccount') || 'Cuenta Verificada'}</Text>
          </View>
        )}
      </View>

      {/* Sección de Configuración */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
          {getTranslation(language, 'settings') || 'Configuración'}
        </Text>

        {/* Idioma */}
        <View style={[styles.settingItem, { borderBottomColor: currentTheme.border }]}>
          <View style={styles.settingLeft}>
            <Ionicons name="language" size={24} color={colors.vibrantOrange} />
            <Text style={[styles.settingText, { color: currentTheme.text }]}>
              {getTranslation(language, 'language') || 'Idioma'}
            </Text>
          </View>
          <View style={styles.languageButtons}>
            <TouchableOpacity
              style={[styles.langBtn, language === 'es' && styles.langBtnActive]}
              onPress={() => setLanguage('es')}
            >
              <Text style={[styles.langBtnText, language === 'es' && styles.langBtnTextActive]}>ES</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langBtn, language === 'en' && styles.langBtnActive]}
              onPress={() => setLanguage('en')}
            >
              <Text style={[styles.langBtnText, language === 'en' && styles.langBtnTextActive]}>EN</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Modo Oscuro */}
        <View style={[styles.settingItem, { borderBottomColor: currentTheme.border }]}>
          <View style={styles.settingLeft}>
            <Ionicons name={theme === 'dark' ? 'moon' : 'sunny'} size={24} color={colors.vibrantOrange} />
            <Text style={[styles.settingText, { color: currentTheme.text }]}>
              {getTranslation(language, 'darkMode') || 'Modo Oscuro'}
            </Text>
          </View>
          <Switch
            value={theme === 'dark'}
            onValueChange={(val) => setTheme(val ? 'dark' : 'light')}
            trackColor={{ false: '#D1D1D6', true: colors.vibrantOrange }}
            thumbColor={colors.pureWhite}
          />
        </View>

        {/* Servicio al Cliente */}
        <TouchableOpacity 
          style={[styles.settingItem, { borderBottomWidth: 0 }]}
          onPress={handleCustomerService}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="headset" size={24} color={colors.vibrantOrange} />
            <Text style={[styles.settingText, { color: currentTheme.text }]}>
              {getTranslation(language, 'customerService') || 'Servicio al Cliente'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={currentTheme.secondaryText} />
        </TouchableOpacity>
      </View>

      {/* Favoritos */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
          {getTranslation(language, 'savedHotels') || 'Hoteles Guardados'}
        </Text>
        {user.favoriteHotels && user.favoriteHotels.length > 0 ? (
          <FlatList 
            data={user.favoriteHotels} 
            keyExtractor={(i) => i.place_id ?? i.id ?? i.name} 
            renderItem={renderFavHotel}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.emptyText}>
            {getTranslation(language, 'noSavedHotels') || 'No tienes hoteles guardados'}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
          {getTranslation(language, 'favoriteOffers') || 'Ofertas Favoritas'}
        </Text>
        {user.favoriteOffers && user.favoriteOffers.length > 0 ? (
          <FlatList 
            data={user.favoriteOffers} 
            keyExtractor={(i) => i.id} 
            renderItem={renderFavOffer}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.emptyText}>
            {getTranslation(language, 'noSavedOffers') || 'No tienes ofertas guardadas'}
          </Text>
        )}
      </View>

      {/* Botón de Cerrar Sesión */}
      <View style={{ marginTop: 12, marginBottom: 40 }}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={colors.pureWhite} />
          <Text style={styles.logoutText}>
            {getTranslation(language, 'logout')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  avatarContainer: {
    marginBottom: 12,
    position: 'relative',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.darkGray,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.vibrantOrange,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.pureWhite,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  email: {
    fontSize: 14,
    marginTop: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.goldenYellow + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  badgeText: {
    color: colors.goldenYellow,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    marginRight: 8,
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
  languageButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F2F2F7',
    minWidth: 40,
    alignItems: 'center',
  },
  langBtnActive: {
    backgroundColor: colors.vibrantOrange,
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.darkGray,
  },
  langBtnTextActive: {
    color: colors.pureWhite,
  },
});

export default ProfileScreen;