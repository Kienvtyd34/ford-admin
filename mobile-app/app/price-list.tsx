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

import { getVehicles } from '../src/services/vehicleService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PriceListScreen() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await getVehicles();

      // FIX RESPONSE
      const data =
        response?.data?.data ||
        response?.data ||
        response ||
        [];

      setVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Lỗi tải dữ liệu bảng giá:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  // FIX ẢNH ĐẠI DIỆN
  const getVehicleImage = (vehicle: any) => {
    if (
      vehicle?.images &&
      Array.isArray(vehicle.images) &&
      vehicle.images.length > 0
    ) {
      return vehicle.images[0];
    }

    if (vehicle?.imageUrl) {
      return vehicle.imageUrl;
    }

    return null;
  };

  // FIX GIÁ
  const getVehiclePrice = (vehicle: any) => {
    if (!vehicle?.variants || vehicle.variants.length === 0) {
      return null;
    }

    const firstVariant = vehicle.variants[0];

    return (
      firstVariant?.variantPrice ||
      firstVariant?.basePrice ||
      null
    );
  };

  const renderVehiclePriceCard = ({ item }: { item: any }) => {
    const imageUrl = getVehicleImage(item);

    return (
      <View style={styles.vehicleGroup}>
        {/* HEADER */}
        <View style={styles.brandHeader}>
          <View style={styles.brandTitleRow}>
            <MaterialCommunityIcons
              name="car-info"
              size={22}
              color="#1e3a8a"
            />

            <Text style={styles.brandName}>
              {item.name?.toUpperCase()}
            </Text>
          </View>

          <Text style={styles.modelType}>
            {item.type} | Ford Quế Võ
          </Text>
        </View>

        {/* ẢNH XE */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.vehicleImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <MaterialCommunityIcons
                name="image-off-outline"
                size={40}
                color="#cbd5e1"
              />

              <Text style={styles.placeholderText}>
                Chưa có hình ảnh
              </Text>
            </View>
          )}
        </View>

        {/* BẢNG GIÁ */}
        <View style={styles.priceTable}>
          {item?.variants && item.variants.length > 0 ? (
            item.variants.map((variant: any, index: number) => {
              const variantPrice =
                variant?.variantPrice ||
                variant?.basePrice;

              return (
                <View
                  key={index}
                  style={[
                    styles.priceRow,
                    index === item.variants.length - 1 && {
                      borderBottomWidth: 0,
                    },
                  ]}
                >
                  <View style={styles.variantInfo}>
                    <Text style={styles.variantName}>
                      {variant.variantName || 'Phiên bản'}
                    </Text>

                    <Text style={styles.engineText}>
                      {variant.engine ||
                        variant.transmission ||
                        'Ford Việt Nam'}
                    </Text>
                  </View>

                  <View style={styles.priceInfo}>
                    <Text style={styles.variantPrice}>
                      {variantPrice
                        ? `${variantPrice.toLocaleString(
                            'vi-VN'
                          )} đ`
                        : 'Liên hệ'}
                    </Text>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.priceRow}>
              <Text style={styles.variantName}>
                Chưa có dữ liệu phiên bản
              </Text>

              <Text style={styles.variantPrice}>
                Liên hệ
              </Text>
            </View>
          )}
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.btnOutline]}
            onPress={() => {
              router.push({
                pathname: '/contact',
                params: {
                  type: 'installment',
                  name: item.name,
                  price: getVehiclePrice(item) || 0,
                },
              });
            }}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={16}
              color="#1e3a8a"
            />

            <Text style={styles.btnTextOutline}>
              Tư vấn trả góp
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.btnFull]}
            onPress={() =>
              router.push(`/vehicle/${item._id}`)
            }
          >
            <Ionicons
              name="list-circle-outline"
              size={18}
              color="#fff"
            />

            <Text style={styles.btnTextFull}>
              Thông số kỹ thuật
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#1e3a8a"
        />

        <Text style={styles.loadingText}>
          Đang tải bảng giá...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1e3a8a"
      />

      {/* HEADER */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>
          BẢNG GIÁ XE FORD
        </Text>

        <Text style={styles.headerUpdate}>
          Cập nhật mới nhất
        </Text>
      </View>

      <FlatList
        data={vehicles}
        keyExtractor={(item, index) =>
          item?._id?.toString() || index.toString()
        }
        renderItem={renderVehiclePriceCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View style={styles.footerInfo}>
            <Text style={styles.footerNote}>
              * Giá niêm yết đã bao gồm VAT
              (10%). Chưa bao gồm phí đăng ký,
              đăng kiểm và các ưu đãi tại Ford
              Quế Võ.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  loadingText: {
    marginTop: 10,
    color: '#64748b',
    fontSize: 14,
  },

  headerBar: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 20,
    alignItems: 'center',
  },

  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },

  headerUpdate: {
    color: '#cbd5e1',
    fontSize: 11,
    marginTop: 4,
  },

  listContent: {
    padding: 15,
    paddingBottom: 30,
  },

  vehicleGroup: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 22,
    overflow: 'hidden',

    elevation: 4,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  brandHeader: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },

  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  brandName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1e3a8a',
    marginLeft: 8,
  },

  modelType: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 30,
    marginTop: 4,
    fontWeight: '600',
  },

  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
  },

  vehicleImage: {
    width: '92%',
    height: '100%',
  },

  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  placeholderText: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 6,
  },

  priceTable: {
    paddingHorizontal: 15,
    paddingBottom: 8,
  },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingVertical: 14,

    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  variantInfo: {
    flex: 1.5,
    paddingRight: 10,
  },

  variantName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
  },

  engineText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 3,
  },

  priceInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },

  variantPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: '#dc2626',
  },

  actionRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,

    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },

  actionBtn: {
    flex: 1,

    flexDirection: 'row',

    height: 44,

    borderRadius: 10,

    justifyContent: 'center',
    alignItems: 'center',

    gap: 6,
  },

  btnOutline: {
    borderWidth: 1.5,
    borderColor: '#1e3a8a',
  },

  btnFull: {
    backgroundColor: '#1e3a8a',
  },

  btnTextOutline: {
    color: '#1e3a8a',
    fontSize: 12,
    fontWeight: '800',
  },

  btnTextFull: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },

  footerInfo: {
    padding: 20,
    marginBottom: 20,
  },

  footerNote: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
});