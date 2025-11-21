import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { lightTheme, darkTheme } from '../theme/themes';
import { getTranslation } from '../utils/translations';

const LoginScreen: React.FC<any> = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const { setIsLoggedIn } = route.params;
  const { language, theme } = useApp();

  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  const validateEmail = (text: string) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (text.length > 0 && !emailRegex.test(text)) {
      setEmailError(getTranslation(language, 'emailInvalid') || 'Email inválido');
    } else {
      setEmailError('');
    }
  };

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', getTranslation(language, 'fillAllFields') || 'Por favor completa todos los campos');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', getTranslation(language, 'emailInvalid') || 'Email inválido');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      Alert.alert('Éxito', getTranslation(language, 'loginSuccess') || 'Login exitoso');
      setIsLoggedIn(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <Text style={[styles.title, { color: currentTheme.text }]}>HotelFind</Text>
      <Text style={[styles.subtitle, { color: currentTheme.secondaryText }]}>
        {getTranslation(language, 'welcomeBack')}
      </Text>

      <View style={styles.inputWrapper}>
        <CustomInput
          placeholder="Email"
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

      <View style={styles.passwordWrapper}>
        <View style={styles.passwordContainer}>
          <CustomInput
            placeholder={getTranslation(language, 'password')}
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

      <CustomButton
        title={loading ? getTranslation(language, 'loggingIn') : getTranslation(language, 'login')}
        onPress={handleLogin}
        disabled={loading || emailError !== ''}
      />

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: currentTheme.text }]}>
          {getTranslation(language, 'noAccount')}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={loading}>
          <Text style={styles.link}>{getTranslation(language, 'signUp')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  inputWrapper: {
    marginBottom: 16,
  },
  errorText: {
    color: '#FF3B30',
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
    fontSize: 14,
  },
  link: {
    color: colors.vibrantOrange,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LoginScreen;