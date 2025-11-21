import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { colors } from '../theme/colors';

const LoginScreen: React.FC<any> = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
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

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Correo no válido');
      return;
    }

    setLoading(true);
    // Simulación de API call
    setTimeout(() => {
      Alert.alert('Success', 'Login successful! Welcome back.');
      setIsLoggedIn(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HotelFind</Text>
      <Text style={styles.subtitle}>Welcome Back</Text>

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
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            icon="lock-closed-outline"
            editable={!loading}
            showIcon={false}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
            disabled={loading}
          >
            <Text style={styles.eyeText}>
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <CustomButton
        title={loading ? 'Logging in...' : 'Login'}
        onPress={handleLogin}
        disabled={loading || emailError !== ''}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={loading}>
          <Text style={styles.link}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pureWhite,
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
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 1,
  },
  eyeText: {
    fontSize: 20,
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
  },
});

export default LoginScreen;