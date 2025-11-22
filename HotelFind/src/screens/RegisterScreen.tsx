import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { CountryPicker } from '../components/CountryPicker';
import { colors } from '../theme/colors';
import { countries, Country, getPhonePlaceholder } from '../utils/countries';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/userSlice';

const RegisterScreen: React.FC<any> = ({ navigation, route }) => {
  const dispatch = useDispatch();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find(c => c.code === 'HN') || countries[0]
  );
  const { setIsLoggedIn } = route.params;

  const validateEmail = (text: string) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (text.length > 0 && !emailRegex.test(text)) {
      setEmailError('Correo no válido');
    } else {
      setEmailError('');
    }
  };

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let maxLength = 10;

    if (selectedCountry.dialCode === '+55') maxLength = 11;
    else if (selectedCountry.dialCode === '+52') maxLength = 10;
    else if (selectedCountry.dialCode === '+504') maxLength = 8;
    else if (selectedCountry.dialCode.startsWith('+1')) maxLength = 10;
    else maxLength = 12;

    if (cleaned.length > maxLength) return;

    let formatted = '';
    if (cleaned.length > 0) {
      if (selectedCountry.dialCode === '+504') {
        formatted = cleaned.length <= 4
          ? cleaned
          : cleaned.slice(0, 4) + ' - ' + cleaned.slice(4);
      } else if (selectedCountry.dialCode === '+55') {
        if (cleaned.length <= 2) formatted = cleaned;
        else if (cleaned.length <= 7) formatted = cleaned.slice(0, 2) + ' ' + cleaned.slice(2);
        else formatted = cleaned.slice(0, 2) + ' ' + cleaned.slice(2, 7) + ' - ' + cleaned.slice(7);
      } else if (selectedCountry.dialCode === '+52') {
        if (cleaned.length <= 3) formatted = cleaned;
        else if (cleaned.length <= 6) formatted = cleaned.slice(0, 3) + ' ' + cleaned.slice(3);
        else formatted = cleaned.slice(0, 3) + ' ' + cleaned.slice(3, 6) + ' ' + cleaned.slice(6);
      } else {
        if (cleaned.length <= 3) formatted = cleaned;
        else if (cleaned.length <= 6) formatted = cleaned.slice(0, 3) + ' ' + cleaned.slice(3);
        else formatted = cleaned.slice(0, 3) + ' ' + cleaned.slice(3, 6) + ' ' + cleaned.slice(6);
      }
    }

    setPhone(formatted);
    validatePhone(formatted);
  };

  const validatePhone = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let minLength = 8;
    let maxLength = 10;

    if (selectedCountry.dialCode === '+55') {
      minLength = 10; maxLength = 11;
    } else if (selectedCountry.dialCode === '+52') {
      minLength = 10; maxLength = 10;
    } else if (selectedCountry.dialCode === '+504') {
      minLength = 8; maxLength = 8;
    } else if (selectedCountry.dialCode.startsWith('+1')) {
      minLength = 10; maxLength = 10;
    }

    if (text.length > 0 && cleaned.length < minLength) {
      setPhoneError(`Teléfono no válido (mín. ${minLength} dígitos)`);
    } else if (cleaned.length > maxLength) {
      setPhoneError(`Teléfono no válido (máx. ${maxLength} dígitos)`);
    } else if (text.length > 0 && cleaned.length >= minLength && cleaned.length <= maxLength) {
      setPhoneError('');
    } else {
      setPhoneError('');
    }
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setPhone('');
    setPhoneError('');
  };

  const handleRegister = () => {
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Correo no válido');
      return;
    }

    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length === 0 || phoneError !== '') {
      Alert.alert('Error', 'Teléfono no válido para ' + selectedCountry.name);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // 👉 Guardamos el usuario en Redux
      dispatch(setUser({ name: fullName, email }));

      Alert.alert(
        'Bien',
        `¡Cuenta creada exitosamente!\nPaís: ${selectedCountry.name}\nTeléfono: ${selectedCountry.dialCode} ${cleanedPhone}`
      );

      setIsLoggedIn(true);
      setLoading(false);
      navigation.navigate('Home');
    }, 1500);
  };

  const phonePlaceholder = getPhonePlaceholder(selectedCountry.dialCode);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.title}>Crear Cuenta</Text>
      <Text style={styles.subtitle}>Únete a HotelFind hoy</Text>

      <View style={styles.inputWrapper}>
        <CustomInput
          placeholder="Nombre Completo"
          value={fullName}
          onChangeText={setFullName}
          icon="person-outline"
          editable={!loading}
        />
      </View>

      <View style={styles.inputWrapper}>
        <CustomInput
          placeholder="Correo Electrónico"
          value={email}
          onChangeText={validateEmail}
          keyboardType="email-address"
          icon="mail-outline"
          editable={!loading}
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
      </View>

      <View style={styles.countrySection}>
        <Text style={styles.sectionLabel}>Selecciona tu país:</Text>
        <CountryPicker selectedCountry={selectedCountry} onSelectCountry={handleCountrySelect} />
      </View>

      <View style={styles.inputWrapper}>
        <View style={styles.phoneInputContainer}>
          <Text style={styles.dialCodeStatic}>{selectedCountry.dialCode}</Text>
          <TextInput
            style={styles.phoneInput}
            placeholder={phonePlaceholder.replace(selectedCountry.dialCode + ' ', '')}
            placeholderTextColor={colors.darkGray}
            value={phone}
            onChangeText={formatPhoneNumber}
            keyboardType="phone-pad"
            editable={!loading}
          />
        </View>
        {phoneError ? (
          <Text style={styles.errorText}>{phoneError}</Text>
        ) : phone.length > 0 ? (
          <Text style={styles.successText}>✓ Teléfono válido</Text>
        ) : null}
      </View>

      <View style={styles.passwordWrapper}>
        <View style={styles.passwordContainer}>
          <CustomInput
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            icon="lock-closed-outline"
            editable={!loading}
