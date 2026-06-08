import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, 
  Alert, ActivityIndicator, Dimensions, Linking 
} from 'react-native'; // Thêm Alert và Dimensions vào đây
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { getVehicles } from '../src/services/vehicleService';
import axios from 'axios';

const { width } = Dimensions.get('window');

export default function ContactScreen() {
  const params = useLocalSearchParams();
  
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    carName: params.name?.toString() || '',
    requestType: params.type === 'installment' ? 'Tư vấn trả góp' : 'Nhận báo giá',
    message: ''
  });

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await getVehicles();
        // Dựa trên Log bạn gửi: response có dạng { success: true, data: [...] }
        if (response && response.success && Array.isArray(response.data)) {
          setVehicles(response.data);
        } else if (Array.isArray(response)) {
          setVehicles(response);
        }
      } catch (err) {
        console.error("Lỗi API Vehicles:", err);
      } finally {
        setLoadingVehicles(false);
      }
    };
    fetchVehicles();
  }, []);

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.phone) {
      Alert.alert("Thông báo", "Vui lòng điền đủ Họ tên và Số điện thoại");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post('https://ford-admin.onrender.com/api/contacts/send', formData);
      if (response.data.success) {
        Alert.alert("Thành công", "Yêu cầu của bạn đã được gửi tới Ford Quế Võ!");
        setFormData({
          fullName: '', phone: '', email: '',
          carName: '', requestType: 'Nhận báo giá', message: ''
        });
      }
    } catch (error: any) {
      Alert.alert("Lỗi", "Không thể gửi yêu cầu. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ 
        headerTitle: 'Liên hệ Ford Quế Võ',
        headerStyle: { backgroundColor: '#002B5B' },
        headerTintColor: '#fff',
      }} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.webBanner}>
          <Text style={styles.bannerSub}>HỖ TRỢ TƯ VẤN & ĐĂNG KÝ LÁI THỬ</Text>
          <Text style={styles.bannerTitle}>FORD QUẾ VÕ</Text>
        </View>

        <View style={styles.requestTypeRow}>
          {['Nhận báo giá', 'Tư vấn trả góp'].map((type) => (
            <TouchableOpacity 
              key={type} 
              style={styles.radioItem}
              onPress={() => setFormData({...formData, requestType: type})}
            >
              <View style={[styles.radioOuter, formData.requestType === type && styles.radioOuterActive]}>
                {formData.requestType === type && <View style={styles.radioInner} />}
              </View>
              <Text style={[styles.radioLabel, formData.requestType === type && styles.radioLabelActive]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.formPadding}>
          <WebInput 
            label="HỌ VÀ TÊN *" 
            value={formData.fullName}
            onChangeText={(val: string) => setFormData({...formData, fullName: val})}
          />

          <WebInput 
            label="SỐ ĐIỆN THOẠI *" 
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(val: string) => setFormData({...formData, phone: val})}
          />

          <View style={styles.pickerSection}>
            <Text style={styles.pickerLabel}>DÒNG XE QUAN TÂM</Text>
            <View style={styles.pickerBorder}>
              {loadingVehicles ? (
                <ActivityIndicator style={{ padding: 10 }} />
              ) : (
                <Picker
                  selectedValue={formData.carName}
                  onValueChange={(itemValue) => setFormData({...formData, carName: itemValue})}
                  dropdownIconColor="#002B5B"
                  mode="dropdown" // Thêm chế độ dropdown để dễ nhìn hơn trên Android
                >
                  <Picker.Item label="--- Chọn mẫu xe ---" value="" color="#94a3b8" />
                  {vehicles.map((v) => (
                    <Picker.Item 
                      key={v._id} 
                      label={v.name} 
                      value={v.name} 
                      color="#000000" // Ép màu chữ đen để không bị trùng nền
                    />
                  ))}
                </Picker>
              )}
            </View>
          </View>

          <View style={styles.textAreaSection}>
            <Text style={styles.pickerLabel}>LỜI NHẮN</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Quý khách có yêu cầu gì thêm?"
              multiline
              numberOfLines={4}
              value={formData.message}
              onChangeText={(val) => setFormData({...formData, message: val})}
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>GỬI YÊU CẦU NGAY</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Giữ nguyên WebInput và styles của bạn...
const WebInput = ({ label, ...props }: any) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput style={styles.textInput} {...props} />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  webBanner: { backgroundColor: '#002B5B', paddingVertical: 30, alignItems: 'center' },
  bannerSub: { color: '#60a5fa', fontSize: 10, fontWeight: 'bold' },
  bannerTitle: { color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 5 },
  requestTypeRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 15, backgroundColor: '#f1f5f9' },
  radioItem: { flexDirection: 'row', alignItems: 'center' },
  radioOuter: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#cbd5e1', marginRight: 5, justifyContent: 'center', alignItems: 'center' },
  radioOuterActive: { borderColor: '#dc2626' },
  radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#dc2626' },
  radioLabel: { fontSize: 11, color: '#64748b' },
  radioLabelActive: { color: '#dc2626', fontWeight: 'bold' },
  formPadding: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 11, fontWeight: 'bold', color: '#94a3b8', marginBottom: 5 },
  textInput: { borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingVertical: 8, fontSize: 16 },
  pickerSection: { marginBottom: 20 },
  pickerLabel: { fontSize: 11, fontWeight: 'bold', color: '#94a3b8', marginBottom: 8 },
  pickerBorder: { backgroundColor: '#f8fafc', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  textAreaSection: { marginBottom: 25 },
  textArea: { backgroundColor: '#f8fafc', borderRadius: 8, padding: 12, height: 80, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#dc2626', padding: 16, borderRadius: 8, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});