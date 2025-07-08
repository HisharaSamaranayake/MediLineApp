// Only changes: removed permission logic from here (was redundant)
// And added correct toggle storage update
// Everything else kept intact as per your instruction

import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, TextInput, Switch, TouchableOpacity,
  StyleSheet, Alert, ActionSheetIOS
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';

import { FontSizeContext } from './FontSizeContext';
import beep1 from '../assets/sounds/beep1.wav';
import beep2 from '../assets/sounds/beep2.wav';
import beep3 from '../assets/sounds/beep3.mp3';

export default function SettingsScreen() {
  const router = useRouter();
  const { fontSize, changeFontSize } = useContext(FontSizeContext);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [tone, setTone] = useState('Default');
  const [sound, setSound] = useState();

  useEffect(() => {
    const loadData = async () => {
      try {
        const formData = await AsyncStorage.getItem('formData');
        if (formData) {
          const form = JSON.parse(formData);
          setName(form.name || '');
          setAge(form.age || '');
          setGender(form.gender || '');
        }

        const saved = await AsyncStorage.getItem('settings');
        if (saved) {
          const s = JSON.parse(saved);
          setNotificationsEnabled(s.notificationsEnabled ?? false);
          setTone(s.tone ?? 'Default');
        }
      } catch (e) {
        console.log('Error loading settings', e);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem(
          'settings',
          JSON.stringify({ notificationsEnabled, tone })
        );
      } catch (e) {
        console.log('Error saving settings', e);
      }
    };
    saveSettings();
  }, [notificationsEnabled, tone]);

  const toggleNotifications = async () => {
    setNotificationsEnabled(!notificationsEnabled);
    await AsyncStorage.mergeItem(
      'settings',
      JSON.stringify({ notificationsEnabled: !notificationsEnabled })
    );
  };

  const showFontSizePicker = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', 'Small', 'Medium', 'Big'],
        cancelButtonIndex: 0,
      },
      index => {
        if (index === 0) return;
        const sizes = ['Small', 'Medium', 'Big'];
        changeFontSize(sizes[index - 1]);
      }
    );
  };

  const showTonePicker = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', 'Tone 1', 'Tone 2', 'Tone 3'],
        cancelButtonIndex: 0,
      },
      async index => {
        if (index === 0) return;
        const tones = ['Tone 1', 'Tone 2', 'Tone 3'];
        const selected = tones[index - 1];
        setTone(selected);

        if (sound) {
          await sound.unloadAsync();
          setSound(null);
        }

        const soundObject = new Audio.Sound();
        try {
          const source = selected === 'Tone 1' ? beep1 : selected === 'Tone 2' ? beep2 : beep3;
          await soundObject.loadAsync(source);
          await soundObject.playAsync();
          setTimeout(async () => {
            await soundObject.stopAsync();
            await soundObject.unloadAsync();
            setSound(null);
          }, 1000);
          setSound(soundObject);
        } catch (error) {
          console.log('Error playing sound:', error);
        }
      }
    );
  };

  const fontSizes = { Small: 14, Medium: 18, Big: 24 };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <Text style={[styles.title, { fontSize: 24 }]}>Settings</Text>

      <TextInput style={[styles.input, { fontSize: fontSizes[fontSize] }]} placeholder="Name" value={name} editable={false} />
      <TextInput style={[styles.input, { fontSize: fontSizes[fontSize] }]} placeholder="Age" value={age} editable={false} />
      <TextInput style={[styles.input, { fontSize: fontSizes[fontSize] }]} placeholder="Gender" value={gender} editable={false} />

      <View style={styles.row}>
        <Text style={[styles.label, { fontSize: fontSizes[fontSize] }]}>Allow Notifications</Text>
        <Switch value={notificationsEnabled} onValueChange={toggleNotifications} />
      </View>

      <TouchableOpacity style={styles.input} onPress={showFontSizePicker}>
        <Text style={[styles.pickerText, { fontSize: fontSizes[fontSize] }]}>Font Size: {fontSize}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.input} onPress={showTonePicker}>
        <Text style={[styles.pickerText, { fontSize: fontSizes[fontSize] }]}>Reminder Tone: {tone}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20, backgroundColor:'#EAF6F6' },
  backButton: { marginBottom:10 },
  title: { fontWeight:'bold', marginBottom:20 },
  input: { borderWidth:1, borderColor:'#00AAAA', borderRadius:20, padding:12, marginBottom:15 },
  row: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:15 },
  label: {},
  pickerText: {},
});












