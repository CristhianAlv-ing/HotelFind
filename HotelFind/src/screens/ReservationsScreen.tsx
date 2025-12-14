import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Modal, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/Store';
import { colors } from '../theme/colors';
import { lightTheme, darkTheme } from '../theme/themes';
import { getTranslation } from '../utils/translations';
import { removeReservation, updateReservation } from '../slices/userReducer';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { getUserReservations, cancelReservation, getCurrentUser, Reservation } from '../services/supabase';

const ReservationsScreen: React.FC = () => {
  const { language, theme } = useApp();
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.user);

  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingReservation, setEditingReservation] = useState<any | null>(null);
  const [supabaseReservations, setSupabaseReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar reservaciones desde Supabase
  const loadReservations = async () => {
    try {
      setLoading(true);
      const currentUser = await getCurrentUser();
      
      if (currentUser?.id) {
        const { data, error } = await getUserReservations(currentUser.id);
        
        if (!error && data) {
          setSupabaseReservations(data);
          console.log(`✅ ${data.length} reservaciones cargadas desde Supabase`);
        } else {
          console.log('ℹ️ Sin reservaciones o error:', error?.message);
        }
      } else {
        console.log('ℹ️ Usuario no autenticado, usando Redux');
      }
    } catch (error) {
      console.error('❌ Error cargando reservaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar al montar y cuando la pantalla obtiene foco
  useFocusEffect(
    React.useCallback(() => {
      loadReservations();
    }, [])
  );

  // Combinar reservaciones de Redux (legacy) y Supabase
  const reduxReservations = user.reservations || [];
  const allReservations = [...supabaseReservations, ...reduxReservations];
  const now = useMemo(() => new Date(), []);

  const upcoming = allReservations
    .filter((r: any) => {
      const checkInDate = new Date(r.check_in || r.checkIn || r.date);
      return checkInDate >= now && r.status !== 'cancelled';
    })
    .sort((a: any, b: any) => {
      const dateA = new Date(a.check_in || a.checkIn || a.date).getTime();
      const dateB = new Date(b.check_in || b.checkIn || b.date).getTime();
      return dateA - dateB;
    });

  const past = allReservations
    .filter((r: any) => {
      const checkInDate = new Date(r.check_in || r.checkIn || r.date);
      return checkInDate < now || r.status === 'cancelled';
    })
    .sort((a: any, b: any) => {
      const dateA = new Date(a.check_in || a.checkIn || a.date).getTime();
      const dateB = new Date(b.check_in || b.checkIn || b.date).getTime();
      return dateB - dateA;
    });

  const handleRemove = async (res: any) => {
    const checkDate = res?.check_in || res?.checkIn || res?.date;
    let refundable = false;
    let refundAmount = 0;
    if (checkDate) {
      const checkInDate = new Date(checkDate + 'T12:00:00');
      const diffDays = Math.floor((checkInDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      refundable = diffDays >= 7;
      if (refundable && (res?.total_price || res?.totalPrice)) {
        refundAmount = (res?.total_price || res?.totalPrice) * 0.75;
      }
    }

    const message = refundable
      ? `Cancelando con al menos 7 días de anticipación se reembolsa el 75%. Monto estimado: $${refundAmount.toFixed(2)}`
      : 'Cancelaciones con menos de 7 días de anticipación no generan reembolso.';

    Alert.alert(getTranslation(language, 'delete') || 'Eliminar', message, [
      { text: getTranslation(language, 'cancel') || 'Cancelar', style: 'cancel' },
      { 
        text: getTranslation(language, 'delete') || 'Eliminar', 
        style: 'destructive', 
        onPress: async () => {
          // Si tiene ID de Supabase, cancelar en Supabase
          if (res.id && typeof res.id === 'string' && res.id.length > 20) {
            const { error } = await cancelReservation(res.id);
            if (!error) {
              loadReservations();
            }
          } else {
            // Si es de Redux, usar Redux
            dispatch(removeReservation({ id: res.id }));
          }
        }
      },
    ]);
  };
  const renderItem = ({ item }: { item: any }) => {
    const hotelName = item.hotel_name || item.hotelName || 'Hotel';
    const checkIn = item.check_in || item.checkIn || item.date;
    const checkOut = item.check_out || item.checkOut;
    const guestsCount = item.guests || 1;
    const status = item.status;
    
    return (
      <View style={[styles.item, { backgroundColor: currentTheme.card }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.itemTitle, { color: currentTheme.text }]}>{hotelName}</Text>
          {status && (
            <Text style={[styles.statusBadge, status === 'cancelled' && styles.statusCancelled]}>
              {status === 'confirmed' ? '✓ Confirmada' : status === 'cancelled' ? '✗ Cancelada' : '⏳ Pendiente'}
            </Text>
          )}
          <Text style={[styles.itemMeta, { color: currentTheme.secondaryText }]}>
            {new Date(checkIn + 'T12:00:00').toLocaleDateString()} →
            {checkOut ? ` ${new Date(checkOut + 'T12:00:00').toLocaleDateString()}` : ''}
            {item.nights ? ` · ${item.nights} noche(s)` : ''}
          </Text>
          <Text style={[styles.itemMeta, { color: currentTheme.secondaryText }]}>Invitados: {guestsCount}</Text>
          {(item.total_price || item.totalPrice) && (
            <Text style={styles.itemPrice}>
              ${(item.total_price || item.totalPrice).toFixed(2)} {item.currency || 'USD'}
            </Text>
          )}
          {item.adjustmentType === 'penalty' && item.adjustmentAmount ? (
            <Text style={[styles.itemMeta, { color: currentTheme.secondaryText }]}>Costo de penalización: ${item.adjustmentAmount.toFixed(2)}</Text>
          ) : null}
          {item.adjustmentType === 'extension' && item.adjustmentAmount ? (
            <Text style={[styles.itemMeta, { color: currentTheme.secondaryText }]}>Costo de alargue: ${item.adjustmentAmount.toFixed(2)}</Text>
          ) : null}
          {item.notes ? <Text style={[styles.itemNotes, { color: currentTheme.secondaryText }]}>{item.notes}</Text> : null}
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity style={[styles.deleteBtn, { backgroundColor: currentTheme.background, borderColor: currentTheme.border }]} onPress={() => handleRemove(item)}>
            <Text style={styles.deleteText}>{getTranslation(language, 'delete') || 'Eliminar'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.deleteBtn, { marginTop: 6, borderColor: colors.vibrantOrange, backgroundColor: currentTheme.background }]} onPress={() => openEditModal(item)}>
            <Text style={[styles.deleteText, { color: colors.vibrantOrange }]}>Editar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const openEditModal = (res: any) => {
    setEditingReservation(res);
    setEditModalVisible(true);
  };

  const applyAdjustment = (type: 'penalty' | 'extension') => {
    if (!editingReservation) return;
    const perNight = editingReservation.pricePerNight ?? 0;
    let newCheckOut = editingReservation.checkOut || editingReservation.checkIn;
    let newNights = editingReservation.nights || 1;
    let adjustmentAmount = 0;

    const baseDate = new Date((editingReservation.checkOut || editingReservation.checkIn) + 'T12:00:00');
    if (type === 'extension') {
      const extended = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);
      newCheckOut = extended.toISOString().split('T')[0];
      newNights = (editingReservation.nights || 1) + 1;
      adjustmentAmount = perNight;
    } else {
      // penalty for leaving earlier: reduce one night if possible
      const shortened = new Date(baseDate.getTime() - 24 * 60 * 60 * 1000);
      const minDate = new Date((editingReservation.checkIn || editingReservation.date) + 'T12:00:00');
      if (shortened <= minDate) {
        Alert.alert(getTranslation(language, 'error') || 'Error', 'No puedes salir antes del día de entrada');
        return;
      }
      newCheckOut = shortened.toISOString().split('T')[0];
      newNights = Math.max(1, (editingReservation.nights || 1) - 1);
      adjustmentAmount = perNight * 0.5; // penalización 50% de una noche
    }

    const newTotal = (perNight * Math.max(1, newNights)) + (type === 'penalty' ? adjustmentAmount : 0);
    const updated = {
      ...editingReservation,
      checkOut: newCheckOut,
      nights: newNights,
      totalPrice: newTotal,
      adjustmentType: type,
      adjustmentAmount,
    };
    dispatch(updateReservation(updated));
    setEditModalVisible(false);
    setEditingReservation(null);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: currentTheme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.vibrantOrange} />
        <Text style={{ marginTop: 10, color: currentTheme.text }}>
          Cargando reservaciones...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: currentTheme.text }]}>{getTranslation(language, 'reservations') || 'Reservaciones'}</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('CreateReservation')}>
          <Text style={styles.primaryBtnText}>{getTranslation(language, 'addReservation') || 'Añadir reservación'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listWrap}>
        <View style={styles.tabRow}>
          <TouchableOpacity style={[styles.tabBtn, { borderColor: currentTheme.border, backgroundColor: tab === 'upcoming' ? colors.vibrantOrange : currentTheme.background }]} onPress={() => setTab('upcoming')}>
            <Text style={[styles.tabText, { color: tab === 'upcoming' ? colors.pureWhite : currentTheme.text }]}>{getTranslation(language, 'upcoming') || 'Próximas'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, { borderColor: currentTheme.border, backgroundColor: tab === 'past' ? colors.vibrantOrange : currentTheme.background }]} onPress={() => setTab('past')}>
            <Text style={[styles.tabText, { color: tab === 'past' ? colors.pureWhite : currentTheme.text }]}>{getTranslation(language, 'past') || 'Pasadas'}</Text>
          </TouchableOpacity>
        </View>

        {tab === 'upcoming' ? (
          upcoming.length === 0 ? <Text style={[styles.empty, { color: currentTheme.secondaryText }]}>{getTranslation(language, 'noUpcoming') || 'No hay reservaciones próximas'}</Text> : (
            <FlatList data={upcoming} keyExtractor={(i) => i.id} renderItem={renderItem} />
          )
        ) : (
          past.length === 0 ? <Text style={[styles.empty, { color: currentTheme.secondaryText }]}>{getTranslation(language, 'noPast') || 'No hay reservaciones pasadas'}</Text> : (
            <FlatList data={past} keyExtractor={(i) => i.id} renderItem={renderItem} />
          )
        )}
      </View>

      <Modal visible={editModalVisible} transparent animationType="fade" onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.editBackdrop}>
          <View style={styles.editCard}>
            <Text style={styles.editTitle}>Editar reservación</Text>
            <Text style={styles.editSubtitle}>Ajusta tu salida o agrega una noche</Text>
            <TouchableOpacity style={styles.editOption} onPress={() => applyAdjustment('penalty')}>
              <Text style={styles.editOptionText}>Salir un día antes (penalización)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.editOption, { backgroundColor: colors.vibrantOrange }]} onPress={() => applyAdjustment('extension')}>
              <Text style={[styles.editOptionText, { color: '#fff' }]}>Alargar una noche</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editClose} onPress={() => setEditModalVisible(false)}>
              <Text style={styles.editCloseText}>{getTranslation(language, 'close') || 'Cerrar'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700' },
  primaryBtn: { backgroundColor: colors.vibrantOrange, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  tabRow: { flexDirection: 'row', marginBottom: 12, gap: 8 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, borderWidth: 1 },
  tabText: { fontWeight: '700' },
  listWrap: { flex: 1, marginBottom: 12 },
  item: { flexDirection: 'row', padding: 12, borderRadius: 8, backgroundColor: '#f7f7f8', marginBottom: 8 },
  itemTitle: { fontWeight: '700' },
  itemMeta: { marginTop: 4 },
  itemPrice: { color: colors.vibrantOrange, fontWeight: '700', marginTop: 4, fontSize: 16 },
  itemNotes: { marginTop: 8 },
  statusBadge: { 
    fontSize: 12, 
    color: colors.goldenYellow, 
    fontWeight: '600', 
    marginTop: 2 
  },
  statusCancelled: { 
    color: '#FF3B30' 
  },
  itemActions: { justifyContent: 'center', marginLeft: 8 },
  deleteBtn: { paddingHorizontal: 8, paddingVertical: 6, backgroundColor: '#fff', borderRadius: 6, borderWidth: 1, borderColor: '#eee' },
  deleteText: { color: '#FF3B30' },
  empty: { textAlign: 'center', marginTop: 12 },
  editBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  editCard: { width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  editTitle: { fontWeight: '700', fontSize: 16, color: colors.deepBlue },
  editSubtitle: { color: colors.darkGray, marginTop: 4, marginBottom: 12 },
  editOption: { paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#f3f4f7', marginBottom: 10 },
  editOptionText: { fontWeight: '700', color: colors.deepBlue },
  editClose: { paddingVertical: 10, alignItems: 'center' },
  editCloseText: { color: colors.vibrantOrange, fontWeight: '700' },
});

export default ReservationsScreen;