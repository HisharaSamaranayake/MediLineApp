// index.js (Welcome screen)
import React, { useEffect, useState } from 'react';
import { View, ImageBackground, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { useFonts, Geologica_700Bold } from '@expo-google-fonts/geologica';
import AppLoading from 'expo-app-loading';
import * as Animatable from 'react-native-animatable';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Geologica_700Bold,
  });

  const [text, setText] = useState('');
  const fullText = 'Welcome to MediLine';

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setText(fullText.substring(0, index + 1));
      index++;
      if (index === fullText.length) clearInterval(interval);
    }, 100);

    const timer = setTimeout(() => {
      router.replace('/form');
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [router]);

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <ImageBackground
      source={require('../assets/splash_bg.jpg')}
      style={styles.background}
    >
      <View style={styles.content}>
        <LottieView
          source={require('../assets/doctor_animation.json')}
          autoPlay
          loop
          style={styles.animation}
        />

        <Animatable.Text
          animation="fadeIn"
          duration={2000}
          style={[styles.welcomeText, { fontFamily: 'Geologica_700Bold' }]}
        >
          {text}
        </Animatable.Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  animation: {
    width: 400,   // increased from 300 to 400
    height: 400,  // increased from 300 to 400
    marginBottom: 6,
  },
  welcomeText: {
    fontSize: 28,  // increased from 18 to 28
    color: '#0A0A5F',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: 'bold',
  },
});












