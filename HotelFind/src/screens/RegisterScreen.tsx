import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { CountryPicker } from '../components/CountryPicker';
import { colors } from '../theme/colors';
import { countries, Country, getPhonePlaceholder } from '../utils/countries';
import { useDispatch } from 'react-redux';
import { setUser } from '../slices/userReducer';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';

const RegisterScreen: React.FC<any> = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { language } = useApp();

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
  const setIsLoggedIn = route?.params?.setIsLoggedIn;

  const validateEmail = (text: string) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (text.length > 0 && !emailRegex.test(text)) {
      setEmailError(getTranslation(language, 'emailInvalid'));
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
      setPhoneError(`${getTranslation(language, 'phoneInvalid')} (mín. ${minLength})`);
    } else if (cleaned.length > maxLength) {
      setPhoneError(`${getTranslation(language, 'phoneInvalid')} (máx. ${maxLength})`);
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
      Alert.alert('Error', getTranslation(language, 'fillAllFields'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', getTranslation(language, 'emailInvalid'));
      return;
    }

    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length === 0 || phoneError !== '') {
      Alert.alert('Error', `${getTranslation(language, 'phoneInvalid')} (${selectedCountry.name})`);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', getTranslation(language, 'passwordMismatch'));
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', getTranslation(language, 'passwordTooShort'));
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Guardamos el usuario en Redux
      dispatch(setUser({ name: fullName, email }));

      Alert.alert(
        getTranslation(language, 'accountCreated'),
        `${getTranslation(language, 'country')}: ${selectedCountry.name}\n${getTranslation(language, 'phone')}: ${selectedCountry.dialCode} ${cleanedPhone}`
      );

      if (typeof setIsLoggedIn === 'function') setIsLoggedIn(true);
      setLoading(false);
      navigation.navigate('Home');
    }, 1500);
  };

  const phonePlaceholder = getPhonePlaceholder(selectedCountry.dialCode);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.title}>{getTranslation(language, 'createAccount') || getTranslation(language, 'register')}</Text>
      <Text style={styles.subtitle}>{getTranslation(language, 'joinHotelFind')}</Text>

      <View style={styles.inputWrapper}>
        <CustomInput
          placeholder={getTranslation(language, 'fullName')}
          value={fullName}
          onChangeText={setFullName}
          icon="person-outline"
          editable={!loading}
        />
      </View>

      <View style={styles.inputWrapper}>
        <CustomInput
          placeholder={getTranslation(language, 'login')}
          value={email}
          onChangeText={validateEmail}
          keyboardType="email-address"
          icon="mail-outline"
          editable={!loading}
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
      </View>

      <View style={styles.countrySection}>
        <Text style={styles.sectionLabel}>{getTranslation(language, 'selectCountry')}</Text>
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
          <Text style={styles.successText}>{getTranslation(language, 'validPhone')}</Text>
        ) : null}
      </View>

      <View style={styles.passwordWrapper}>
        <View style={styles.passwordContainer}>
          <CustomInput
            placeholder={getTranslation(language, 'password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            icon="lock-closed-outline"
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(prev => !prev)}
            disabled={loading}
          >
            <Ionicons
              name={showPassword ? 'eye' : 'eye-off'}
              size={22}
              color={colors.deepBlue}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.passwordContainer, { marginTop: 12 }]}>
          <CustomInput
            placeholder={getTranslation(language, 'confirmPassword')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            icon="lock-closed-outline"
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowConfirmPassword(prev => !prev)}
            disabled={loading}
          >
            <Ionicons
              name={showConfirmPassword ? 'eye' : 'eye-off'}
              size={22}
              color={colors.deepBlue}
            />
          </TouchableOpacity>
        </View>
      </View>

      <CustomButton
        title={loading ? getTranslation(language, 'creatingAccount') : getTranslation(language, 'register')}
        onPress={handleRegister}
        disabled={loading}
      />

      <View style={styles.loginRow}>
        <Text style={styles.loginText}>{getTranslation(language, 'haveAccount')}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
          <Text style={styles.loginLink}>{getTranslation(language, 'login')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: colors.pureWhite,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.deepBlue,
    marginTop: 12,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 18,
  },
  inputWrapper: {
    marginBottom: 8,
  },
  countrySection: {
    marginBottom: 6,
  },
  sectionLabel: {
    fontSize: 14,
    color: colors.deepBlue,
    marginBottom: 8,
    fontWeight: '600',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.deepBlue,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  dialCodeStatic: {
    fontSize: 16,
    color: colors.deepBlue,
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.darkGray,
  },
  passwordWrapper: {
    marginTop: 12,
    marginBottom: 12,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 6,
  },
  errorText: {
    color: '#D9534F',
    marginTop: 8,
    fontSize: 13,
  },
  successText: {
    color: '#3CB371',
    marginTop: 8,
    fontSize: 13,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginText: {
    color: colors.darkGray,
  },
  loginLink: {
    color: colors.vibrantOrange,
    fontWeight: '600',
  },
});