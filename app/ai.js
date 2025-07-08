import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import LottieView from 'lottie-react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const BACKEND_URL = 'http://172.20.10.2:3000';

export default function AiScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const animationRef = useRef(null);
  const router = useRouter();

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = { sender: 'user', text: inputText };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    const botMessage = { sender: 'bot', text: '...' };
    setMessages((prev) => [...prev, botMessage]);

    try {
      const response = await axios.post(`${BACKEND_URL}/chat`, {
        message: inputText,
      });

      const botReply = { sender: 'bot', text: response.data.reply };
      setMessages((prev) => [...prev.slice(0, -1), botReply]);
    } catch (err) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { sender: 'bot', text: 'Error getting response.' },
      ]);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;

      const userMessage = { sender: 'user', text: 'Uploaded an image.', image: imageUri };
      setMessages((prev) => [...prev, userMessage]);

      const analyzingMessage = { sender: 'bot', text: 'Analyzing tablet image...' };
      setMessages((prev) => [...prev, analyzingMessage]);

      try {
        const formData = new FormData();
        formData.append('file', {
          uri: imageUri,
          name: 'tablet.jpg',
          type: 'image/jpeg',
        });

        const response = await axios.post(`${BACKEND_URL}/analyze`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const botReply = { sender: 'bot', text: response.data.result };
        setMessages((prev) => [...prev.slice(0, -1), botReply]);
      } catch (err) {
        setMessages((prev) => [...prev.slice(0, -1), { sender: 'bot', text: 'Error analyzing image.' }]);
      }
    }
  };

  const renderItem = ({ item }) => {
    const isBot = item.sender === 'bot';

    return (
      <View style={[styles.messageRow, isBot ? styles.leftAlign : styles.rightAlign]}>
        {isBot && (
          <View style={styles.avatarContainer}>
            <LottieView
              ref={animationRef}
              source={require('../assets/doctor.json')}
              autoPlay
              loop
              style={styles.lottieAvatar}
            />
          </View>
        )}
        <View style={[styles.messageBubble, isBot ? styles.botBubble : styles.userBubble]}>
          {item.image && <Image source={{ uri: item.image }} style={styles.image} />}
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.outlineWrapper}>
        {/* Back Button */}
        <View style={styles.backButtonContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.chatContainer}
        />

        <View style={styles.inputSection}>
          <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
            <Ionicons name="camera" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={styles.inputBox}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              style={styles.textInput}
              placeholderTextColor="#666"
              multiline
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eafcff',
    padding: 12,
  },
  outlineWrapper: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#add8e6',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#eafcff',
  },
  backButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#b2e5f1',
    backgroundColor: '#e0f7ff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  leftAlign: {
    justifyContent: 'flex-start',
  },
  rightAlign: {
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
  },
  avatarContainer: {
    marginRight: 8,
  },
  lottieAvatar: {
    width: 40,
    height: 40,
    marginTop: -10,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 20,
    borderTopLeftRadius: 4,
  },
  botBubble: {
    backgroundColor: '#f0f4ff',
  },
  userBubble: {
    backgroundColor: '#c2f2e9',
  },
  messageText: {
    color: '#000',
    fontSize: 15,
  },
  image: {
    width: 130,
    height: 130,
    borderRadius: 10,
    marginBottom: 6,
  },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopColor: '#b2e5f1',
    borderTopWidth: 1,
    backgroundColor: '#e0f7ff',
  },
  inputBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  textInput: {
    fontSize: 15,
    color: '#333',
    minHeight: 40,
    maxHeight: 80,
  },
  iconButton: {
    backgroundColor: '#00bcd4',
    padding: 10,
    borderRadius: 20,
  },
  sendButton: {
    backgroundColor: '#00bcd4',
    padding: 10,
    borderRadius: 20,
  },
});

















