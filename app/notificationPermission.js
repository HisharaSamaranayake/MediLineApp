import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PERMISSION_KEY = 'notification_permission_requested';

export default function useNotificationPermission() {
  useEffect(() => {
    const requestPermission = async () => {
      const alreadyAsked = await AsyncStorage.getItem(PERMISSION_KEY);
      if (alreadyAsked === 'true') return;

      const { status } = await Notifications.getPermissionsAsync();

      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();

        if (newStatus === 'granted') {
          await AsyncStorage.mergeItem('settings', JSON.stringify({ notificationsEnabled: true }));
        } else {
          await AsyncStorage.mergeItem('settings', JSON.stringify({ notificationsEnabled: false }));
        }
      }

      await AsyncStorage.setItem(PERMISSION_KEY, 'true');
      alert('MediLine would like to send you reminders');
    };

    requestPermission();
  }, []);
}







