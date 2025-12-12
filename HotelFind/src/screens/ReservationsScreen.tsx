import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/Store';
import { colors } from '../theme/colors';
import { getTranslation } from '../utils/translations';
import { addReservation, removeReservation } from '../slices/userReducer';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Calendar, DateObject } from 'react-native-calendars';
import { useApp } from '../context/AppContext';

const ReservationsScreen: React.FC = () => {
  const { language } = useApp();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.user);

  const prefillHotel = route?.params?.hotel as any | undefined;

  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  // Manage date selection using calendar
  const [selectedDate, setSelectedDate] = useState<string | null>(prefillHotel?.date ? prefillHotel.date.split('T')[0] : null); // YYYY-MM-DD
  const [dateInputText, setDateInputText] = useState<string>(selectedDate ?? '');
  const [guestsText, setGuestsText] = useState<string>('1');
  const [notes, setNotes] = useState<string>('');
  const [calendarVisible, setCalendarVisible] = useState<boolean>(false);

  const reservations = user.reservations || [];

  const now = useMemo(() => new Date(), []);

  const upcoming = reservations
    .filter(r => new Date(r.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const past = reservations
    .filter(r => new Date(r.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatDisplayDate = (isoYmd?: string | null) => {
    if (!isoYmd) return '';
    try {
      const d = new Date(isoYmd + 'T12:00:00'); // noon avoids timezone shifts
      return d.toLocaleDateString();
    } catch {
      return isoYmd;
    }
  };

  const onDayPress = (day: DateObject) => {
    // day.dateString is YYYY-MM-DD
    setSelectedDate(day.dateString);
    setDateInputText(day.dateString);
    setCalendarVisible(false);
  };

  const handleAdd = () => {
    if (!selectedDate && dateInputText.trim().length === 0) {
      Alert.alert(getTranslation(language, 'error') || 'Error', 'Selecciona la fecha de la reservación');
      return;
    }

    if (!prefillHotel && (!dateInputText || dateInputText.trim().length === 0)) {
      // if no hotel prefill, require hotel name entry (handled below)
    }

    const hotelName = prefillHotel?.name ?? (route?.params?.hotelName ?? '');

    if (!hotelName || hotelName.trim().length === 0) {
      Alert.alert(getTranslation(language, 'error') || 'Error', 'Proporciona el nombre del hotel');
      return;
    }

    const guests = parseInt(guestsText || '1', 10);

    // Construct an ISO date using the selected YYYY-MM-DD, set time to 12:00
    const chosenYmd = selectedDate ?? dateInputText;
    const isoDate = new Date(chosenYmd + 'T12:00:00').toISOString();

    if (isNaN(new Date(isoDate).getTime())) {
      Alert.alert(getTranslation(language, 'error') || 'Error', 'Fecha inválida.');
      return;
    }

    const newRes = {
      id: Date.now().toString(),
      hotelName: hotelName.trim(),
      place_id: prefillHotel?.place_id ?? undefined,
      date: isoDate,
      guests: guests > 0 ? guests : 1,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
    };
    dispatch(addReservation(newRes));
    Alert.alert(getTranslation(language, 'reservations') || 'Reservación', 'Reservación agregada');
    // limpiar formulario
    // if it was prefilled from a hotel, keep hotelName cleared; keep selected date optional behavior:
    setSelectedDate(null);
    setDateInputText('');
    setGuestsText('1');
    setNotes('');
    setTab('upcoming');
  };

  const handleRemove = (id: string) => {
    Alert.alert(getTranslation(language, 'delete') || 'Eliminar', '¿Eliminar esta reservación?', [
      { text: getTranslation(language, 'cancel') || 'Cancelar', style: 'cancel' },
      { text: getTranslation(language, 'delete') || 'Eliminar', style: 'destructive', onPress: () => dispatch(removeReservation({ id })) },
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
          <Text style={styles.deleteText}>{getTranslation(language, 'delete') || 'Eliminar'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // markedDates for react-native-calendars
  const markedDates: { [key: string]: any } = {};
  if (selectedDate) {
    markedDates[selectedDate] = { selected: true, selectedColor: colors.vibrantOrange };
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{getTranslation(language, 'reservations') || 'Reservaciones'}</Text>

      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tabBtn, tab === 'upcoming' ? styles.tabActive : null]} onPress={() => setTab('upcoming')}>
          <Text style={[styles.tabText, tab === 'upcoming' ? styles.tabTextActive : null]}>{getTranslation(language, 'upcoming') || 'Próximas'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === 'past' ? styles.tabActive : null]} onPress={() => setTab('past')}>
          <Text style={[styles.tabText, tab === 'past' ? styles.tabTextActive : null]}>{getTranslation(language, 'past') || 'Pasadas'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listWrap}>
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

      <View style={styles.addWrap}>
        <Text style={styles.addTitle}>{getTranslation(language, 'addReservation') || 'Añadir reservación'}</Text>

        {/* Hotel name display if prefilled */}
        {prefillHotel?.name ? (
          <Text style={styles.prefillHotel}>{prefillHotel.name}</Text>
        ) : null}

        {/* Date input: open calendar modal */}
        <Text style={styles.label}>{getTranslation(language, 'date') || 'Fecha'}</Text>
        <TouchableOpacity style={styles.datePicker} onPress={() => setCalendarVisible(true)}>
          <Text style={styles.datePickerText}>
            {selectedDate ? formatDisplayDate(selectedDate) : (getTranslation(language, 'selectDate') || 'Selecciona una fecha')}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.label, { marginTop: 10 }]}>{getTranslation(language, 'guests') || 'Invitados'}</Text>
        <TextInput
          value={guestsText}
          onChangeText={setGuestsText}
          placeholder="1"
          keyboardType="number-pad"
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 10 }]}>{getTranslation(language, 'notes') || 'Notas (opcional)'}</Text>
        <TextInput value={notes} onChangeText={setNotes} placeholder={getTranslation(language, 'notesPlaceholder') || 'Notas'} style={styles.input} />

        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
          <Text style={styles.addBtnText}>{getTranslation(language, 'reserveNow') || 'Reservar ahora'}</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={calendarVisible} animationType="slide" onRequestClose={() => setCalendarVisible(false)}>
        <View style={styles.calendarWrap}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => setCalendarVisible(false)}>
              <Text style={styles.calendarClose}>{getTranslation(language, 'close') || 'Cerrar'}</Text>
            </TouchableOpacity>
            <Text style={styles.calendarTitle}>{getTranslation(language, 'selectDate') || 'Selecciona una fecha'}</Text>
            <View style={{ width: 60 }} />
          </View>

          <Calendar
            onDayPress={onDayPress}
            markedDates={markedDates}
            minDate={new Date().toISOString().split('T')[0]}
            theme={{
              selectedDayBackgroundColor: colors.vibrantOrange,
              todayTextColor: colors.vibrantOrange,
              arrowColor: colors.deepBlue,
              monthTextColor: colors.deepBlue,
            }}
            style={{ borderTopWidth: 1, borderColor: '#eee' }}
          />
        </View>
      </Modal>
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
  addBtn: { backgroundColor: colors.deepBlue, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  addBtnText: { color: '#fff', fontWeight: '700' },
  empty: { color: colors.darkGray, textAlign: 'center', marginTop: 12 },
  prefillHotel: { marginBottom: 8, fontWeight: '600', color: colors.deepBlue },
  label: { color: colors.darkGray, marginBottom: 6 },
  datePicker: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 10 },
  datePickerText: { color: colors.deepBlue },
  calendarWrap: { flex: 1, backgroundColor: '#fff' },
  calendarHeader: { paddingTop: 48, paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#eee' },
  calendarClose: { color: colors.vibrantOrange, fontWeight: '700' },
  calendarTitle: { fontWeight: '700', color: colors.deepBlue, fontSize: 16 },
});

export default ReservationsScreen;