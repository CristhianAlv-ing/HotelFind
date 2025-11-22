import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { CountryPicker } from '../components/CountryPicker';
import { colors } from '../theme/colors';
import { countries, Country, getPhonePlaceholder } from '../utils/countries';

const RegisterScreen: React.FC<any> = ({ navigation, route }) => {
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

    if (cleaned.length > maxLength) {
      return;
    }

    let formatted = '';

    if (cleaned.length > 0) {
      if (selectedCountry.dialCode === '+504') {
        if (cleaned.length <= 4) {
          formatted = cleaned;
        } else {
          formatted = cleaned.slice(0, 4) + ' - ' + cleaned.slice(4);
        }
      } else if (selectedCountry.dialCode === '+55') {
        if (cleaned.length <= 2) {
          formatted = cleaned;
        } else if (cleaned.length <= 7) {
          formatted = cleaned.slice(0, 2) + ' ' + cleaned.slice(2);
        } else {
          formatted = cleaned.slice(0, 2) + ' ' + cleaned.slice(2, 7) + ' - ' + cleaned.slice(7);
        }
      } else if (selectedCountry.dialCode === '+52') {
        if (cleaned.length <= 3) {
          formatted = cleaned;
        } else if (cleaned.length <= 6) {
          formatted = cleaned.slice(0, 3) + ' ' + cleaned.slice(3);
        } else {
          formatted = cleaned.slice(0, 3) + ' ' + cleaned.slice(3, 6) + ' ' + cleaned.slice(6);
        }
      } else {
        if (cleaned.length <= 3) {
          formatted = cleaned;
        } else if (cleaned.length <= 6) {
          formatted = cleaned.slice(0, 3) + ' ' + cleaned.slice(3);
        } else {
          formatted = cleaned.slice(0, 3) + ' ' + cleaned.slice(3, 6) + ' ' + cleaned.slice(6);
        }
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
      minLength = 10;
      maxLength = 11;
    } else if (selectedCountry.dialCode === '+52') {
      minLength = 10;
      maxLength = 10;
    } else if (selectedCountry.dialCode === '+504') {
      minLength = 8;
      maxLength = 8;
    } else if (selectedCountry.dialCode.startsWith('+1')) {
      minLength = 10;
      maxLength = 10;
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
      Alert.alert(
        'Éxito',
        `¡Cuenta creada exitosamente!\nPaís: ${selectedCountry.name}\nTeléfono: ${selectedCountry.dialCode} ${cleanedPhone}`
      );
      setIsLoggedIn(true);
      setLoading(false);
    }, 1500);
  };

  const phonePlaceholder = getPhonePlaceholder(selectedCountry.dialCode);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
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
        {emailError ? (
          <Text style={styles.errorText}>{emailError}</Text>
        ) : null}
      </View>

      <View style={styles.countrySection}>
        <Text style={styles.sectionLabel}>Selecciona tu país:</Text>
        <CountryPicker
          selectedCountry={selectedCountry}
          onSelectCountry={handleCountrySelect}
        />
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
            showIcon={false}
          />
          <TouchableOpacity
            style={styles.eyeIconContainer}
            onPress={() => setShowPassword(!showPassword)}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPassword ? 'eye' : 'eye-off'}
              size={22}
              color={colors.vibrantOrange}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.passwordWrapper}>
        <View style={styles.passwordContainer}>
          <CustomInput
            placeholder="Confirmar Contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            icon="lock-closed-outline"
            editable={!loading}
            showIcon={false}
          />
          <TouchableOpacity
            style={styles.eyeIconContainer}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showConfirmPassword ? 'eye' : 'eye-off'}
              size={22}
              color={colors.vibrantOrange}
            />
          </TouchableOpacity>
        </View>
      </View>

      <CustomButton
        title={loading ? 'Creando Cuenta...' : 'Registrarse'}
        onPress={handleRegister}
        disabled={loading || emailError !== '' || phoneError !== ''}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
          <Text style={styles.link}>Inicia Sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pureWhite,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.deepBlue,
    marginBottom: 8,
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: colors.darkGray,
    marginBottom: 30,
    textAlign: 'center',
  },
  inputWrapper: {
    marginBottom: 16,
  },
  countrySection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.deepBlue,
    marginBottom: 8,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.deepBlue,
    paddingHorizontal: 15,
  },
  dialCodeStatic: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.vibrantOrange,
    marginRight: 8,
    paddingVertical: 12,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.darkGray,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 15,
    fontWeight: '500',
  },
  successText: {
    color: '#34C759',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 15,
    fontWeight: '500',
  },
  passwordWrapper: {
    marginBottom: 16,
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: colors.darkGray,
    fontSize: 14,
  },
  link: {
    color: colors.vibrantOrange,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default RegisterScreen;