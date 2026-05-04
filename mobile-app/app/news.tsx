import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, Image, TouchableOpacity, 
  StyleSheet, ActivityIndicator, ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
import { getNews } from '../src/services/newsService';

const categories = ['Tất cả', 'Tin tức', 'Khuyến mãi', 'Sự kiện', 'Đánh giá xe'];

export default function NewsScreen() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Tất cả');
  const router = useRouter();

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const data = await getNews();
      setNews(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = activeTab === 'Tất cả' 
    ? news 
    : news.filter(item => item.category === activeTab);

  const renderNewsItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.newsCard}
      onPress={() => router.push(`/news/${item.slug}`)} // Chuyển sang trang chi tiết
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.newsTitle} numberOfLines={2}>
          {item.title.toUpperCase()}
        </Text>
        <Text style={styles.newsSummary} numberOfLines={3}>
          {item.summary}
        </Text>
        <View style={styles.footerRow}>
          <Text style={styles.readMore}>KHÁM PHÁ NGAY →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Hero Header */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>TIN TỨC & ƯU ĐÃI FORD</Text>
        <Text style={styles.heroSubtitle}>Cập nhật thông tin mới nhất từ Ford Quế Võ</Text>
      </View>

      {/* Filter Tabs */}
      <View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.tabScroll}
        >
          {categories.map(cat => (
            <TouchableOpacity 
              key={cat} 
              onPress={() => setActiveTab(cat)}
              style={[styles.tabButton, activeTab === cat && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === cat && styles.tabTextActive]}>
                {cat.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1e3a8a" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredNews}
          keyExtractor={(item) => item._id}
          renderItem={renderNewsItem}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  hero: { backgroundColor: '#002B5B', paddingVertical: 40, alignItems: 'center' },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  heroSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 5, letterSpacing: 1 },
  
  tabScroll: { paddingHorizontal: 20, paddingVertical: 20 },
  tabButton: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', marginRight: 10 },
  tabActive: { backgroundColor: '#dc2626', borderColor: '#dc2626' },
  tabText: { fontSize: 10, fontWeight: '900', color: '#64748b' },
  tabTextActive: { color: '#fff' },

  listPadding: { paddingHorizontal: 20, paddingBottom: 30 },
  newsCard: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 25, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, overflow: 'hidden' },
  imageContainer: { width: '100%', height: 200 },
  thumbnail: { width: '100%', height: '100%', objectFit: 'cover' },
  categoryBadge: { position: 'absolute', top: 15, left: 15, backgroundColor: '#dc2626', paddingHorizontal: 10, paddingVertical: 4 },
  categoryText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  
  contentContainer: { padding: 15 },
  newsTitle: { fontSize: 18, fontWeight: '900', color: '#1e293b', marginBottom: 10, lineHeight: 24 },
  newsSummary: { fontSize: 14, color: '#64748b', lineHeight: 20, marginBottom: 15 },
  readMore: { fontSize: 12, fontWeight: '900', color: '#002B5B' }
});