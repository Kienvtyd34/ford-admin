import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView,
  TouchableOpacity, StyleSheet,
  ActivityIndicator, SafeAreaView, Dimensions, Alert
} from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';
import RenderHtml from 'react-native-render-html';
import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../../src/api/api';
import BookingModal from '../bookingmodal';

const { width } = Dimensions.get('window');

export default function VehicleDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const [isBookingVisible, setIsBookingVisible] = useState(false);

  // ================= FETCH =================
  useEffect(() => {
    if (!id) return;

    api.get(`/vehicles/detail/${id}`)
      .then(res => {
        const data = res.data.data;

        setVehicle(data);

        const firstVariant = data?.variants?.[0];
        const firstColor = firstVariant?.colors?.[0];

        setSelectedVariant(firstVariant);
        setSelectedColor(firstColor);

        setActiveImage(
          firstColor?.images?.[0] ||
          data.imageUrl
        );

        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  }, [id]);

  // ================= BOOKING CHECK =================
  const handleBooking = async () => {
    const userInfo = await AsyncStorage.getItem('userInfo');

    if (!userInfo) {
      Alert.alert("Yêu cầu đăng nhập", "Bạn cần đăng nhập để đặt cọc");
      router.push('/login');
      return;
    }

    setIsBookingVisible(true);
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy xe</Text>
      </View>
    );
  }

  const variants = vehicle.variants || [];
  const colors = selectedVariant?.colors || [];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>

        {/* ================= IMAGE ================= */}
        <Image
          source={{ uri: activeImage || vehicle.imageUrl }}
          style={styles.image}
        />

        <View style={styles.container}>

          {/* ================= NAME ================= */}
          <Text style={styles.name}>{vehicle.name}</Text>
          <Text style={styles.brand}>
            {vehicle.brand} • {vehicle.type}
          </Text>

          {/* ================= PRICE ================= */}
          <Text style={styles.price}>
            {selectedVariant?.basePrice?.toLocaleString('vi-VN')} VNĐ
          </Text>

          {/* ================= VARIANT ================= */}
          <Text style={styles.title}>Phiên bản</Text>

          <View style={styles.row}>
            {variants.map((v: any) => (
              <TouchableOpacity
                key={v._id}
                onPress={() => {
                  setSelectedVariant(v);

                  const firstColor = v?.colors?.[0];
                  setSelectedColor(firstColor);

                  setActiveImage(
                    firstColor?.images?.[0] || vehicle.imageUrl
                  );
                }}
                style={[
                  styles.variant,
                  selectedVariant?._id === v._id && styles.active
                ]}
              >
                <Text>{v.variantName}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ================= COLOR ================= */}
          <Text style={styles.title}>Màu sắc</Text>

          <View style={styles.row}>
            {colors.map((c: any) => (
              <TouchableOpacity
                key={c._id}
                onPress={() => {
                  setSelectedColor(c);
                  setActiveImage(c?.images?.[0] || vehicle.imageUrl);
                }}
                style={[
                  styles.color,
                  selectedColor?._id === c._id && styles.colorActive
                ]}
              >
                <View style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: c.hexCode || '#ccc'
                }} />
              </TouchableOpacity>
            ))}
          </View>

          {selectedColor && (
            <Text style={styles.colorName}>
              Màu: {selectedColor.name}
            </Text>
          )}

          {/* ================= DESCRIPTION ================= */}
          <Text style={styles.sectionTitle}>Giới thiệu</Text>

          <RenderHtml
            contentWidth={width - 32}
            source={{
              html: vehicle.description || "<p>Đang cập nhật</p>"
            }}
          />

          {/* ================= SPECS ================= */}
          <Text style={styles.sectionTitle}>Thông số kỹ thuật</Text>

          <View style={styles.specBox}>
            <Spec label="Hộp số" value={selectedVariant?.transmission} />
            <Spec label="Dẫn động" value={selectedVariant?.driveTrain} />
            <Spec label="Nhiên liệu" value={selectedVariant?.fuelType} />
          </View>

          {/* ================= ACTION ================= */}
          <TouchableOpacity
            style={styles.btn}
            onPress={handleBooking}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
              ĐẶT CỌC 2.000₫
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnOutline}
            onPress={() =>
              router.push({
                pathname: '/test-drive',
                params: {
                  vehicleId: vehicle._id,
                  variantName: selectedVariant?.variantName
                }
              })
            }
          >
            <Text style={{ fontWeight: 'bold' }}>
              ĐĂNG KÝ LÁI THỬ
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* ================= BOOKING MODAL ================= */}
      <BookingModal
        visible={isBookingVisible}
        onClose={() => setIsBookingVisible(false)}
        car={vehicle}
        selectedVariant={selectedVariant}
        selectedColorName={selectedColor?.name}
      />
    </SafeAreaView>
  );
}

// ================= SPEC ITEM =================
const Spec = ({ label, value }: any) => (
  <View style={styles.specRow}>
    <Text style={{ color: '#666' }}>{label}</Text>
    <Text style={{ fontWeight: 'bold' }}>
      {value || 'N/A'}
    </Text>
  </View>
);

// ================= STYLE =================
const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  image: {
    width: '100%',
    height: 260,
    resizeMode: 'contain'
  },

  container: {
    padding: 16
  },

  name: {
    fontSize: 22,
    fontWeight: 'bold'
  },

  brand: {
    color: '#666'
  },

  price: {
    fontSize: 20,
    color: 'red',
    fontWeight: 'bold',
    marginVertical: 10
  },

  title: {
    marginTop: 20,
    fontWeight: 'bold'
  },

  sectionTitle: {
    marginTop: 25,
    fontWeight: 'bold',
    fontSize: 16
  },

  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10
  },

  variant: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10
  },

  active: {
    borderColor: '#000'
  },

  color: {
    padding: 8,
    marginRight: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd'
  },

  colorActive: {
    borderColor: '#000'
  },

  colorName: {
    marginTop: 8,
    fontWeight: '600'
  },

  specBox: {
    marginTop: 10
  },

  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6
  },

  btn: {
    backgroundColor: '#1e3a8a',
    padding: 14,
    borderRadius: 10,
    marginTop: 25,
    alignItems: 'center'
  },

  btnOutline: {
    borderWidth: 1,
    borderColor: '#1e3a8a',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center'
  }
});