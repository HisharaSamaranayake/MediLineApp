import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import useNotificationPermission from './notificationPermission'; // ✅ Hook added

export default function FormScreen() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const router = useRouter();

  useNotificationPermission(); // ✅ Triggers permission logic once

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const savedForm = await AsyncStorage.getItem('formData');
        if (savedForm) {
          const form = JSON.parse(savedForm);
          setName(form.name || '');
          setAge(form.age || '');
          setGender(form.gender || '');
        }
      } catch (e) {
        console.log('Failed to load form data', e);
      }
    };
    loadFormData();
  }, []);

  useEffect(() => {
    const saveFormData = async () => {
      try {
        const form = { name, age, gender };
        await AsyncStorage.setItem('formData', JSON.stringify(form));
      } catch (e) {
        console.log('Failed to save form data', e);
      }
    };
    saveFormData();
  }, [name, age, gender]);

  const handleGo = () => {
    Alert.alert('Info', `Name: ${name}\nAge: ${age}\nGender: ${gender}`, [
      {
        text: 'OK',
        onPress: () => router.push('/home'),
      }
    ]);
  };

  return (
    <ImageBackground
      source={require('../assets/splash_bg.jpg')}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your age"
          placeholderTextColor="#888"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Gender</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your gender"
          placeholderTextColor="#888"
          value={gender}
          onChangeText={setGender}
        />

        <TouchableOpacity style={styles.button} onPress={handleGo}>
          <Text style={styles.buttonText}>Go</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    padding: 20,
  },
  label: {
    fontSize: 22,
    color: '#333',
    marginBottom: 5,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#008080',
    borderRadius: 20,
    padding: 12,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 30,
    backgroundColor: '#008080',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});



