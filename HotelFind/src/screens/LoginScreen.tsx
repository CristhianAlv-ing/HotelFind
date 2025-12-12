// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
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
import { signIn } from '../services/supabase';
import { useNavigation } from '@react-navigation/native';

const LoginScreen: React.FC<any> = ({ route }) => {
  const dispatch = useDispatch();
  const { language } = useApp();
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const { setIsLoggedIn } = route.params || {};

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

      // Navegar al navigator padre (Root) para abrir la pila 'App'
      const parent = navigation.getParent?.();
      if (parent && typeof parent.navigate === 'function') {
        parent.navigate('App');
      } else {
        navigation.navigate('App');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Error', error?.message || 'Login failed');
    } finally {
      setLoading(false);
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
});

export default LoginScreen;