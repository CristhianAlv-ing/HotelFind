import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { countries, Country } from '../utils/countries';

interface CountryPickerProps {
  selectedCountry: Country;
  onSelectCountry: (country: Country) => void;
}

export const CountryPicker: React.FC<CountryPickerProps> = ({
  selectedCountry,
  onSelectCountry,
}) => {
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = countries.filter(
    country =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.dialCode.includes(searchQuery)
  );

  const handleSelectCountry = (country: Country) => {
    onSelectCountry(country);
    setVisible(false);
    setSearchQuery('');
  };

  return (
    <>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.flag}>{selectedCountry.flag}</Text>
        <View style={styles.buttonContent}>
          <Text style={styles.countryName}>{selectedCountry.name}</Text>
          <Text style={styles.dialCode}>{selectedCountry.dialCode}</Text>
        </View>
        <Ionicons name="chevron-down" size={20} color={colors.vibrantOrange} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona tu País</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons name="close" size={28} color={colors.deepBlue} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Buscar país o código..."
              placeholderTextColor={colors.darkGray}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.countryItem,
                    selectedCountry.code === item.code && styles.selectedItem,
                  ]}
                  onPress={() => handleSelectCountry(item)}
                >
                  <Text style={styles.itemFlag}>{item.flag}</Text>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemCode}>{item.code}</Text>
                  </View>
                  <Text style={styles.itemDialCode}>{item.dialCode}</Text>
                  {selectedCountry.code === item.code && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.vibrantOrange} />
                  )}
                </TouchableOpacity>
              )}
              scrollEnabled
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.deepBlue,
    marginBottom: 16,
  },
  buttonContent: {
    flex: 1,
    marginLeft: 10,
  },
  flag: {
    fontSize: 24,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGray,
  },
  dialCode: {
    fontSize: 12,
    color: colors.darkGray,
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.pureWhite,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.deepBlue,
  },
  searchInput: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: colors.deepBlue,
    fontSize: 16,
    color: colors.darkGray,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedItem: {
    backgroundColor: '#F9F9F9',
  },
  itemFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.darkGray,
  },
  itemCode: {
    fontSize: 12,
    color: colors.darkGray,
    marginTop: 2,
  },
  itemDialCode: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.vibrantOrange,
    marginRight: 8,
  },
});