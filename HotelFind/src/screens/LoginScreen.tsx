// src/screens/LoginScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { colors } from '../theme/colors';
import { useDispatch } from 'react-redux';
import { setUser } from '../slices/userReducer';
import backgroundImage from '../../assets/Login.png';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import { signIn, supabase } from '../services/supabase';
import { useNavigation } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';

const LoginScreen: React.FC<any> = ({ route }) => {
  const dispatch = useDispatch();
  const { language } = useApp();
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const [bioAvailable, setBioAvailable] = useState(false);
  const [emailError, setEmailError] = useState('');
  const { setIsLoggedIn } = route.params || {};

  useEffect(() => {
    const checkBio = async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setBioAvailable(Boolean(hasHardware && enrolled));
      } catch (err) {
        console.warn('Biometric check failed', err);
        setBioAvailable(false);
      }
    };
    checkBio();
  }, []);

  const validateEmail = (text: string) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (text.length > 0 && !emailRegex.test(text)) {
      setEmailError(getTranslation(language, 'emailInvalid'));
    } else {
      setEmailError('');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', getTranslation(language, 'fillAllFields'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', getTranslation(language, 'emailInvalid'));
      return;
    }

    try {
      setLoading(true);
      const { user } = await signIn(email, password);
      if (!user) {
        throw new Error('No user returned from signIn');
      }

      dispatch(setUser({ name: (user.user_metadata?.name as string) || user.email || 'User', email: user.email || '' }));

      Alert.alert(getTranslation(language, 'login'), getTranslation(language, 'loginSuccess'));
      if (typeof setIsLoggedIn === 'function') setIsLoggedIn(true);

      // La bandera isLoggedIn levantará MainTabs en el contenedor raíz; no es necesario navegar aquí.
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Error', error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!bioAvailable) {
      Alert.alert(getTranslation(language, 'error') || 'Error', getTranslation(language, 'biometricUnavailable') || 'La autenticación biométrica no está disponible');
      return;
    }

    try {
      setBioLoading(true);
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: getTranslation(language, 'biometricLogin') || 'Ingresar con huella',
        fallbackLabel: getTranslation(language, 'login') || 'Login',
      });

      if (!result.success) {
        Alert.alert(getTranslation(language, 'error') || 'Error', getTranslation(language, 'biometricFailed') || 'No se pudo autenticar con huella');
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      const session = data?.session;
      const user = session?.user;

      if (!session || !user) {
        Alert.alert(getTranslation(language, 'error') || 'Error', getTranslation(language, 'biometricNoSession') || 'Inicia con correo y contraseña primero');
        return;
      }

      dispatch(setUser({ name: (user.user_metadata?.name as string) || user.email || 'User', email: user.email || '' }));
      Alert.alert(getTranslation(language, 'login'), getTranslation(language, 'loginSuccess'));
      if (typeof setIsLoggedIn === 'function') setIsLoggedIn(true);

      // La bandera isLoggedIn levantará MainTabs en el contenedor raíz; no es necesario navegar aquí.
    } catch (error: any) {
      console.error('Biometric login error:', error);
      Alert.alert(getTranslation(language, 'error') || 'Error', getTranslation(language, 'biometricFailed') || 'No se pudo autenticar con huella');
    } finally {
      setBioLoading(false);
    }
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>
        <Text style={styles.title}>{getTranslation(language, 'hotelFindTitle') || 'HotelFind'}</Text>
        <Text style={styles.subtitle}>{getTranslation(language, 'joinHotelFind')}</Text>

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

        {bioAvailable ? (
          <TouchableOpacity style={styles.bioButton} onPress={handleBiometricLogin} disabled={bioLoading || loading} activeOpacity={0.85}>
            <Ionicons name="finger-print" size={20} color={colors.deepBlue} style={{ marginRight: 8 }} />
            <Text style={styles.bioText}>{bioLoading ? (getTranslation(language, 'loggingIn') || 'Autenticando...') : (getTranslation(language, 'biometricLogin') || 'Ingresar con huella')}</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.footer}>
          <Text style={styles.footerText}>{getTranslation(language, 'noAccount')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={loading}>
            <Text style={styles.link}>{getTranslation(language, 'signUp')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.deepBlue,
    marginBottom: 8,
    textAlign: 'center',
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
    color: colors.darkGray,
    fontSize: 14,
  },
  link: {
    color: colors.vibrantOrange,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  bioButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.deepBlue,
    backgroundColor: 'rgba(58,82,137,0.08)',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  bioText: {
    color: colors.deepBlue,
    fontWeight: '700',
    fontSize: 15,
  },
});

export default LoginScreen;