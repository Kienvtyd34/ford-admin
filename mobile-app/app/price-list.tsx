import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  Image, 
  ActivityIndicator 
} from 'react-native';
// Đảm bảo đường dẫn này đúng với cấu trúc thư mục của bạn
import { getVehicles } from '../src/services/vehicleService'; 
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Sử dụng thư viện chuẩn từ expo-router

export default function PriceListScreen() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Khởi tạo router để điều hướng
  
  useEffect(() => { 
    loadData(); 
  }, []);

  const loadData = async () => {
    try {
      const response = await getVehicles();
      // Kiểm tra dữ liệu trả về từ backend của bạn
      setVehicles(response.data || response);
    } catch (error) {
      console.error("Lỗi tải dữ liệu bảng giá:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderVehiclePriceCard = ({ item }: { item: any }) => (
    <View style={styles.vehicleGroup}>
      {/* Header: Tên xe và Loại xe */}
      <View style={styles.brandHeader}>
        <View style={styles.brandTitleRow}>
          <MaterialCommunityIcons name="car-info" size={22} color="#1e3a8a" />
          <Text style={styles.brandName}>{item.name?.toUpperCase()}</Text>
        </View>
        <Text style={styles.modelType}>{item.type} | Ford Quế Võ</Text>
      </View>

      {/* ẢNH XE LẤY TỪ DATABASE */}
      <View style={styles.imageContainer}>
        {item.imageUrl ? (
          <Image 
            source={{ uri: item.imageUrl }} 
            style={styles.vehicleImage} 
            resizeMode="contain" 
          />
        ) : (
          <View style={styles.placeholderImage}>
            <MaterialCommunityIcons name="image-off-outline" size={40} color="#cbd5e1" />
            <Text style={{color: '#94a3b8', fontSize: 12}}>Chưa có hình ảnh</Text>
          </View>
        )}
      </View>

      {/* Bảng giá chi tiết các phiên bản */}
      <View style={styles.priceTable}>
        {item.variants && item.variants.map((variant: any, index: number) => (
          <View 
            key={index} 
            style={[
              styles.priceRow, 
              index === item.variants.length - 1 && { borderBottomWidth: 0 }
            ]}
          >
            <View style={styles.variantInfo}>
              <Text style={styles.variantName}>{variant.variantName}</Text>
                <Text style={styles.engineText}>{variant.engine}</Text>
            </View>
            <View style={styles.priceInfo}>
              <Text style={styles.variantPrice}>
                {variant.variantPrice?.toLocaleString()} <Text style={styles.currency}>đ</Text>
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Nút hành động */}
      <View style={styles.actionRow}>
        <TouchableOpacity 
        style={[styles.actionBtn, styles.btnOutline]}
        onPress={() => {
            // Điều hướng sang trang contact và mở tab trả góp
            router.push({
            pathname: '/contact',
            params: { 
                type: 'installment', // Chỉ định tab trả góp
                name: item.name,      // Tên xe
                price: item.variants?.[0]?.variantPrice || 0 // Giá phiên bản đầu tiên
            }
            });
        }}
        >
        <Ionicons name="chatbubble-ellipses-outline" size={16} color="#1e3a8a" />
        <Text style={styles.btnTextOutline}>Tư vấn trả góp</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push(`/vehicle/${item._id}`)} // Đường dẫn động đến trang chi tiết
          style={[styles.actionBtn, styles.btnFull]}
        >
          <Ionicons name="list-circle-outline" size={18} color="#fff" />
          <Text style={styles.btnTextFull}>Thông Số Kỹ Thuật</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text style={{marginTop: 10, color: '#64748b'}}>Đang tải bảng giá...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>BẢNG GIÁ XE FORD</Text>
        <Text style={styles.headerUpdate}>Cập nhật mới nhất: 1/2026</Text>
      </View>

      <FlatList
        data={vehicles}
        keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
        renderItem={renderVehiclePriceCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View style={styles.footerInfo}>
            <Text style={styles.footerNote}>
              * Giá niêm yết đã bao gồm VAT (10%). Chưa bao gồm phí đăng ký, đăng kiểm và các ưu đãi tiền mặt từ Ford Quế Võ.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  headerBar: { backgroundColor: '#1e3a8a', paddingVertical: 20, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  headerUpdate: { color: '#cbd5e1', fontSize: 11, marginTop: 4 },
  listContent: { padding: 15 },
  
  vehicleGroup: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    marginBottom: 20, 
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }
  },
  brandHeader: { padding: 15, backgroundColor: '#F8FAFC', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  brandTitleRow: { flexDirection: 'row', alignItems: 'center' },
  brandName: { fontSize: 17, fontWeight: '800', color: '#1e3a8a', marginLeft: 8 },
  modelType: { fontSize: 12, color: '#64748b', marginLeft: 30, fontWeight: '600' },

  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10
  },
  vehicleImage: { width: '90%', height: '100%' },
  placeholderImage: { alignItems: 'center', justifyContent: 'center' },

  priceTable: { paddingHorizontal: 15, paddingBottom: 5 },
  priceRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F1F5F9' 
  },
  variantInfo: { flex: 1.5 },
  variantName: { fontSize: 14, fontWeight: '700', color: '#334155' },
  engineText: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  priceInfo: { flex: 1, alignItems: 'flex-end' },
  variantPrice: { fontSize: 15, fontWeight: '800', color: '#dc2626' },
  currency: { fontSize: 11 },

  actionRow: { flexDirection: 'row', padding: 12, gap: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  actionBtn: { flex: 1, flexDirection: 'row', height: 42, borderRadius: 8, justifyContent: 'center', alignItems: 'center', gap: 6 },
  btnOutline: { borderWidth: 1, borderColor: '#1e3a8a' },
  btnFull: { backgroundColor: '#1e3a8a' },
  btnTextOutline: { color: '#1e3a8a', fontSize: 12, fontWeight: '700' },
  btnTextFull: { color: '#fff', fontSize: 12, fontWeight: '700' },

  footerInfo: { padding: 20, marginBottom: 20 },
  footerNote: { fontSize: 12, color: '#64748b', textAlign: 'center', fontStyle: 'italic', lineHeight: 18 }
});