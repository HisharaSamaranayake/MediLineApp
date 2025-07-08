import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';

import useNotificationPermission from './notificationPermission';  // Make sure path is correct

// Helper: get day name from date
function getDayName(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

// Helper: format date nicely
function formatToday(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export default function HomeScreen() {
  useNotificationPermission();  // Request notification permission once on first mount

  const router = useRouter();
  const [reminders, setReminders] = useState([]);
  const currentlyOpenSwipeable = useRef(null);

  useEffect(() => {
    loadReminders();
  }, []);

  // Load reminders and expand each time to separate reminders
  const loadReminders = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('reminders');
      let allReminders = jsonValue ? JSON.parse(jsonValue) : [];

      const todayName = getDayName(new Date());
      const todayDate = new Date().toISOString().split('T')[0];

      const filtered = [];

      allReminders.forEach(reminder => {
        if (!reminder.selectedDays || !Array.isArray(reminder.selectedDays)) return;

        if (!reminder.selectedDays.includes(todayName)) return;

        if (reminder.startDate && reminder.endDate) {
          if (!(todayDate >= reminder.startDate && todayDate <= reminder.endDate)) return;
        }

        if (Array.isArray(reminder.times) && reminder.times.length > 0) {
          reminder.times.forEach(time => {
            filtered.push({
              ...reminder,
              times: [time], // single time per expanded reminder
            });
          });
        } else {
          filtered.push(reminder);
        }
      });

      const updatedReminders = allReminders.filter(reminder => {
        if (!reminder.endDate) return true;
        return reminder.endDate >= todayDate;
      });

      if (updatedReminders.length !== allReminders.length) {
        await AsyncStorage.setItem('reminders', JSON.stringify(updatedReminders));
      }

      setReminders(filtered);
    } catch (error) {
      console.error('Failed to load reminders:', error);
    }
  };

  // Delete reminder by matching medicineName, when, startDate, and time
  const deleteReminder = async (indexToDelete) => {
    try {
      const jsonValue = await AsyncStorage.getItem('reminders');
      let allReminders = jsonValue ? JSON.parse(jsonValue) : [];

      const todayReminder = reminders[indexToDelete];
      if (!todayReminder) return;

      const originalIndex = allReminders.findIndex(r =>
        r.medicineName === todayReminder.medicineName &&
        r.when === todayReminder.when &&
        r.startDate === todayReminder.startDate
      );

      if (originalIndex === -1) return;

      const originalReminder = allReminders[originalIndex];

      if (Array.isArray(originalReminder.times)) {
        originalReminder.times = originalReminder.times.filter(t => t !== todayReminder.times[0]);

        if (originalReminder.times.length === 0) {
          allReminders.splice(originalIndex, 1);
        } else {
          allReminders[originalIndex] = originalReminder;
        }
      } else {
        allReminders.splice(originalIndex, 1);
      }

      await AsyncStorage.setItem('reminders', JSON.stringify(allReminders));
      loadReminders();
    } catch (error) {
      console.error('Failed to delete reminder:', error);
    }
  };

  const renderRightActions = (progress, dragX, index) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() =>
        Alert.alert(
          'Delete Reminder',
          'Are you sure you want to delete this reminder?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteReminder(index) },
          ]
        )
      }
    >
      <Ionicons name="trash-bin" size={24} color="white" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>
        {`Good ${
          new Date().getHours() < 12
            ? 'morning'
            : new Date().getHours() < 18
            ? 'evening'
            : 'night'
        }!`}
      </Text>

      <View style={styles.remindersContainer}>
        <Text style={styles.remindersHeader}>
          Today’s Reminders <Ionicons name="notifications-outline" size={20} />
        </Text>
        <Text style={styles.dateText}>{formatToday(new Date())}</Text>

        <ScrollView>
          {reminders.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 20, fontStyle: 'italic' }}>
              No reminders for today.
            </Text>
          ) : (
            reminders.map((reminder, index) => {
              const swipeableRef = React.createRef();

              const onSwipeableWillOpen = () => {
                if (
                  currentlyOpenSwipeable.current &&
                  currentlyOpenSwipeable.current !== swipeableRef.current
                ) {
                  currentlyOpenSwipeable.current.close();
                }
                currentlyOpenSwipeable.current = swipeableRef.current;
              };

              return (
                <Swipeable
                  key={index}
                  ref={swipeableRef}
                  onSwipeableWillOpen={onSwipeableWillOpen}
                  renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, index)}
                >
                  <View
                    style={[
                      styles.reminderCard,
                      { backgroundColor: reminder.color || '#DDD' },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.medicineName}>{reminder.medicineName}</Text>
                      <Text style={styles.medicineDetails}>
                        {reminder.type} — {reminder.units}
                        {reminder.unitType}
                      </Text>
                      <Text style={styles.medicineDetails}>When: {reminder.when}</Text>
                      {reminder.description ? (
                        <Text style={styles.medicineDetails}>{reminder.description}</Text>
                      ) : null}
                    </View>

                    <Text style={styles.timeText}>{reminder.times[0]}</Text>
                  </View>
                </Swipeable>
              );
            })
          )}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/add-medicine')}
      >
        <Ionicons name="add" size={30} color="black" />
      </TouchableOpacity>

      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push('/ai')}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={30} color="black" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push('/settings')}
        >
          <MaterialIcons name="settings" size={30} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF6F6',
    paddingTop: 40,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: 20,
    marginBottom: 16,
    color: '#333',
  },
  remindersContainer: {
    borderWidth: 1,
    borderColor: '#00AAAA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    minHeight: 350,
    maxHeight: 350, // restrict height to enable scrolling
  },
  remindersHeader: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
    flexDirection: 'row',
  },
  dateText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#333',
    marginBottom: 8,
  },
  reminderCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  medicineName: {
    fontWeight: 'bold',
    fontStyle: 'italic',
    fontSize: 16,
    color: '#000',
  },
  medicineDetails: {
    fontStyle: 'italic',
    color: '#000',
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
  },
  addButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#333',
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 16,
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 50,
  },
  iconButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    borderRadius: 16,
    marginVertical: 4,
  },
});





















