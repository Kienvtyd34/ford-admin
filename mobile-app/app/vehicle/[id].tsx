import React, { useEffect, useState } from 'react';
import { 
  View, Text, Image, ScrollView, StyleSheet, 
  TouchableOpacity, ActivityIndicator, Dimensions, SafeAreaView,
  Alert 
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router'; 
import RenderHtml from 'react-native-render-html';
import api from '../../src/api/api';
import { Ionicons } from '@expo/vector-icons';
import BookingModal from '../bookingmodal';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function VehicleDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter(); 
  
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [isBookingVisible, setIsBookingVisible] = useState(false); // Đã giữ lại duy nhất 1 khai báo ở đây

  const handleBookingPress = async () => {
    try {
      const userInfoRaw = await AsyncStorage.getItem('userInfo'); 
      if (!userInfoRaw) {
        showLoginAlert();
        return;
      }

      const userInfo = JSON.parse(userInfoRaw);
      const token = userInfo.token; 

      if (!token) {
        showLoginAlert();
        return;
      }

      setIsBookingVisible(true);
    } catch (error) {
      console.error("Lỗi kiểm tra đăng nhập:", error);
      Alert.alert("Lỗi", "Không thể kiểm tra trạng thái đăng nhập");
    }
  };

  const showLoginAlert = () => {
    Alert.alert(
      "Yêu cầu đăng nhập",
      "Bạn cần đăng nhập để thực hiện đặt cọc xe.",
      [
        { text: "Để sau", style: "cancel" },
        { text: "Đăng nhập ngay", onPress: () => router.push('/login') }
      ]
    );
  };

  useEffect(() => {
    if (id) {
      api.get(`/vehicles/${id}`)
        .then(res => {
          const data = res.data.data || res.data;
          setVehicle(data);
          if (data.variants?.length > 0) setSelectedVariant(data.variants[0]);
          if (data.colorConfigs?.length > 0) setSelectedColor(data.colorConfigs[0]);
          setLoading(false);
        })
        .catch(err => {
          console.error("Lỗi tải chi tiết xe:", err);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#1e3a8a" />
      <Text style={{marginTop: 10, color: '#64748b'}}>Đang tải thông tin xe...</Text>
    </View>
  );

  if (!vehicle) return (
    <View style={styles.centered}>
      <Ionicons name="alert-circle-outline" size={50} color="#cbd5e1" />
      <Text style={{color: '#64748b', marginTop: 10}}>Không tìm thấy thông tin xe</Text>
    </View>
  );

  const tagsStyles = {
    body: { color: '#444', fontSize: 15, lineHeight: 22 },
    h2: { color: '#1e3a8a', fontSize: 18, marginTop: 15, fontWeight: 'bold' },
    b: { fontWeight: 'bold' },
    p: { marginBottom: 10 }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <Stack.Screen options={{ 
        headerTitle: vehicle.name,
        headerTintColor: '#1e3a8a',
        headerTitleStyle: { fontWeight: 'bold' }
      }} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.imageBox}>
          <Image 
            source={{ uri: selectedColor?.imageUrl || vehicle.imageUrl }} 
            style={styles.mainImage}
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.brandText}>{vehicle.brand?.toUpperCase()} • {vehicle.type}</Text>
          <Text style={styles.name}>{vehicle.name}</Text>
          
          <View style={styles.priceRow}>
              <Text style={styles.price}>
                  {selectedVariant?.variantPrice?.toLocaleString('vi-VN')} <Text style={{fontSize: 14}}>VNĐ</Text>
              </Text>
              <View style={styles.badgeStock}>
                <Text style={[styles.stockText, selectedVariant?.variantCount === 0 && {color: '#f97316'}]}>
                    {selectedVariant?.variantCount > 0 ? `Còn ${selectedVariant.variantCount} xe` : 'Liên hệ đặt trước'}
                </Text>
              </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Chọn phiên bản:</Text>
          <View style={styles.variantContainer}>
            {vehicle.variants?.map((v: any, index: number) => (
              <TouchableOpacity 
                key={`variant-${index}`}
                onPress={() => setSelectedVariant(v)}
                style={[styles.variantCard, selectedVariant?.variantName === v.variantName && styles.activeCard]}
              >
                <Text style={[styles.variantName, selectedVariant?.variantName === v.variantName && {color: '#1e3a8a'}]}>
                    {v.variantName}
                </Text>
                <Text style={styles.variantPriceSmall}>{v.variantPrice?.toLocaleString()} đ</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Màu sắc ngoại thất:</Text>
          <View style={styles.colorRow}>
            {vehicle.colorConfigs?.map((c: any, index: number) => (
              <TouchableOpacity 
                key={`color-${index}`}
                onPress={() => setSelectedColor(c)}
                style={[styles.colorCircle, selectedColor?.colorName === c.colorName && styles.activeColor]}
              >
                  <Text style={[styles.colorInitial, selectedColor?.colorName === c.colorName && {color: '#fff'}]}>
                    {c.colorName.charAt(0)}
                  </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.colorNameLabel}>Màu hiện tại: <Text style={{fontWeight: 'bold', color: '#333'}}>{selectedColor?.colorName}</Text></Text>

          <Text style={styles.sectionTitle}>Thông số kỹ thuật:</Text>
          <View style={styles.specTable}>
              <SpecItem label="Động cơ" value={vehicle.specs?.engine} />
              <SpecItem label="Hộp số" value={vehicle.specs?.transmission} />
              <SpecItem label="Nhiên liệu" value={vehicle.specs?.fuelType} />
              <SpecItem label="Công suất" value={vehicle.specs?.power} />
          </View>

          <View style={styles.descSection}>
              <Text style={styles.sectionTitle}>Giới thiệu chi tiết</Text>
              <View style={!showFullDesc ? styles.descHidden : null}>
                  <RenderHtml
                    contentWidth={width - 40}
                    source={{ html: vehicle.description || '<p>Chưa có mô tả chi tiết.</p>' }}
                    tagsStyles={tagsStyles as any}
                  />
              </View>
              <TouchableOpacity onPress={() => setShowFullDesc(!showFullDesc)} style={styles.btnReadMore}>
                  <Text style={styles.readMoreText}>{showFullDesc ? "Thu gọn ▲" : "Xem thêm mô tả chi tiết ▼"}</Text>
              </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.btnAction} onPress={handleBookingPress}>
            <Ionicons name="cart-outline" size={22} color="#fff" style={{marginRight: 10}} />
            <Text style={styles.btnText}>ĐẶT CỌC 2.000 VNĐ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BookingModal 
        visible={isBookingVisible}
        onClose={() => setIsBookingVisible(false)}
        car={vehicle}
        selectedVariant={selectedVariant}
        selectedColorName={selectedColor?.colorName}
      />
    </SafeAreaView>
  );
}

const SpecItem = ({ label, value }: any) => (
    <View style={styles.specRow}>
        <Text style={styles.specLabel}>{label}</Text>
        <Text style={styles.specValue}>{value || 'Đang cập nhật'}</Text>
    </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  imageBox: { backgroundColor: '#f8fafc', height: 280, justifyContent: 'center', alignItems: 'center' },
  mainImage: { width: '100%', height: '100%', resizeMode: 'contain' },
  content: { padding: 20 },
  brandText: { fontSize: 12, color: '#94a3b8', fontWeight: 'bold', letterSpacing: 0.5 },
  name: { fontSize: 28, fontWeight: '900', color: '#1e3a8a', marginVertical: 5 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  price: { fontSize: 24, color: '#dc2626', fontWeight: '900' },
  badgeStock: { backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  stockText: { fontSize: 11, color: '#16a34a', fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 15, color: '#1e293b' },
  variantContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 },
  variantCard: { width: '48%', padding: 15, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12 },
  activeCard: { borderColor: '#1e3a8a', backgroundColor: '#eff6ff', borderWidth: 2 },
  variantName: { fontWeight: 'bold', fontSize: 14, color: '#334155' },
  variantPriceSmall: { fontSize: 12, color: '#64748b', marginTop: 4 },
  colorRow: { flexDirection: 'row', gap: 12 },
  colorCircle: { 
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#f1f5f9', 
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' 
  },
  activeColor: { borderColor: '#1e3a8a', backgroundColor: '#1e3a8a', borderWidth: 2 },
  colorInitial: { fontWeight: 'bold', color: '#1e3a8a' },
  colorNameLabel: { marginTop: 12, color: '#64748b', fontSize: 13, marginBottom: 25 },
  specTable: { backgroundColor: '#f8fafc', borderRadius: 16, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: '#f1f5f9' },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  specLabel: { color: '#64748b', fontSize: 14 },
  specValue: { fontWeight: '700', fontSize: 14, color: '#1e293b' },
  descSection: { marginBottom: 30 },
  descHidden: { height: 180, overflow: 'hidden' },
  btnReadMore: { marginTop: 10, alignItems: 'center', paddingVertical: 12, backgroundColor: '#f8fafc', borderRadius: 8 },
  readMoreText: { color: '#1e3a8a', fontWeight: 'bold', fontSize: 13 },
  btnAction: { backgroundColor: '#1e3a8a', padding: 18, borderRadius: 16, alignItems: 'center', marginBottom: 40, flexDirection: 'row', justifyContent: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '900' }
});