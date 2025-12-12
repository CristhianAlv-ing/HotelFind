// src/screens/ReservationsScreen.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/Store';
import { colors } from '../theme/colors';
import { addReservation, removeReservation } from '../slices/userReducer';
import { useRoute } from '@react-navigation/native';

const ReservationsScreen: React.FC = () => {
  const route = useRoute<any>();
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.user);

  const prefillHotel = route?.params?.hotel as any | undefined;

  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [hotelName, setHotelName] = useState<string>(prefillHotel?.name ?? '');
  const [dateText, setDateText] = useState<string>('');
  const [guestsText, setGuestsText] = useState<string>('1');
  const [notes, setNotes] = useState<string>('');

  const reservations = user.reservations || [];
  const now = useMemo(() => new Date(), []);

  const upcoming = reservations.filter(r => new Date(r.date) >= now).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const past = reservations.filter(r => new Date(r.date) < now).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAdd = () => {
    if (!hotelName || hotelName.trim().length === 0) {
      Alert.alert('Error', 'Proporciona el nombre del hotel');
      return;
    }
    const guests = parseInt(guestsText || '1', 10);
    const date = new Date(dateText);
    if (isNaN(date.getTime())) {
      Alert.alert('Error', 'Fecha inválida. Usa un formato reconocible (ej. 2025-12-20T15:30).');
      return;
    }

    const newRes = {
      id: Date.now().toString(),
      hotelName: hotelName.trim(),
      place_id: prefillHotel?.place_id ?? undefined,
      date: date.toISOString(),
      guests: guests > 0 ? guests : 1,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
    };
    dispatch(addReservation(newRes));
    Alert.alert('Reservación', 'Reservación agregada');
    setHotelName('');
    setDateText('');
    setGuestsText('1');
    setNotes('');
    setTab('upcoming');
  };

  const handleRemove = (id: string) => {
    Alert.alert('Eliminar', '¿Eliminar esta reservación?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => dispatch(removeReservation({ id })) },
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{item.hotelName}</Text>
        <Text style={styles.itemMeta}>{new Date(item.date).toLocaleString()}</Text>
        <Text style={styles.itemMeta}>Invitados: {item.guests}</Text>
        {item.notes ? <Text style={styles.itemNotes}>{item.notes}</Text> : null}
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleRemove(item.id)}>
          <Text style={styles.deleteText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reservaciones</Text>

      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tabBtn, tab === 'upcoming' ? styles.tabActive : null]} onPress={() => setTab('upcoming')}>
          <Text style={[styles.tabText, tab === 'upcoming' ? styles.tabTextActive : null]}>Próximas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === 'past' ? styles.tabActive : null]} onPress={() => setTab('past')}>
          <Text style={[styles.tabText, tab === 'past' ? styles.tabTextActive : null]}>Pasadas</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listWrap}>
        {tab === 'upcoming' ? (
          upcoming.length === 0 ? <Text style={styles.empty}>No hay reservaciones próximas</Text> : (
            <FlatList data={upcoming} keyExtractor={(i) => i.id} renderItem={renderItem} />
          )
        ) : (
          past.length === 0 ? <Text style={styles.empty}>No hay reservaciones pasadas</Text> : (
            <FlatList data={past} keyExtractor={(i) => i.id} renderItem={renderItem} />
          )
        )}
      </View>

      <View style={styles.addWrap}>
        <Text style={styles.addTitle}>Añadir reservación</Text>
        <TextInput value={hotelName} onChangeText={setHotelName} placeholder="Hotel" style={styles.input} />
        <TextInput value={dateText} onChangeText={setDateText} placeholder="Fecha (ej. 2025-12-20T15:30)" style={styles.input} />
        <TextInput value={guestsText} onChangeText={setGuestsText} placeholder="Invitados" keyboardType="number-pad" style={styles.input} />
        <TextInput value={notes} onChangeText={setNotes} placeholder="Notas (opcional)" style={styles.input} />
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
          <Text style={styles.addBtnText}>Reservar ahora</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', color: colors.deepBlue, marginBottom: 12 },
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
  addWrap: { marginTop: 8, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12 },
  addTitle: { fontWeight: '700', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, paddingHorizontal: 10, paddingVertical: Platform.OS === 'ios' ? 10 : 6, marginBottom: 8 },
  addBtn: { backgroundColor: colors.deepBlue, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700' },
  empty: { color: colors.darkGray, textAlign: 'center', marginTop: 12 },
});

export default ReservationsScreen;