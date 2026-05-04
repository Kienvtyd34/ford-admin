import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  SafeAreaView, StatusBar, ActivityIndicator, RefreshControl,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const { width } = Dimensions.get('window');

const API_URL = 'https://ford-admin.onrender.com/api/bookings/my-history';

export default function DepositHistoryScreen() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchHistory = async () => {
    try {
      const userStr = await AsyncStorage.getItem('userInfo');
      if (!userStr) {
        router.replace('/login');
        return;
      }
      
      const userInfo = JSON.parse(userStr);
      const token = userInfo.token; // Lấy token từ userInfo lưu trong AsyncStorage

      const response = await axios.get(API_URL, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setBookings(response.data.data);
      }
    } catch (error: any) {
      console.error("Lỗi lấy lịch sử đặt cọc:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  // Hàm helper để hiển thị trạng thái thanh toán từ Backend
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Paid': 
        return { label: 'Đã thanh toán cọc', color: '#10b981', bg: '#ecfdf5', icon: 'check-circle' };
      case 'Failed': 
        return { label: 'Đã hủy/Hết hạn', color: '#ef4444', bg: '#fef2f2', icon: 'close-circle' };
      default: 
        return { label: 'Chờ thanh toán', color: '#f59e0b', bg: '#fffbeb', icon: 'clock-outline' };
    }
  };

  const renderBookingItem = ({ item }: any) => {
    const status = getStatusInfo(item.paymentStatus);
    const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount).replace('₫', '₫');
  };
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push(`/order-detail/${item._id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <MaterialCommunityIcons name={status.icon as any} size={14} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
          <Text style={styles.orderDate}>
            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
          </Text>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.carIconWrapper}>
            <MaterialCommunityIcons name="car-sports" size={30} color="#002B5B" />
          </View>
          <View style={styles.carInfo}>
            <Text style={styles.carName} numberOfLines={1}>
              {item.vehicle?.name || 'Tên xe đang cập nhật'}
            </Text>
            <Text style={styles.variantInfo}>
              Bản: {item.variantName} • Màu: {item.colorName}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          <View>
          <Text style={styles.priceLabel}>Số tiền đặt cọc</Text>
          <Text style={styles.priceValue}>
            {/* Lấy đúng field từ database, ví dụ: item.depositAmount */}
            {item.depositAmount ? formatCurrency(item.depositAmount) : 'Đang cập nhật'}
          </Text>
        </View>
          <View style={styles.detailLink}>
            <Text style={styles.detailText}>Xem chi tiết</Text>
            <Ionicons name="chevron-forward" size={16} color="#002B5B" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#002B5B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử đặt cọc</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#002B5B" />
          <Text style={{ marginTop: 10, color: '#64748B' }}>Đang tải lịch sử...</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderBookingItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002B5B" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="text-box-remove-outline" size={80} color="#cbd5e1" />
              <Text style={styles.emptyText}>Bạn chưa có lịch sử đặt cọc nào.</Text>
              <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/')}>
                <Text style={styles.shopBtnText}>Khám phá dòng xe Ford</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 15, 
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#002B5B' },
  backBtn: { padding: 5 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16 },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '800', marginLeft: 4 },
  orderDate: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },
  cardBody: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  carIconWrapper: { width: 50, height: 50, backgroundColor: '#F8FAFC', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  carInfo: { marginLeft: 12, flex: 1 },
  carName: { fontSize: 17, fontWeight: '800', color: '#1E293B' },
  variantInfo: { fontSize: 13, color: '#64748B', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 16 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 11, color: '#94a3b8', marginBottom: 2 },
  priceValue: { fontSize: 16, fontWeight: '900', color: '#E31837' },
  detailLink: { flexDirection: 'row', alignItems: 'center' },
  detailText: { fontSize: 13, fontWeight: '700', color: '#002B5B', marginRight: 4 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { marginTop: 16, color: '#64748B', fontSize: 16, fontWeight: '500' },
  shopBtn: { marginTop: 20, backgroundColor: '#002B5B', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  shopBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 }
});