import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { colors } from '../theme/colors';

const RegisterScreen: React.FC<any> = ({ navigation, route }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setIsLoggedIn } = route.params;

  const handleRegister = () => {
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    // Simulación de API call
    setTimeout(() => {
      Alert.alert('Success', 'Account created successfully! Welcome to HotelFind.');
      setIsLoggedIn(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join HotelFind today</Text>

      <CustomInput
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
        icon="person-outline"
        editable={!loading}
      />

      <CustomInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        icon="mail-outline"
        editable={!loading}
      />

      <CustomInput
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        icon="call-outline"
        editable={!loading}
      />

      <CustomInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        icon="lock-closed-outline"
        editable={!loading}
      />

      <CustomInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        icon="lock-closed-outline"
        editable={!loading}
      />

      <CustomButton
        title={loading ? 'Creating Account...' : 'Sign Up'}
        onPress={handleRegister}
        disabled={loading}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
          <Text style={styles.link}>Login</Text>
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

export default RegisterScreen;