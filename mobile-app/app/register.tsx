import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ActivityIndicator, Alert, SafeAreaView, ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!formData.fullName || !formData.email || !formData.password) {
      Alert.alert("Lỗi", "Vui lòng điền các trường bắt buộc!");
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        fullName: formData.fullName,
        username: formData.email,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      };

      const res = await axios.post('https://ford-admin.onrender.com/api/users/register', dataToSend);
      if (res.data.success) {
        Alert.alert("Thành công", "Đăng ký thành công! Hãy kiểm tra email.");
        router.push('/login');
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.response?.data?.message || "Lỗi đăng ký");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>TẠO TÀI KHOẢN</Text>
          <Text style={styles.subtitle}>Gia nhập hệ thống Ford Quế Võ</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>HỌ VÀ TÊN</Text>
          <TextInput
            style={styles.input}
            placeholder="Nguyễn Văn A"
            value={formData.fullName}
            onChangeText={(text) => setFormData({...formData, fullName: text})}
          />

          <Text style={styles.label}>EMAIL ĐĂNG NHẬP</Text>
          <TextInput
            style={styles.input}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
          />

          <Text style={styles.label}>SỐ ĐIỆN THOẠI</Text>
          <TextInput
            style={styles.input}
            placeholder="0987xxxxxx"
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(text) => setFormData({...formData, phone: text})}
          />

          <Text style={styles.label}>MẬT KHẨU</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            secureTextEntry
            value={formData.password}
            onChangeText={(text) => setFormData({...formData, password: text})}
          />

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>ĐĂNG KÝ NGAY</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backText}>Đã có tài khoản? <Text style={{color: '#1e3a8a', fontWeight: 'bold'}}>Đăng nhập</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 25, paddingVertical: 50 },
  header: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 26, fontWeight: '900', color: '#1e3a8a' },
  subtitle: { fontSize: 14, color: '#64748b', fontStyle: 'italic' },
  form: { backgroundColor: '#fff', padding: 20, borderRadius: 20, elevation: 4 },
  label: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', marginBottom: 8 },
  input: { backgroundColor: '#F8FAFC', padding: 14, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  button: { backgroundColor: '#dc2626', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonDisabled: { backgroundColor: '#94a3b8' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  backLink: { marginTop: 20, alignItems: 'center' },
  backText: { color: '#64748b', fontSize: 14 }
});