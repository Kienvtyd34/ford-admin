import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

export default function ChatbotScreen() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { id: '1', sender: 'bot', text: 'Xin chào 👋 Tôi là Ford AI Assistant' }
  ]);

  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userText = message;
    const newUserMsg = { id: Date.now().toString(), sender: 'user', text: userText };
    
    setMessages(prev => [...prev, newUserMsg]);
    setMessage("");
    setLoading(true);
    Keyboard.dismiss();

    try {
      const res = await axios.post("https://ford-admin.onrender.com/api/ai/chat", {
        message: userText,
        userId: "user_1",
      });

      let reply = res.data?.text || res.data?.reply || res.data?.message || "Không có phản hồi";
      
      if (typeof reply === "object") {
        reply = reply.text || JSON.stringify(reply);
      }

      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: String(reply) }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: '❌ Lỗi kết nối server' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚗 Ford AI Assistant</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        renderItem={({ item }) => (
          <View style={[styles.msgContainer, item.sender === 'user' ? styles.userMsg : styles.botMsg]}>
            <Text style={item.sender === 'user' ? styles.userText : styles.botText}>
              {item.text}
            </Text>
          </View>
        )}
        style={styles.chatBox}
      />

      {loading && <Text style={styles.loadingText}>🤖 Bot đang trả lời...</Text>}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn..."
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={loading}>
            <Text style={styles.sendBtnText}>Gửi</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { padding: 20, backgroundColor: '#2563eb', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  chatBox: { flex: 1, padding: 10 },
  msgContainer: { padding: 12, borderRadius: 18, marginVertical: 5, maxWidth: '80%' },
  userMsg: { alignSelf: 'flex-end', backgroundColor: '#2563eb' },
  botMsg: { alignSelf: 'flex-start', backgroundColor: '#e5e7eb' },
  userText: { color: '#fff' },
  botText: { color: '#000' },
  loadingText: { padding: 10, fontStyle: 'italic', color: '#666', textAlign: 'center' },
  inputArea: { flexDirection: 'row', padding: 15, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  input: { flex: 1, padding: 12, backgroundColor: '#f3f4f6', borderRadius: 25, marginRight: 10 },
  sendBtn: { backgroundColor: '#2563eb', padding: 12, borderRadius: 25, justifyContent: 'center', width: 60, alignItems: 'center' },
  sendBtnText: { color: '#fff', fontWeight: 'bold' }
});