import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import soundMap from './soundMap'; // Make sure soundMap.js is in the same folder as date.js

export default function DateScreen() {
  const router = useRouter();
  const { selectedDays, when, medicineName, type, units, unitType, color } = useLocalSearchParams();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isStartPickerVisible, setStartPickerVisible] = useState(false);
  const [isEndPickerVisible, setEndPickerVisible] = useState(false);

  const [times, setTimes] = useState(['']);
  const [currentEditingTimeIndex, setCurrentEditingTimeIndex] = useState(null);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);

  const [description, setDescription] = useState('');

  const handleStartConfirm = (date) => {
    setStartDate(date.toISOString().split('T')[0]);
    setStartPickerVisible(false);
  };

  const handleEndConfirm = (date) => {
    setEndDate(date.toISOString().split('T')[0]);
    setEndPickerVisible(false);
  };

  const handleTimeConfirm = (date) => {
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newTimes = [...times];
    newTimes[currentEditingTimeIndex] = timeString;
    setTimes(newTimes);
    setTimePickerVisible(false);
  };

  const addTimeInput = () => {
    setTimes([...times, '']);
  };

  // Notification scheduling function
  const scheduleNotifications = async (reminder) => {
    // Load user tone setting
    const settingsJSON = await AsyncStorage.getItem('settings');
    const settings = settingsJSON ? JSON.parse(settingsJSON) : {};
    const tone = settings.tone ?? 'Default';
    const soundName = soundMap[tone] || 'default';

    // Map day names to numbers for expo Notifications (1 = Sunday, 7 = Saturday)
    const dayNameToNumber = {
      Sunday: 1,
      Monday: 2,
      Tuesday: 3,
      Wednesday: 4,
      Thursday: 5,
      Friday: 6,
      Saturday: 7,
    };

    for (const day of reminder.selectedDays) {
      const weekday = dayNameToNumber[day];
      if (!weekday) continue;

      for (const timeStr of reminder.times) {
        if (!timeStr) continue;

        const [hour, minute] = timeStr.split(':').map(Number);

        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Time to take ${reminder.medicineName}`,
            body: `Take ${reminder.units}${reminder.unitType} of ${reminder.medicineName} (${reminder.when})`,
            sound: soundName,
          },
          trigger: {
            weekday,
            hour,
            minute,
            repeats: true,
          },
        });
      }
    }
  };

  const handleAdd = async () => {
    try {
      const reminder = {
        medicineName,
        type,
        units,
        unitType,
        color,
        selectedDays: JSON.parse(selectedDays || '[]'),
        when,
        startDate,
        endDate,
        times,
        description,
      };

      // Save reminder to AsyncStorage list
      const existingRemindersJson = await AsyncStorage.getItem('reminders');
      const existingReminders = existingRemindersJson ? JSON.parse(existingRemindersJson) : [];
      existingReminders.push(reminder);
      await AsyncStorage.setItem('reminders', JSON.stringify(existingReminders));

      // Schedule notifications
      await scheduleNotifications(reminder);

      router.push('/home');
    } catch (error) {
      console.error('Error saving reminder:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Duration</Text>

      <Text style={styles.label}>Start</Text>
      <TouchableOpacity onPress={() => setStartPickerVisible(true)}>
        <View style={styles.input}><Text>{startDate || 'Select Start Date'}</Text></View>
      </TouchableOpacity>

      <Text style={styles.label}>End</Text>
      <TouchableOpacity onPress={() => setEndPickerVisible(true)}>
        <View style={styles.input}><Text>{endDate || 'Select End Date'}</Text></View>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isStartPickerVisible}
        mode="date"
        onConfirm={handleStartConfirm}
        onCancel={() => setStartPickerVisible(false)}
      />

      <DateTimePickerModal
        isVisible={isEndPickerVisible}
        mode="date"
        onConfirm={handleEndConfirm}
        onCancel={() => setEndPickerVisible(false)}
      />

      <Text style={styles.subHeading}>Select Time</Text>

      {times.map((t, index) => (
        <TouchableOpacity
          key={index}
          style={styles.timeRow}
          onPress={() => {
            setCurrentEditingTimeIndex(index);
            setTimePickerVisible(true);
          }}
        >
          <View style={[styles.input, styles.timeInput]}>
            <Text>{t || 'Select Time'}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.addCircle} onPress={addTimeInput}>
        <Text style={styles.plus}>+</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleTimeConfirm}
        onCancel={() => setTimePickerVisible(false)}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.descriptionInput}
        value={description}
        onChangeText={setDescription}
        placeholder="Description"
        multiline
      />

      <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
        <Text style={styles.addText}>Add</Text>
      </TouchableOpacity>
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
  label: {
    fontSize: 18,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#00A1A1',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  subHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  timeRow: {
    marginBottom: 10,
  },
  timeInput: {
    paddingVertical: 10,
  },
  addCircle: {
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  plus: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#00A1A1',
    borderRadius: 20,
    padding: 15,
    height: 100,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  addButton: {
    borderWidth: 1,
    borderColor: '#00A1A1',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 25,
    alignSelf: 'center',
  },
  addText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});







