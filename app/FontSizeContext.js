import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const FontSizeContext = createContext();

export const FontSizeProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState('Medium');

  useEffect(() => {
    const loadFontSize = async () => {
      try {
        const saved = await AsyncStorage.getItem('settings');
        if (saved) {
          const s = JSON.parse(saved);
          if (s.fontSize) setFontSize(s.fontSize);
        }
      } catch (e) {
        console.log('Error loading font size', e);
      }
    };
    loadFontSize();
  }, []);

  const changeFontSize = async (newSize) => {
    setFontSize(newSize);
    try {
      const saved = await AsyncStorage.getItem('settings');
      const s = saved ? JSON.parse(saved) : {};
      s.fontSize = newSize;
      await AsyncStorage.setItem('settings', JSON.stringify(s));
    } catch (e) {
      console.log('Error saving font size', e);
    }
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, changeFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
};
