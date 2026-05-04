import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons'; // Đảm bảo đã có dòng này

export default function LoginScreen() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const API_URL = 'https://ford-admin.onrender.com/api/users/login';

  const handleLogin = async () => {
    if (!formData.username || !formData.password) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(API_URL, {
        username: formData.username,
        password: formData.password
      }, { timeout: 5000 });

      if (res.data.success) {
        const dataToStore = {
          token: res.data.token,
          user: res.data.user
        };
        await AsyncStorage.setItem('userInfo', JSON.stringify(dataToStore));
        Alert.alert("Thành công", `Chào mừng ${res.data.user.fullName}`);
        router.replace('/'); 
      }
    } catch (err: any) {
      let errorMsg = "Sai tên đăng nhập hoặc mật khẩu!";
      if (err.message.includes('Network Error')) {
        errorMsg = "Lỗi kết nối Server! Kiểm tra lại Wifi và Firewall máy tính.";
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      }
      Alert.alert("Lỗi đăng nhập", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* NÚT QUAY LẠI TRANG CHỦ */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.replace('/')}
      >
        <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
        <Text style={styles.backText}>Trang chủ</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.inner}>
          <View style={styles.header}>
            <Text style={styles.title}>ĐĂNG NHẬP</Text>
            <Text style={styles.subtitle}>Hệ thống Ford Quế Võ</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>TÊN ĐĂNG NHẬP (EMAIL)</Text>
            <TextInput
              style={styles.input}
              placeholder="user@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.username}
              onChangeText={(text) => setFormData({ ...formData, username: text.trim() })}
            />

            <Text style={styles.label}>MẬT KHẨU</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              secureTextEntry
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
            />

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>VÀO HỆ THỐNG</Text>}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.linkText}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  // STYLE CHO NÚT QUAY LẠI
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20, // Tùy chỉnh theo hệ điều hành
    left: 10,
    zIndex: 10,
  },
  backText: {
    fontSize: 16,
    color: '#1e3a8a',
    fontWeight: '600',
    marginLeft: 5,
  },
  inner: { flex: 1, justifyContent: 'center', padding: 25 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: '900', color: '#1e3a8a' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 5 },
  form: { backgroundColor: '#fff', padding: 20, borderRadius: 20, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10 },
  label: { fontSize: 10, fontWeight: 'bold', color: '#64748b', marginBottom: 8 },
  input: { backgroundColor: '#F1F5F9', padding: 15, borderRadius: 12, marginBottom: 20, fontSize: 16 },
  button: { backgroundColor: '#1e3a8a', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonDisabled: { backgroundColor: '#94a3b8' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  footerText: { color: '#64748b' },
  linkText: { color: '#dc2626', fontWeight: 'bold' }
});