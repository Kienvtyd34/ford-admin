import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Modal, TouchableOpacity, 
  ScrollView, TextInput, ActivityIndicator, Image, Alert,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../src/api/api';

const { width } = Dimensions.get('window');

const BANK_CONFIG = {
  BANK_ID: "MB", 
  ACCOUNT_NO: "027204010314", 
  ACCOUNT_NAME: "NGUYEN DUC KIEN",
  AMOUNT: 2000 
};

export default function BookingModal({ car, visible, onClose, selectedVariant, selectedColorName }) {
  const [bookingData, setBookingData] = useState({ variantName: "", colorName: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<any>(null);

  useEffect(() => {
    if (car && visible) {
      setBookingData({
        variantName: selectedVariant?.variantName || car.variants?.[0]?.variantName || "",
        colorName: selectedColorName || car.colorConfigs?.[0]?.colorName || "",
        notes: ""
      });
      setCreatedBooking(null);
    }
  }, [car, visible]);

  useEffect(() => {
    let interval: any;
    if (createdBooking && createdBooking.paymentStatus === 'Pending') {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/bookings/${createdBooking._id}`);
          if (res.data.data.paymentStatus === 'Paid') {
            setCreatedBooking(res.data.data);
            clearInterval(interval);
          }
        } catch (err) {
          console.log("Đang kiểm tra thanh toán...");
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [createdBooking]);

  const handleSubmit = async () => {
    setLoading(true);
    const payload = {
      vehicleId: car._id,
      variantName: bookingData.variantName,
      colorName: bookingData.colorName,
      notes: bookingData.notes,
      depositAmount: BANK_CONFIG.AMOUNT 
    };

    try {
      // API này giờ đã tự động kèm Token nhờ vào api.js interceptor
      const res = await api.post('/bookings', payload);
      if (res.data.success) {
        setCreatedBooking(res.data.data);
      }
    } catch (err: any) {
      console.error("Lỗi Server:", err.response?.data); 
      Alert.alert("Lỗi", err.response?.data?.message || "Không thể tạo đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  if (!car) return null;

  const renderPaymentStep = () => {
    const shortId = String(createdBooking._id).slice(-10).toUpperCase(); 
    const description = `DATCOC ${shortId}`;
    const qrUrl = `https://img.vietqr.io/image/${BANK_CONFIG.BANK_ID}-${BANK_CONFIG.ACCOUNT_NO}-qr_only.png?amount=${BANK_CONFIG.AMOUNT}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(BANK_CONFIG.ACCOUNT_NAME)}`;

    return (
      <View style={styles.paymentContainer}>
        <Text style={styles.qrTitle}>QUÉT MÃ ĐẶT CỌC</Text>
        <Text style={styles.qrSubtitle}>HỆ THỐNG TỰ ĐỘNG XÁC NHẬN KHI NHẬN TIỀN</Text>
        <View style={styles.qrWrapper}>
          <Image source={{ uri: qrUrl }} style={styles.qrImage} />
          <View style={styles.bankInfoContainer}>
             <Text style={styles.bankName}>{BANK_CONFIG.ACCOUNT_NAME}</Text>
             <Text style={styles.bankNo}>{BANK_CONFIG.ACCOUNT_NO}</Text>
          </View>
        </View>
        <View style={styles.waitingBadge}>
          <ActivityIndicator size="small" color="#002B5B" />
          <Text style={styles.waitingText}>ĐANG CHỜ XÁC NHẬN GIAO DỊCH...</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>NỘI DUNG CHUYỂN KHOẢN (BẮT BUỘC):</Text>
          <View style={styles.copyBox}>
            <Text style={styles.infoValue}>{description}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.btnSecondary}>
          <Text style={styles.btnSecondaryText}>HỦY VÀ QUAY LẠI</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSuccessStep = () => (
    <View style={styles.successContainer}>
      <View style={styles.iconCircle}>
        <Ionicons name="checkmark-sharp" size={50} color="#10b981" />
      </View>
      <Text style={styles.successTitle}>ĐẶT CỌC THÀNH CÔNG</Text>
      <Text style={styles.successSub}>Cảm ơn bạn! Đơn hàng đã được xác nhận.</Text>
      <View style={styles.receiptCard}>
        <View style={styles.receiptRow}>
          <Text style={styles.receiptLabel}>Mã đơn hàng:</Text>
          <Text style={styles.receiptValue}>#{createdBooking._id.slice(-8).toUpperCase()}</Text>
        </View>
        <View style={styles.receiptRow}>
          <Text style={styles.receiptLabel}>Số tiền:</Text>
          <Text style={[styles.receiptValue, { color: '#E31837' }]}>
            {BANK_CONFIG.AMOUNT.toLocaleString()} ₫
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={onClose} style={styles.btnPrimary}>
        <Text style={styles.btnPrimaryText}>HOÀN TẤT</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true} statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>XÁC NHẬN ĐẶT CỌC</Text>
              <Text style={styles.headerCarName}>{car.name}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {!createdBooking ? (
              <View style={styles.formContent}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>1. PHIÊN BẢN XE</Text>
                  <View style={styles.disabledInput}>
                    <Text style={styles.disabledInputText}>{bookingData.variantName}</Text>
                    <MaterialCommunityIcons name="lock" size={16} color="#cbd5e1" />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>2. MÀU SẮC ƯU TIÊN</Text>
                  <View style={styles.colorGrid}>
                    {car.colorConfigs?.map((color, i) => (
                      <TouchableOpacity 
                        key={i} 
                        style={[styles.colorItem, bookingData.colorName === color.colorName && styles.colorItemSelected]}
                        onPress={() => setBookingData({...bookingData, colorName: color.colorName})}
                      >
                        <Text style={[styles.colorText, bookingData.colorName === color.colorName && styles.colorTextSelected]}>
                          {color.colorName}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>3. GHI CHÚ (NẾU CÓ)</Text>
                  <TextInput 
                    style={styles.textInput}
                    placeholder="Ví dụ: Giao xe tại nhà, hỗ trợ đăng ký..."
                    multiline
                    numberOfLines={3}
                    value={bookingData.notes}
                    onChangeText={(text) => setBookingData({...bookingData, notes: text})}
                  />
                </View>

                <View style={styles.priceContainer}>
                  <View style={styles.divider} />
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>SỐ TIỀN ĐẶT CỌC:</Text>
                    <Text style={styles.priceValue}>{BANK_CONFIG.AMOUNT.toLocaleString()} ₫</Text>
                  </View>
                  <TouchableOpacity 
                    style={[styles.btnPrimary, loading && { opacity: 0.7 }]}
                    onPress={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>TIẾN HÀNH THANH TOÁN</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              createdBooking.paymentStatus === 'Paid' ? renderSuccessStep() : renderPaymentStep()
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, height: '85%', width: '100%', overflow: 'hidden' },
  header: { backgroundColor: '#002B5B', paddingHorizontal: 20, paddingVertical: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '900', fontStyle: 'italic', letterSpacing: 1 },
  headerCarName: { color: '#93C5FD', fontSize: 12, fontWeight: '700', marginTop: 2 },
  closeBtn: { padding: 5 },
  formContent: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 11, fontWeight: '800', color: '#64748B', marginBottom: 10, letterSpacing: 0.5 },
  disabledInput: { backgroundColor: '#F1F5F9', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  disabledInputText: { fontWeight: '700', color: '#1E293B' },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorItem: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#fff' },
  colorItemSelected: { borderColor: '#002B5B', backgroundColor: '#002B5B' },
  colorText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  colorTextSelected: { color: '#fff' },
  textInput: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 15, fontSize: 14, borderWidth: 1, borderColor: '#E2E8F0', textAlignVertical: 'top' },
  priceContainer: { marginTop: 10 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 20 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  priceLabel: { fontSize: 12, fontWeight: '800', color: '#1E293B' },
  priceValue: { fontSize: 22, fontWeight: '900', color: '#E31837' },
  btnPrimary: { backgroundColor: '#002B5B', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontWeight: '900', fontSize: 15 },
  paymentContainer: { padding: 25, alignItems: 'center' },
  qrTitle: { fontSize: 20, fontWeight: '900', color: '#002B5B', fontStyle: 'italic' },
  qrSubtitle: { fontSize: 10, color: '#94a3b8', fontWeight: 'bold', marginTop: 5, marginBottom: 25 },
  qrWrapper: { padding: 15, borderRadius: 24, borderStyle: 'dashed', borderWidth: 2, borderColor: '#BFDBFE', alignItems: 'center' },
  qrImage: { width: 220, height: 220 },
  bankInfoContainer: { marginTop: 15, alignItems: 'center' },
  bankName: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  bankNo: { fontSize: 18, fontWeight: 'bold', color: '#2563eb', fontStyle: 'italic' },
  waitingBadge: { flexDirection: 'row', backgroundColor: '#EFF6FF', padding: 12, borderRadius: 12, marginTop: 25, alignItems: 'center' },
  waitingText: { fontSize: 11, fontWeight: '800', color: '#002B5B', marginLeft: 10 },
  infoBox: { width: '100%', marginTop: 20 },
  infoLabel: { fontSize: 10, fontWeight: '800', color: '#854d0e', textAlign: 'center', marginBottom: 8 },
  copyBox: { backgroundColor: '#FEFCE8', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#FEF08A' },
  infoValue: { fontSize: 18, fontWeight: '900', color: '#002B5B', textAlign: 'center', letterSpacing: 1 },
  btnSecondary: { marginTop: 25, padding: 10 },
  btnSecondaryText: { color: '#94a3b8', fontWeight: '800', fontSize: 12 },
  successContainer: { padding: 40, alignItems: 'center' },
  iconCircle: { width: 100, height: 100, backgroundColor: '#DCFCE7', borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  successTitle: { fontSize: 22, fontWeight: '900', color: '#002B5B' },
  successSub: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 10 },
  receiptCard: { width: '100%', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 20, marginVertical: 30, borderWidth: 1, borderColor: '#E2E8F0' },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  receiptLabel: { color: '#64748B', fontWeight: '600' },
  receiptValue: { fontWeight: '800', color: '#1E293B' }
});