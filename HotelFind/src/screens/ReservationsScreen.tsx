import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Modal } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/Store';
import { colors } from '../theme/colors';
import { getTranslation } from '../utils/translations';
import { removeReservation, updateReservation } from '../slices/userReducer';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';

const ReservationsScreen: React.FC = () => {
  const { language } = useApp();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.user);

  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingReservation, setEditingReservation] = useState<any | null>(null);

  const reservations = user.reservations || [];
  const now = useMemo(() => new Date(), []);

  const upcoming = reservations
    .filter((r: any) => new Date(r.date) >= now)
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const past = reservations
    .filter((r: any) => new Date(r.date) < now)
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleRemove = (res: any) => {
    const checkDate = res?.checkIn || res?.date;
    let refundable = false;
    let refundAmount = 0;
    if (checkDate) {
      const checkInDate = new Date(checkDate + 'T12:00:00');
      const diffDays = Math.floor((checkInDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      refundable = diffDays >= 7;
      if (refundable && res?.totalPrice) {
        refundAmount = res.totalPrice * 0.75;
      }
    }

    const message = refundable
      ? `Cancelando con al menos 7 días de anticipación se reembolsa el 75%. Monto estimado: $${refundAmount.toFixed(2)}`
      : 'Cancelaciones con menos de 7 días de anticipación no generan reembolso.';

    Alert.alert(getTranslation(language, 'delete') || 'Eliminar', message, [
      { text: getTranslation(language, 'cancel') || 'Cancelar', style: 'cancel' },
      { text: getTranslation(language, 'delete') || 'Eliminar', style: 'destructive', onPress: () => dispatch(removeReservation({ id: res.id })) },
    ]);
  };
  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{item.hotelName}</Text>
        <Text style={styles.itemMeta}>
          {(item.checkIn ? new Date(item.checkIn + 'T12:00:00') : new Date(item.date)).toLocaleDateString()} →
          {item.checkOut ? ` ${new Date(item.checkOut + 'T12:00:00').toLocaleDateString()}` : ''}
          {item.nights ? ` · ${item.nights} noche(s)` : ''}
        </Text>
        <Text style={styles.itemMeta}>Invitados: {item.guests}</Text>
        {item.adjustmentType === 'penalty' && item.adjustmentAmount ? (
          <Text style={styles.itemMeta}>Costo de penalización: ${item.adjustmentAmount.toFixed(2)}</Text>
        ) : null}
        {item.adjustmentType === 'extension' && item.adjustmentAmount ? (
          <Text style={styles.itemMeta}>Costo de alargue: ${item.adjustmentAmount.toFixed(2)}</Text>
        ) : null}
        {item.notes ? <Text style={styles.itemNotes}>{item.notes}</Text> : null}
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleRemove(item)}>
          <Text style={styles.deleteText}>{getTranslation(language, 'delete') || 'Eliminar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.deleteBtn, { marginTop: 6, borderColor: colors.vibrantOrange }]} onPress={() => openEditModal(item)}>
          <Text style={[styles.deleteText, { color: colors.vibrantOrange }]}>Editar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{getTranslation(language, 'reservations') || 'Reservaciones'}</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('CreateReservation')}>
          <Text style={styles.primaryBtnText}>{getTranslation(language, 'addReservation') || 'Añadir reservación'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listWrap}>
        <View style={styles.tabRow}>
          <TouchableOpacity style={[styles.tabBtn, tab === 'upcoming' ? styles.tabActive : null]} onPress={() => setTab('upcoming')}>
            <Text style={[styles.tabText, tab === 'upcoming' ? styles.tabTextActive : null]}>{getTranslation(language, 'upcoming') || 'Próximas'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, tab === 'past' ? styles.tabActive : null]} onPress={() => setTab('past')}>
            <Text style={[styles.tabText, tab === 'past' ? styles.tabTextActive : null]}>{getTranslation(language, 'past') || 'Pasadas'}</Text>
          </TouchableOpacity>
        </View>

        {tab === 'upcoming' ? (
          upcoming.length === 0 ? <Text style={styles.empty}>{getTranslation(language, 'noUpcoming') || 'No hay reservaciones próximas'}</Text> : (
            <FlatList data={upcoming} keyExtractor={(i) => i.id} renderItem={renderItem} />
          )
        ) : (
          past.length === 0 ? <Text style={styles.empty}>{getTranslation(language, 'noPast') || 'No hay reservaciones pasadas'}</Text> : (
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
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', color: colors.deepBlue },
  primaryBtn: { backgroundColor: colors.vibrantOrange, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  tabRow: { flexDirection: 'row', marginBottom: 12 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  tabActive: { backgroundColor: colors.vibrantOrange },
  tabText: { color: colors.deepBlue, fontWeight: '700' },
  tabTextActive: { color: '#fff' },
  listWrap: { flex: 1, marginBottom: 12 },
  item: { flexDirection: 'row', padding: 12, borderRadius: 8, backgroundColor: '#f7f7f8', marginBottom: 8 },
  itemTitle: { fontWeight: '700', color: colors.deepBlue },
  itemMeta: { color: colors.darkGray, marginTop: 4 },
  itemNotes: { marginTop: 8, color: colors.darkGray },
  itemActions: { justifyContent: 'center', marginLeft: 8 },
  deleteBtn: { paddingHorizontal: 8, paddingVertical: 6, backgroundColor: '#fff', borderRadius: 6, borderWidth: 1, borderColor: '#eee' },
  deleteText: { color: '#FF3B30' },
  empty: { color: colors.darkGray, textAlign: 'center', marginTop: 12 },
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