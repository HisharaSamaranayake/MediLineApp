import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function scheduleNotification(dateTime, description) {
  try {
    const settingsJSON = await AsyncStorage.getItem('settings');
    const settings = settingsJSON ? JSON.parse(settingsJSON) : {};
    const notificationsEnabled = settings.notificationsEnabled ?? true;
    const tone = settings.tone ?? 'Default';

    if (!notificationsEnabled) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Medicine Reminder',
        body: description || 'Time to take your medicine',
        sound: 'default',
      },
      trigger: dateTime,
    });
  } catch (error) {
    console.error('Failed to schedule notification:', error);
  }
}





