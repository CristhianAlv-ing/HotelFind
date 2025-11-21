import React from 'react';
import { TextInput, View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface CustomInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
}

const CustomInput: React.FC<CustomInputProps> = ({ placeholder, value, onChangeText, secureTextEntry }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        placeholderTextColor={colors.DarkGray}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  input: {
    height: 50,
    borderColor: colors.DeepBlue,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: colors.PureWhite,
    color: colors.DarkGray,
  },
});

export default CustomInput;