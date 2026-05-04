import React from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ImageBackground, SafeAreaView, Dimensions, StatusBar 
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const InstallmentScreen = () => {
  const router = useRouter();

  const BenefitCard = ({ icon, title, desc }: any) => (
    <View style={styles.benefitCard}>
      <View style={styles.iconCircle}>
        <Text style={{ fontSize: 24 }}>{icon}</Text>
      </View>
      <Text style={styles.benefitTitle}>{title}</Text>
      <Text style={styles.benefitDesc}>{desc}</Text>
    </View>
  );

  const RequirementList = ({ title, items, type }: any) => (
    <View style={styles.reqSection}>
      <Text style={styles.reqHeader}>{title}</Text>
      {items.map((item: string, index: number) => (
        <View key={index} style={styles.checkItem}>
          <Ionicons name="checkmark-circle" size={20} color="#3b82f6" />
          <Text style={styles.checkText}>{item}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner Header */}
        <ImageBackground 
          source={{ uri: 'https://www.ford.com.vn/content/dam/Ford/website-assets/ap/vn/news/2023/mua-xe-tra-gop/mua-xe-tra-gop-banner.jpg' }}
          style={styles.banner}
        >
          <LinearGradient colors={['rgba(30,58,138,0.3)', '#1e3a8a']} style={styles.bannerOverlay}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>HƯỚNG DẪN MUA XE{"\n"}TRẢ GÓP</Text>
              <Text style={styles.bannerSubtitle}>Sở hữu chiếc xe mơ ước với thủ tục đơn giản, lãi suất ưu đãi.</Text>
            </View>
          </LinearGradient>
        </ImageBackground>

        <View style={styles.contentBody}>
          {/* Section 1: Intro */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.accentBar} />
              <Text style={styles.sectionTitle}>TẠI SAO NÊN MUA TRẢ GÓP?</Text>
            </View>
            <Text style={styles.normalText}>
              Giúp bạn tối ưu hóa dòng tiền cho các kế hoạch kinh doanh mà vẫn sở hữu ngay mẫu xe Ford đời mới nhất.
            </Text>
            
            <View style={styles.benefitsGrid}>
              <BenefitCard icon="💰" title="Vốn đầu tư thấp" desc="Trả trước từ 20% giá trị xe." />
              <BenefitCard icon="📅" title="Thời gian dài" desc="Vay lên đến 7-8 năm linh hoạt." />
              <BenefitCard icon="⚡" title="Thủ tục nhanh" desc="Xét duyệt chỉ trong 8-24 giờ." />
            </View>
          </View>

          {/* Section 2: Requirements */}
          <View style={[styles.section, styles.blueBox]}>
            <Text style={styles.sectionTitleWhite}>HỒ SƠ CẦN THIẾT</Text>
            
            <RequirementList 
              title="DÀNH CHO CÁ NHÂN"
              items={[
                'CCCD / Hộ chiếu còn hiệu lực',
                'Giấy đăng ký kết hôn / Độc thân',
                'Hợp đồng lao động / Bảng lương',
                'Chứng minh thu nhập khác'
              ]}
            />

            <View style={styles.divider} />

            <RequirementList 
              title="DÀNH CHO DOANH NGHIỆP"
              items={[
                'Giấy phép đăng ký kinh doanh',
                'Báo cáo tài chính năm gần nhất',
                'Tờ khai VAT 6 tháng gần nhất',
                'CCCD người đại diện pháp luật'
              ]}
            />
          </View>

          {/* Section 3: CTA */}
          <View style={styles.ctaSection}>
            <Text style={styles.ctaText}>Bạn muốn biết chính xác số tiền cần trả mỗi tháng?</Text>
            <TouchableOpacity 
              style={styles.ctaBtn}
              onPress={() => router.push('/contact')}
            >
              <Text style={styles.ctaBtnText}>NHẬN BÁO GIÁ & TƯ VẤN VAY</Text>
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Section 4: Bank Support */}
          <View style={styles.footerInfo}>
             <MaterialCommunityIcons name="bank" size={40} color="#64748b" />
             <Text style={styles.footerTitle}>ĐỐI TÁC NGÂN HÀNG</Text>
             <Text style={styles.footerDesc}>
               Ford Quế Võ liên kết với hơn 20 ngân hàng uy tín: VCB, Techcombank, VPBank, TPBank, Shinhan Bank... mang lại mức lãi suất tốt nhất.
             </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  banner: { width: '100%', height: 350 },
  bannerOverlay: { flex: 1, padding: 20, justifyContent: 'space-between' },
  backBtn: { marginTop: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  bannerContent: { marginBottom: 30 },
  bannerTitle: { color: '#fff', fontSize: 32, fontWeight: '900', fontStyle: 'italic' },
  bannerSubtitle: { color: '#bfdbfe', fontSize: 16, marginTop: 10, lineHeight: 22 },
  
  contentBody: { paddingHorizontal: 20, paddingVertical: 30 },
  section: { marginBottom: 40 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  accentBar: { width: 5, height: 30, backgroundColor: '#1e3a8a', marginRight: 10 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#1e3a8a', fontStyle: 'italic' },
  normalText: { fontSize: 15, color: '#475569', lineHeight: 24 },
  
  benefitsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25 },
  benefitCard: { width: (width - 60) / 3, backgroundColor: '#f8fafc', padding: 12, borderRadius: 15, borderWidth: 1, borderColor: '#f1f5f9' },
  iconCircle: { marginBottom: 10 },
  benefitTitle: { fontSize: 12, fontWeight: '800', color: '#1e3a8a', marginBottom: 5, textTransform: 'uppercase' },
  benefitDesc: { fontSize: 10, color: '#64748b' },

  blueBox: { backgroundColor: '#1e3a8a', padding: 25, borderRadius: 30 },
  sectionTitleWhite: { fontSize: 22, fontWeight: '900', color: '#fff', fontStyle: 'italic', marginBottom: 20, textAlign: 'center' },
  reqSection: { marginVertical: 10 },
  reqHeader: { fontSize: 13, fontWeight: '800', color: '#bfdbfe', marginBottom: 12, tracking: 1 },
  checkItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkText: { color: '#fff', marginLeft: 10, fontSize: 14, fontWeight: '500' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 20 },

  ctaSection: { alignItems: 'center', marginVertical: 20 },
  ctaText: { color: '#64748b', fontStyle: 'italic', marginBottom: 15, textAlign: 'center' },
  ctaBtn: { backgroundColor: '#1e3a8a', paddingVertical: 18, paddingHorizontal: 25, borderRadius: 100, flexDirection: 'row', alignItems: 'center', elevation: 5 },
  ctaBtnText: { color: '#fff', fontWeight: '900', fontSize: 14, marginRight: 10 },

  footerInfo: { alignItems: 'center', padding: 30, backgroundColor: '#f8fafc', borderRadius: 20, marginTop: 20 },
  footerTitle: { fontSize: 16, fontWeight: '900', color: '#1e293b', marginTop: 10 },
  footerDesc: { textAlign: 'center', color: '#64748b', fontSize: 13, marginTop: 8, lineHeight: 20 }
});

export default InstallmentScreen;