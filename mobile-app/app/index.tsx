import React, { useEffect, useState } from 'react';
import { 
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  StatusBar,
  ScrollView,
  Dimensions,
  Modal
} from 'react-native';

import { getVehicles } from '../src/services/vehicleService';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const MENU_CATEGORIES = [
  { id: 'all', name: 'Tất cả' },
  { id: 'SUV', name: 'SUV' },
  { id: 'Pick-up', name: 'Pick-up' },
  { id: 'Van', name: 'Van' }
];

const FALLBACK_IMG =
  'https://via.placeholder.com/500x300?text=No+Image';

export default function HomeScreen() {

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  const router = useRouter();

  // ================= HD IMAGE =================
  const getHDImage = (url: string) => {
    if (!url) return FALLBACK_IMG;

    return url.replace(
      '/upload/',
      '/upload/q_100,f_auto/'
    );
  };

  // ================= LOAD DATA =================
  useEffect(() => {

    const delayDebounceFn = setTimeout(() => {
      loadData();
    }, 500);

    return () => clearTimeout(delayDebounceFn);

  }, [activeCategory, searchQuery]);

  useEffect(() => {
    checkUser();
  }, []);

  const loadData = async () => {

    setLoading(true);

    try {

      let params = `?search=${searchQuery}`;

      if (activeCategory === '🔥 Xe Hot') {
        params += `&isHot=true`;
      } else if (activeCategory !== 'Tất cả') {
        params += `&type=${activeCategory}`;
      }

      const response = await getVehicles(params);

      const data = response.data || response;

      setVehicles(Array.isArray(data) ? data : []);

    } catch (error) {

      console.error("Lỗi tải dữ liệu:", error);

    } finally {

      setLoading(false);
    }
  };

  // ================= CHECK USER =================
  const checkUser = async () => {

    const user = await AsyncStorage.getItem('userInfo');

    if (user) {
      setUserInfo(JSON.parse(user));
    }
  };

  // ================= LOGOUT =================
  const handleLogout = async () => {

    await AsyncStorage.removeItem('userInfo');

    setUserInfo(null);

    setIsMenuOpen(false);

    router.replace('/login');
  };

  // ================= HISTORY =================
  const navigateToHistory = () => {

    setIsMenuOpen(false);

    if (!userInfo) {

      router.push('/login');

    } else {

      router.push('/deposit-history');
    }
  };

  // ================= SIDE MENU =================
  const SideMenu = () => (

    <Modal
      visible={isMenuOpen}
      animationType="fade"
      transparent={true}
    >

      <View style={styles.modalOverlay}>

        <TouchableOpacity
          style={styles.modalCloseArea}
          onPress={() => setIsMenuOpen(false)}
        />

        <LinearGradient
          colors={['#fff', '#f8fafc']}
          style={styles.sideMenuContainer}
        >

          <View style={styles.menuHeader}>

            <Text style={styles.menuTitle}>
              DANH MỤC
            </Text>

            <TouchableOpacity
              onPress={() => setIsMenuOpen(false)}
            >
              <Ionicons
                name="close"
                size={28}
                color="#002B5B"
              />
            </TouchableOpacity>

          </View>

          <ScrollView style={styles.menuContent}>

            <View style={styles.userSection}>

              {userInfo ? (

                <View>

                  <Text style={styles.userRole}>
                    {userInfo.user.role === 'admin'
                      ? 'Quản trị viên'
                      : 'Thành viên'}
                  </Text>

                  <Text style={styles.userName}>
                    {userInfo.user.fullName ||
                      userInfo.user.username}
                  </Text>

                </View>

              ) : (

                <TouchableOpacity
                  style={styles.loginBtn}
                  onPress={() => {
                    setIsMenuOpen(false);
                    router.push('/login');
                  }}
                >

                  <Text style={styles.loginBtnText}>
                    ĐĂNG NHẬP / ĐĂNG KÝ
                  </Text>

                </TouchableOpacity>
              )}
            </View>

            <MenuLink
              icon="home-outline"
              label="Trang chủ"
              onPress={() => setIsMenuOpen(false)}
            />

            <MenuLink
              icon="pricetag-outline"
              label="Bảng giá xe"
              onPress={() => {
                setIsMenuOpen(false);
                router.push('/price-list');
              }}
            />

            <MenuLink
              icon="calculator-outline"
              label="Mua xe trả góp"
              onPress={() => {
                setIsMenuOpen(false);
                router.push('/installment');
              }}
            />

            <MenuLink
              icon="newspaper-outline"
              label="Tin tức"
              onPress={() => {
                setIsMenuOpen(false);
                router.push('/news');
              }}
            />

            <MenuLink
              icon="call-outline"
              label="Liên hệ trực tiếp"
              onPress={() => {
                setIsMenuOpen(false);
                router.push('/contact');
              }}
            />

            <MenuLink
              icon="car-sport-outline"
              label="Đăng ký lái thử"
              onPress={() => {
                setIsMenuOpen(false);
                router.push('/testdrive'); 
              }}
            />

            <MenuLink
            icon="chatbubble-ellipses-outline" 
            label="Chatbot hỗ trợ"
            onPress={() => {
              setIsMenuOpen(false);
              router.push('/chatbot'); 
            }}
          />

            {userInfo && (

              <TouchableOpacity
                style={styles.logoutMenuItem}
                onPress={handleLogout}
              >

                <Ionicons
                  name="log-out-outline"
                  size={22}
                  color="#dc2626"
                />

                <Text style={styles.logoutText}>
                  Đăng xuất
                </Text>

              </TouchableOpacity>
            )}

          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );

  // ================= MENU LINK =================
  const MenuLink = ({
    icon,
    label,
    onPress,
    color = "#002B5B"
  }: any) => (

    <TouchableOpacity
      style={styles.menuLink}
      onPress={onPress}
    >

      <Ionicons
        name={icon}
        size={22}
        color={color}
      />

      <Text
        style={[
          styles.menuLinkLabel,
          {
            color:
              color === "#002B5B"
                ? "#1e293b"
                : color
          }
        ]}
      >
        {label}
      </Text>

    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>

      <StatusBar barStyle="light-content" />

      <SideMenu />

      <FlatList
        data={vehicles}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 30 }}

        ListHeaderComponent={
          <View style={styles.headerContainer}>

            <LinearGradient
              colors={['#002B5B', '#1e40af']}
              style={styles.topSection}
            >

              <View style={styles.topBar}>

                <View>

                  <Text style={styles.greetingText}>
                    Hệ thống Showroom Ford
                  </Text>

                  <Text style={styles.brandNameLarge}>
                    QUẾ VÕ FORD
                  </Text>

                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}
                >

                  <TouchableOpacity
                    style={[
                      styles.iconCircleBtn,
                      { marginRight: 10 }
                    ]}
                    onPress={navigateToHistory}
                  >

                    <Ionicons
                      name="receipt-outline"
                      size={22}
                      color="#fff"
                    />

                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.iconCircleBtn}
                    onPress={() => setIsMenuOpen(true)}
                  >

                    <Ionicons
                      name="menu-outline"
                      size={26}
                      color="#fff"
                    />

                  </TouchableOpacity>

                </View>
              </View>

              <View style={styles.searchWrapper}>

                <Ionicons
                  name="search-outline"
                  size={20}
                  color="#94a3b8"
                  style={styles.searchIcon}
                />

                <TextInput
                  placeholder="Tìm kiếm mẫu xe..."
                  placeholderTextColor="#94a3b8"
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={(text) =>
                    setSearchQuery(text)
                  }
                />

                {searchQuery.length > 0 && (

                  <TouchableOpacity
                    onPress={() => setSearchQuery('')}
                  >

                    <Ionicons
                      name="close-circle"
                      size={18}
                      color="#94a3b8"
                    />

                  </TouchableOpacity>
                )}

              </View>
            </LinearGradient>

            <View style={styles.categoryWrapper}>

              <Text style={styles.sectionTitle}>
                Dòng xe Ford
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingVertical: 15
                }}
              >

                {MENU_CATEGORIES.map((cat) => (

                  <TouchableOpacity
                    key={cat.id}
                    onPress={() =>
                      setActiveCategory(cat.name)
                    }
                    style={[
                      styles.menuItem,
                      activeCategory === cat.name &&
                        styles.menuItemActive
                    ]}
                  >

                    <Text
                      style={[
                        styles.menuText,
                        activeCategory === cat.name &&
                          styles.menuTextActive
                      ]}
                    >
                      {cat.name}
                    </Text>

                  </TouchableOpacity>
                ))}

              </ScrollView>
            </View>
          </View>
        }

        ListEmptyComponent={
          !loading ? (

            <View
              style={{
                alignItems: 'center',
                marginTop: 50
              }}
            >

              <MaterialCommunityIcons
                name="car-off"
                size={60}
                color="#cbd5e1"
              />

              <Text
                style={{
                  color: '#94a3b8',
                  marginTop: 10
                }}
              >
                Không tìm thấy xe phù hợp
              </Text>

            </View>

          ) : (

            <ActivityIndicator
              size="small"
              color="#002B5B"
              style={{ marginTop: 20 }}
            />
          )
        }

        renderItem={({ item }) => {
  // ================= IMAGE =================
  const vehicleImage = item?.images?.length > 0 ? item.images[0] : item?.imageUrl || FALLBACK_IMG;

  // ================= PRICE =================
  const firstVariant = item?.variants?.[0];
  const vehiclePrice = firstVariant?.variantPrice || firstVariant?.basePrice || null;

  // ================= SPECS =================
  const engineSpec = firstVariant?.engine || item.specs?.engine || '2.0L';
  const fuelSpec = firstVariant?.fuelType || item.specs?.fuelType || 'Xăng/Dầu';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.premiumCard}
      onPress={() => router.push(`/vehicle/${item._id}`)}
    >
      <View style={styles.typeBadge}>
        <Text style={styles.typeBadgeText}>{item.type}</Text>
      </View>

      {item.isHot && (
        <LinearGradient colors={['#FF416C', '#FF4B2B']} style={styles.hotBadge}>
          <MaterialCommunityIcons name="fire" size={14} color="#fff" />
          <Text style={styles.hotBadgeText}>HOT</Text>
        </LinearGradient>
      )}

      {/* IMAGE */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: getHDImage(vehicleImage) }} style={styles.vehicleImg} />
      </View>

      {/* CONTENT */}
      <View style={styles.premiumContent}>
        <Text style={styles.premiumName}>{item.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Giá từ:</Text>
          <Text style={styles.premiumPrice}>
            {vehiclePrice ? `${vehiclePrice.toLocaleString('vi-VN')} ₫` : 'Liên hệ'}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* FOOTER */}
        <View style={styles.cardFooter}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={styles.specItem}>
              <MaterialCommunityIcons name="engine-outline" size={16} color="#94a3b8" />
              <Text style={styles.specText}>{engineSpec}</Text>
            </View>
            <View style={styles.specItem}>
              <MaterialCommunityIcons name="gas-station-outline" size={16} color="#94a3b8" />
              <Text style={styles.specText}>{fuelSpec}</Text>
            </View>
          </View>

          <View style={styles.detailBtn}>
            <Text style={styles.detailBtnText}>Chi tiết</Text>
            <Ionicons name="chevron-forward" size={14} color="#002B5B" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}}
      />
    </SafeAreaView>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  headerContainer: {
    backgroundColor: '#F8FAFC'
  },

  topSection: {
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30
  },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25
  },

  brandNameLarge: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.5
  },

  greetingText: {
    color: '#bfdbfe',
    fontSize: 12,
    fontWeight: '600'
  },

  iconCircleBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },

  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50
  },

  searchIcon: {
    marginRight: 10
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b'
  },

  categoryWrapper: {
    paddingHorizontal: 20,
    marginTop: 25
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A'
  },

  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    backgroundColor: '#fff',
    marginRight: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },

  menuItemActive: {
    backgroundColor: '#002B5B',
    borderColor: '#002B5B'
  },

  menuText: {
    fontWeight: 'bold',
    color: '#64748B',
    fontSize: 13
  },

  menuTextActive: {
    color: '#fff'
  },

  premiumCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4
  },

  typeBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    zIndex: 10
  },

  typeBadgeText: {
    color: '#002B5B',
    fontSize: 10,
    fontWeight: '800'
  },

  hotBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    zIndex: 10
  },

  hotBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    marginLeft: 3
  },

  imageContainer: {
    paddingVertical: 20,
    alignItems: 'center'
  },

  vehicleImg: {
    width: width * 0.8,
    height: 160,
    resizeMode: 'contain'
  },

  premiumContent: {
    paddingHorizontal: 20,
    paddingBottom: 20
  },

  premiumName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 5
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12
  },

  priceLabel: {
    fontSize: 12,
    color: '#64748B',
    marginRight: 6
  },

  premiumPrice: {
    color: '#E31837',
    fontSize: 19,
    fontWeight: '900'
  },

  divider: {
    height: 1,
    backgroundColor: '#F8FAFC',
    marginBottom: 15
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  specItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  specText: {
    fontSize: 11,
    color: '#94a3b8',
    marginLeft: 5,
    fontWeight: '600'
  },

  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10
  },

  detailBtnText: {
    fontSize: 11,
    color: '#002B5B',
    fontWeight: '800',
    marginRight: 4
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row'
  },

  modalCloseArea: {
    flex: 1
  },

  sideMenuContainer: {
    width: width * 0.75,
    height: '100%',
    padding: 25,
    paddingTop: 60
  },

  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40
  },

  menuTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#002B5B'
  },

  userSection: {
    backgroundColor: '#F1F5F9',
    padding: 18,
    borderRadius: 15,
    marginBottom: 25
  },

  userRole: {
    fontSize: 10,
    fontWeight: '900',
    color: '#E31837'
  },

  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#002B5B'
  },

  loginBtn: {
    backgroundColor: '#002B5B',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center'
  },

  loginBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold'
  },

  menuLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },

  menuLinkLabel: {
    marginLeft: 15,
    fontSize: 15,
    fontWeight: '600'
  },

  logoutMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    padding: 15,
    backgroundColor: '#FEF2F2',
    borderRadius: 12
  },

  logoutText: {
    marginLeft: 10,
    color: '#DC2626',
    fontWeight: 'bold'
  }
});