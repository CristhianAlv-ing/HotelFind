import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Platform, Modal, Image, ScrollView, Animated } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/Store';
import { colors } from '../theme/colors';
import { getTranslation } from '../utils/translations';
import { addReservation } from '../slices/userReducer';
import { useApp } from '../context/AppContext';
import { findOfferForHotelByName } from '../services/offers';

const CreateReservationScreen: React.FC = () => {
  const { language } = useApp();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.user);

  const prefillHotel = route?.params?.hotel as any | undefined;
  const [checkIn, setCheckIn] = useState<string | null>(route?.params?.checkIn ?? null);
  const [checkOut, setCheckOut] = useState<string | null>(route?.params?.checkOut ?? null);
  const [userName, setUserName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [guestsText, setGuestsText] = useState<string>('1');
  const [notes, setNotes] = useState<string>('');
  const [calendarVisible, setCalendarVisible] = useState<boolean>(false);
  const [nights, setNights] = useState<number>(1);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const panelAnim = useRef(new Animated.Value(0)).current;
  const [pricePerNight, setPricePerNight] = useState<number | undefined>(undefined);
  const [selectedRoom, setSelectedRoom] = useState<{ id: string; name: string; capacity: number; price: number } | null>(null);

  const toggleDetails = (open?: boolean) => {
    const next = open !== undefined ? open : !detailsOpen;
    setDetailsOpen(next);
    Animated.timing(panelAnim, { toValue: next ? 1 : 0, duration: 280, useNativeDriver: true }).start();
  };

  useEffect(() => {
    if (prefillHotel?.name) {
      findOfferForHotelByName(prefillHotel.name).then(offer => {
        if (offer && offer.price && offer.price > 0) {
          setPricePerNight(offer.price);
        } else {
          const base = Math.max(40, Math.round((prefillHotel?.rating || 3) * 25));
          setPricePerNight(base);
        }
      }).catch(() => {
        const base = Math.max(40, Math.round((prefillHotel?.rating || 3) * 25));
        setPricePerNight(base);
      });
    }
  }, [prefillHotel?.name]);

  useEffect(() => {
    setUserName(user?.name || '');
    setPhoneNumber((user as any)?.phone || '');
  }, [user?.name]);

  const rooms = useMemo(() => {
    const base = pricePerNight ?? Math.max(40, Math.round((prefillHotel?.rating || 3) * 25));
    return [
      { id: 'std', name: 'Estándar', capacity: 2, price: base },
      { id: 'dlx', name: 'Deluxe', capacity: 3, price: Math.round(base * 1.3) },
      { id: 'ste', name: 'Suite', capacity: 4, price: Math.round(base * 1.8) },
    ];
  }, [pricePerNight, prefillHotel?.rating]);

  useEffect(() => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn + 'T12:00:00');
      const end = new Date(checkOut + 'T12:00:00');
      const diffMs = end.getTime() - start.getTime();
      const diffDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
      setNights(diffDays);
    }
  }, [checkIn, checkOut]);

  const markedDates: { [key: string]: any } = (() => {
    const map: { [key: string]: any } = {};
    if (checkIn && checkOut) {
      const start = new Date(checkIn + 'T00:00:00');
      const end = new Date(checkOut + 'T00:00:00');
      const dayMs = 24 * 60 * 60 * 1000;
      for (let t = start.getTime(); t <= end.getTime(); t += dayMs) {
        const d = new Date(t);
        const y = d.toISOString().split('T')[0];
        if (y === checkIn) map[y] = { startingDay: true, color: colors.vibrantOrange, textColor: '#fff' };
        else if (y === checkOut) map[y] = { endingDay: true, color: colors.vibrantOrange, textColor: '#fff' };
        else map[y] = { color: '#FFD9C7', textColor: colors.deepBlue };
      }
    } else if (checkIn) {
      map[checkIn] = { startingDay: true, color: colors.vibrantOrange, textColor: '#fff' };
    }
    return map;
  })();

  const formatDisplayDate = (isoYmd?: string | null) => {
    if (!isoYmd) return '';
    try {
      const d = new Date(isoYmd + 'T12:00:00');
      return d.toLocaleDateString();
    } catch {
      return isoYmd;
    }
  };

  const onDayPress = (day: any) => {
    const ymd = day?.dateString as string;
    if (!ymd) return;
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(ymd);
      setCheckOut(null);
      return;
    }
    if (checkIn && !checkOut) {
      if (ymd >= checkIn) {
        setCheckOut(ymd);
        setCalendarVisible(false);
      } else {
        setCheckIn(ymd);
      }
      return;
    }
  };

  const handleAdd = () => {
    if (!userName || userName.trim().length === 0) {
      Alert.alert(getTranslation(language, 'error') || 'Error', 'Ingresa el nombre de quien reserva');
      return;
    }
    if (!checkIn || !checkOut) {
      Alert.alert(getTranslation(language, 'error') || 'Error', 'Selecciona fecha de entrada y salida');
      return;
    }
    const hotelName = prefillHotel?.name ?? (route?.params?.hotelName ?? '');
    if (!hotelName || hotelName.trim().length === 0) {
      Alert.alert(getTranslation(language, 'error') || 'Error', 'Proporciona el nombre del hotel');
      return;
    }
    const guests = parseInt(guestsText || '1', 10);
    if (nights <= 0) {
      Alert.alert(getTranslation(language, 'error') || 'Error', 'Selecciona un rango de al menos 1 noche');
      return;
    }
    if (selectedRoom && guests > selectedRoom.capacity) {
      Alert.alert(getTranslation(language, 'error') || 'Error', `La habitación seleccionada admite hasta ${selectedRoom.capacity} persona(s)`);
      return;
    }
    const isoCheckIn = new Date(checkIn + 'T12:00:00').toISOString();
    const isoCheckOut = new Date(checkOut + 'T12:00:00').toISOString();
    const perNight = selectedRoom?.price ?? pricePerNight ?? Math.max(40, Math.round((prefillHotel?.rating || 3) * 25));
    const total = perNight * Math.max(1, nights);
    const newRes = {
      id: Date.now().toString(),
      hotelName: hotelName.trim(),
      place_id: prefillHotel?.place_id ?? undefined,
      date: isoCheckIn,
      checkIn: checkIn,
      checkOut: checkOut,
      guests: guests > 0 ? guests : 1,
      notes: notes || undefined,
      userName: userName.trim(),
      phoneNumber: phoneNumber.trim() || undefined,
      nights: Math.max(1, nights),
      roomType: selectedRoom?.name,
      roomCapacity: selectedRoom?.capacity,
      pricePerNight: perNight,
      totalPrice: total,
      createdAt: new Date().toISOString(),
    };
    dispatch(addReservation(newRes));
    Alert.alert(getTranslation(language, 'reservations') || 'Reservación', 'Reservación agregada');
    // Volver al tab de Reservaciones
    navigation.navigate('MainTabs', { screen: 'Reservations' });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Text style={styles.title}>Nueva reservación</Text>

        {/* Hotel name display if prefilled */}
        {prefillHotel?.name ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.prefillHotel}>{prefillHotel.name}</Text>
            <TouchableOpacity onPress={() => toggleDetails(true)}>
              <Text style={{ color: colors.vibrantOrange, fontWeight: '700' }}>Detalles del hotel</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Nombre de quien reserva */}
        <Text style={styles.label}>{getTranslation(language, 'fullName') || 'Nombre completo'}</Text>
        <TextInput
          value={userName}
          onChangeText={setUserName}
          placeholder={getTranslation(language, 'fullName') || 'Nombre completo'}
          style={styles.input}
        />

        {/* Teléfono */}
        <Text style={[styles.label, { marginTop: 8 }]}>{getTranslation(language, 'phone') || 'Teléfono'}</Text>
        <TextInput
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder={getTranslation(language, 'phone') || 'Teléfono'}
          keyboardType="phone-pad"
          style={styles.input}
        />

        {/* Date range: open calendar modal */}
        <Text style={[styles.label, { marginTop: 10 }]}>{getTranslation(language, 'selectDates') || 'Selecciona fechas'}</Text>
        <TouchableOpacity style={styles.datePicker} onPress={() => setCalendarVisible(true)}>
          <Text style={styles.datePickerText}>
            {checkIn ? `${getTranslation(language, 'checkIn') || 'Entrada'}: ${formatDisplayDate(checkIn)}` : (getTranslation(language, 'checkIn') || 'Entrada')}
            {checkOut ? `  ·  ${getTranslation(language, 'checkOut') || 'Salida'}: ${formatDisplayDate(checkOut)}` : ''}
          </Text>
        </TouchableOpacity>

        {/* Nights (auto-computed) */}
        <Text style={[styles.label, { marginTop: 10 }]}>Noches</Text>
        <View style={styles.nightsRowReadonly}>
          <Text style={styles.nightsValue}>{nights}</Text>
        </View>

        {/* Guests */}
        <Text style={[styles.label, { marginTop: 10 }]}>{getTranslation(language, 'guests') || 'Invitados'}</Text>
        <TextInput
          value={guestsText}
          onChangeText={setGuestsText}
          placeholder="1"
          keyboardType="number-pad"
          style={styles.input}
        />

        {/* Rooms selection if hotel provided */}
        {prefillHotel?.name ? (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.label}>Habitación</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
              {rooms.map(r => (
                <TouchableOpacity key={r.id} style={[styles.roomChip, selectedRoom?.id === r.id ? styles.roomChipActive : null]} onPress={() => setSelectedRoom(r)}>
                  <Text style={[styles.roomChipText, selectedRoom?.id === r.id ? styles.roomChipTextActive : null]}>{r.name} · {r.capacity} pers · ${r.price}/noche</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Price summary */}
        <View style={styles.priceBox}>
          <Text style={styles.priceLine}>Precio por noche: ${selectedRoom?.price ?? pricePerNight ?? 0}</Text>
          <Text style={styles.priceLine}>Noches: {nights}</Text>
          <Text style={[styles.priceLine, { fontWeight: '700', color: colors.deepBlue }]}>Total: ${((selectedRoom?.price ?? pricePerNight ?? 0) * Math.max(1, nights)).toFixed(2)}</Text>
        </View>

        {/* Notas */}
        <Text style={[styles.label, { marginTop: 10 }]}>{getTranslation(language, 'notes') || 'Notas (opcional)'}</Text>
        <TextInput value={notes} onChangeText={setNotes} placeholder={getTranslation(language, 'notesPlaceholder') || 'Notas'} style={styles.input} />

        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
          <Text style={styles.addBtnText}>{getTranslation(language, 'reserveNow') || 'Reservar ahora'}</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={calendarVisible} animationType="slide" onRequestClose={() => setCalendarVisible(false)}>
        <View style={styles.calendarWrap}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => setCalendarVisible(false)}>
              <Text style={styles.calendarClose}>{getTranslation(language, 'close') || 'Cerrar'}</Text>
            </TouchableOpacity>
            <Text style={styles.calendarTitle}>{getTranslation(language, 'selectDates') || 'Selecciona fechas'}</Text>
            <View style={{ width: 60 }} />
          </View>

          <Calendar
            onDayPress={onDayPress}
            markedDates={markedDates}
            markingType="period"
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

      {/* Sliding hotel details panel */}
      {prefillHotel ? (
        <Animated.View pointerEvents={detailsOpen ? 'auto' : 'none'}
          style={[styles.detailsPanel, {
            transform: [{ translateY: panelAnim.interpolate({ inputRange: [0, 1], outputRange: [400, 0] }) }],
            opacity: panelAnim,
          }]}
        >
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsTitle}>Detalles del hotel</Text>
            <TouchableOpacity onPress={() => toggleDetails(false)}>
              <Text style={{ color: colors.vibrantOrange, fontWeight: '700' }}>{getTranslation(language, 'close') || 'Cerrar'}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
            {prefillHotel.photoUrl ? (
              <Image source={{ uri: prefillHotel.photoUrl }} style={styles.detailsImage} />
            ) : null}
            <Text style={styles.hotelName}>{prefillHotel.name}</Text>
            {prefillHotel.rating ? <Text style={styles.hotelMeta}>⭐ {prefillHotel.rating}</Text> : null}
            {prefillHotel.address ? <Text style={styles.hotelMeta}>{prefillHotel.address}</Text> : null}
            {prefillHotel.website ? <Text style={[styles.hotelMeta, { color: colors.vibrantOrange }]}>{prefillHotel.website}</Text> : null}

            <Text style={[styles.detailsSubtitle, { marginTop: 14 }]}>Habitaciones disponibles</Text>
            {rooms.map((r, idx) => (
              <View key={r.id} style={styles.roomRow}>
                {prefillHotel.photoUrls && prefillHotel.photoUrls[idx % (prefillHotel.photoUrls.length || 1)] ? (
                  <Image source={{ uri: prefillHotel.photoUrls[idx % prefillHotel.photoUrls.length] }} style={styles.roomImage} />
                ) : (
                  <View style={[styles.roomImage, { backgroundColor: '#eee' }]} />
                )}
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.roomTitle}>{r.name}</Text>
                  <Text style={styles.roomMeta}>Capacidad: {r.capacity} · ${r.price}/noche</Text>
                </View>
                <TouchableOpacity style={[styles.selectBtn, selectedRoom?.id === r.id ? styles.selectBtnActive : null]} onPress={() => setSelectedRoom(r)}>
                  <Text style={[styles.selectBtnText, selectedRoom?.id === r.id ? styles.selectBtnTextActive : null]}>{selectedRoom?.id === r.id ? 'Seleccionado' : 'Seleccionar'}</Text>
                </TouchableOpacity>
              </View>
            ))}

            <Text style={[styles.detailsSubtitle, { marginTop: 16 }]}>{getTranslation(language, 'activitiesTitle') || 'Actividades y zonas recreativas'}</Text>
            <Text style={styles.activityText}>• Piscina al aire libre y solárium</Text>
            <Text style={styles.activityText}>• Gimnasio equipado y spa</Text>
            <Text style={styles.activityText}>• Restaurante con cocina local e internacional</Text>
            <Text style={styles.activityText}>• Tours y actividades cercanas (playa, montaña, ciudad)</Text>
          </ScrollView>
        </Animated.View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', color: colors.deepBlue, marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, paddingHorizontal: 10, paddingVertical: Platform.OS === 'ios' ? 10 : 6, marginBottom: 8 },
  addBtn: { backgroundColor: colors.deepBlue, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  addBtnText: { color: '#fff', fontWeight: '700' },
  prefillHotel: { marginBottom: 8, fontWeight: '600', color: colors.deepBlue },
  label: { color: colors.darkGray, marginBottom: 6 },
  datePicker: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 10 },
  datePickerText: { color: colors.deepBlue },
  calendarWrap: { flex: 1, backgroundColor: '#fff' },
  calendarHeader: { paddingTop: 48, paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#eee' },
  calendarClose: { color: colors.vibrantOrange, fontWeight: '700' },
  calendarTitle: { fontWeight: '700', color: colors.deepBlue, fontSize: 16 },
  nightsRowReadonly: { paddingVertical: 8, alignItems: 'flex-start' },
  nightsValue: { width: 48, textAlign: 'center', fontWeight: '700', color: colors.deepBlue, fontSize: 16 },
  roomChip: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#eee', borderRadius: 16, marginRight: 8, backgroundColor: '#fff' },
  roomChipActive: { backgroundColor: colors.vibrantOrange, borderColor: colors.vibrantOrange },
  roomChipText: { color: colors.deepBlue, fontWeight: '600' },
  roomChipTextActive: { color: '#fff' },
  priceBox: { marginTop: 10, backgroundColor: '#f7f7f8', borderRadius: 8, padding: 10 },
  priceLine: { color: colors.deepBlue, marginTop: 2 },
  detailsPanel: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, elevation: 16, paddingTop: 12, maxHeight: '75%' },
  detailsHeader: { paddingHorizontal: 16, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailsTitle: { fontWeight: '700', fontSize: 16, color: colors.deepBlue },
  detailsImage: { width: '100%', height: 180, borderRadius: 12, marginBottom: 12 },
  hotelName: { fontSize: 18, fontWeight: '700', color: colors.deepBlue },
  hotelMeta: { marginTop: 6, color: colors.darkGray },
  detailsSubtitle: { fontWeight: '700', color: colors.deepBlue, marginTop: 8 },
  roomRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  roomImage: { width: 72, height: 56, borderRadius: 8 },
  roomTitle: { fontWeight: '700', color: colors.deepBlue },
  roomMeta: { color: colors.darkGray, marginTop: 2 },
  selectBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.deepBlue },
  selectBtnActive: { backgroundColor: colors.deepBlue },
  selectBtnText: { color: colors.deepBlue, fontWeight: '700' },
  selectBtnTextActive: { color: '#fff' },
  activityText: { marginTop: 6, color: colors.darkGray },
});

export default CreateReservationScreen;
