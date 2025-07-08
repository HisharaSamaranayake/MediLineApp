import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const whenOptions = [
  'Before Meal',
  'After Meal',
  'Before Sleep',
  'Morning',
  'Evening',
];

export default function Days() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [selectedDays, setSelectedDays] = useState([]);
  const [when, setWhen] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleDay = (day) => {
    if (day === 'Everyday') {
      if (selectedDays.length === daysList.length) {
        setSelectedDays([]);
      } else {
        setSelectedDays([...daysList]);
      }
      return;
    }

    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const isSelected = (day) => {
    if (day === 'Everyday') return selectedDays.length === daysList.length;
    return selectedDays.includes(day);
  };

  // Correct navigation function
  const handleWhenSelect = (value) => {
    setWhen(value);
    setDropdownVisible(false);

    // Pass params including selectedDays and 'when' as strings
    router.push({
      pathname: '/date',
      params: {
        ...params,
        selectedDays: JSON.stringify(selectedDays),
        when: value,
      },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Repeat</Text>

      <TouchableOpacity
        style={[styles.dayButton, isSelected('Everyday') && styles.selectedButton]}
        onPress={() => toggleDay('Everyday')}
      >
        <Text style={styles.dayText}>Everyday</Text>
      </TouchableOpacity>

      {daysList.map((day) => (
        <TouchableOpacity
          key={day}
          style={[styles.dayButton, isSelected(day) && styles.selectedButton]}
          onPress={() => toggleDay(day)}
        >
          <Text style={styles.dayText}>{day}</Text>
        </TouchableOpacity>
      ))}

      <View style={styles.whenContainer}>
        <Text style={styles.whenLabel}>When</Text>

        <TouchableOpacity
          style={styles.dropdownToggle}
          onPress={() => setDropdownVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.dropdownText, !when && { color: '#aaa' }]}>
            {when || 'Select'}
          </Text>
        </TouchableOpacity>

        <Modal
          visible={dropdownVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setDropdownVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setDropdownVisible(false)}
            activeOpacity={1}
          >
            <View style={styles.dropdown}>
              <FlatList
                data={whenOptions}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => handleWhenSelect(item)}
                  >
                    <Text style={styles.dropdownItemText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    paddingHorizontal: 20,
    backgroundColor: '#F0FDFF',
    flexGrow: 1,
  },
  backArrow: {
    fontSize: 24,
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dayButton: {
    borderWidth: 1,
    borderColor: '#00A1A1',
    borderRadius: 25,
    paddingVertical: 6,
    paddingHorizontal: 25,
    marginVertical: 5,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  selectedButton: {
    backgroundColor: '#E0E0E0',
  },
  dayText: {
    fontSize: 18,
  },
  whenContainer: {
    marginTop: 30,
  },
  whenLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dropdownToggle: {
    borderWidth: 1,
    borderColor: '#00A1A1',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: 'white',
  },
  dropdownText: {
    fontSize: 16,
    color: '#000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    width: 220,
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#007B7B',
  },
});




