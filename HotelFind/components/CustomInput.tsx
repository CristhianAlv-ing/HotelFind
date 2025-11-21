import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface CustomInputProps extends TextInputProps {
  icon?: keyof typeof Ionicons.glyphMap;
  showIcon?: boolean;
}

export const CustomInput: React.FC<CustomInputProps> = ({ icon, showIcon = true, ...props }) => {
  return (
    <View style={styles.container}>
      {showIcon && icon && (
        <Ionicons name={icon} size={20} color={colors.vibrantOrange} />
      )}
      <TextInput
        style={[styles.input, { marginLeft: showIcon && icon ? 10 : 0 }]}
        placeholderTextColor={colors.darkGray}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: colors.deepBlue,
    paddingRight: 50,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.darkGray,
  },
});
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.deepBlue,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    fontSize: 16,
    color: colors.darkGray,
  },
});