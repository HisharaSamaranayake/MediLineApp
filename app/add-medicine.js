import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AddMedicine() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [units, setUnits] = useState('');
  const [unitType, setUnitType] = useState('');

  const colors = [
    '#F28B82', // Red
    '#FDD663', // Yellow
    '#81C995', // Green
    '#F6AD55', // Orange
    '#D291BC', // Purple
    '#F47373', // Coral
    '#A9A9A9', // Gray
    '#00BCD4', // Cyan
    '#FFB347', // Peach
    '#6A5ACD', // Slate Blue
    '#20B2AA', // Light Sea Green
    '#FF69B4', // Hot Pink
  ];

  const handleColorSelect = (color) => {
    router.push({
      pathname: '/days',
      params: {
        medicineName: name,  // <-- use medicineName here
        type,
        units,
        unitType,
        color,
      },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <Text style={styles.label}>Medicine Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter name"
        placeholderTextColor="#888"
      />

      <Text style={styles.label}>Type</Text>
      <View style={styles.pickerWrapper}>
        <RNPickerSelect
          onValueChange={setType}
          value={type}
          placeholder={{ label: 'Select type', value: null }}
          items={[
            { label: 'Tablet', value: 'Tablet' },
            { label: 'Injection', value: 'Injection' },
            { label: 'Syrup', value: 'Syrup' },
          ]}
          style={pickerSelectStyles}
          Icon={() => (
            <Ionicons
              name="chevron-down"
              size={20}
              color="black"
              style={styles.dropdownIcon}
            />
          )}
        />
      </View>

      <Text style={styles.label}>Units</Text>
      <View style={styles.unitsRow}>
        <TextInput
          style={[styles.input, { flex: 1, marginRight: 8 }]}
          value={units}
          onChangeText={setUnits}
          placeholder="Enter amount"
          placeholderTextColor="#888"
          keyboardType="numeric"
        />

        <View style={[styles.pickerWrapper, { flex: 1 }]}>
          <RNPickerSelect
            onValueChange={setUnitType}
            value={unitType}
            placeholder={{ label: 'Select unit', value: null }}
            items={[
              { label: 'mg', value: 'mg' },
              { label: 'ml', value: 'ml' },
            ]}
            style={pickerSelectStyles}
            Icon={() => (
              <Ionicons
                name="chevron-down"
                size={20}
                color="black"
                style={styles.dropdownIcon}
              />
            )}
          />
        </View>
      </View>

      <Text style={styles.label}>Pick a Colour</Text>
      <View style={styles.colorGrid}>
        {colors.map((color, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.colorPill, { backgroundColor: color }]}
            onPress={() => handleColorSelect(color)}
          >
            <View style={styles.pillLine} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF6F6',
    padding: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#008080',
    borderRadius: 20,
    padding: 12,
    backgroundColor: '#fff',
    marginTop: 4,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#008080',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#fff',
    marginTop: 4,
  },
  dropdownIcon: {
    top: 12,
    right: 10,
  },
  unitsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  colorPill: {
    width: 40,
    height: 90,
    borderRadius: 45,
    marginVertical: 10,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillLine: {
    width: '60%',
    height: 1,
    backgroundColor: '#333',
  },
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 8,
    color: 'black',
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 8,
    color: 'black',
  },
};














