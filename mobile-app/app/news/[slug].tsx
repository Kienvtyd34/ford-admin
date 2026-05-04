import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Calendar, User, Eye, ArrowLeft, Share2, Clock } from 'lucide-react-native';
import RenderHTML from 'react-native-render-html'; 
import api from '../../src/api/api'; 

interface INews {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  thumbnail: string;
  images: string[];
  category: string;
  author: string;
  views: number;
  createdAt: string;
}

const NewsDetail = () => {
  const { slug } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  
  const [news, setNews] = useState<INews | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isFetched = useRef(false);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setLoading(true);
        // Lưu ý: api.js của bạn cần export một instance axios đã cấu hình baseURL
        const res = await api.get(`/news/${slug}`);
        if (res.data.success) {
          setNews(res.data.data);
        }
      } catch (err) {
        console.error("Lỗi lấy chi tiết tin tức:", err);
      } finally {
        setLoading(false);
      }
    };

    if (slug && !isFetched.current) {
      fetchNewsDetail();
      isFetched.current = true;
    }
  }, [slug]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E31837" />
      </View>
    );
  }

  if (!news) {
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy bài viết</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: '#E31837', marginTop: 10 }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Cấu hình Header của Expo Router */}
      <Stack.Screen options={{ title: 'Chi tiết tin tức', headerTitleAlign: 'center' }} />

      {/* Thumbnail chính */}
      <Image source={{ uri: news.thumbnail }} style={styles.thumbnail} />

      <View style={styles.contentWrapper}>
        {/* Danh mục & Ngày đăng */}
        <View style={styles.metaRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{news.category}</Text>
          </View>
          <View style={styles.dateInfo}>
            <Clock size={14} color="#999" />
            <Text style={styles.dateText}>{new Date(news.createdAt).toLocaleDateString('vi-VN')}</Text>
          </View>
        </View>

        {/* Tiêu đề */}
        <Text style={styles.title}>{news.title}</Text>

        {/* Thống kê: Tác giả & Lượt xem */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <User size={16} color="#E31837" />
            <Text style={styles.statText}>{news.author}</Text>
          </View>
          <View style={styles.statItem}>
            <Eye size={16} color="#E31837" />
            <Text style={styles.statText}>{news.views?.toLocaleString()} lượt xem</Text>
          </View>
        </View>

        {/* Tóm tắt bài viết */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>{news.summary}</Text>
        </View>

        {/* Nội dung bài viết (Render HTML từ CMS) */}
        <RenderHTML
          contentWidth={width - 40}
          source={{ html: news.content }}
          tagsStyles={{
            p: { marginBottom: 15, fontSize: 16, lineHeight: 24, color: '#333' },
            img: { borderRadius: 8, marginVertical: 10 },
          }}
        />

        {/* Album ảnh bổ sung */}
        {news.images && news.images.length > 0 && (
          <View style={styles.galleryContainer}>
            <Text style={styles.sectionTitle}>Hình ảnh chi tiết</Text>
            {news.images.map((img, idx) => (
              <Image key={idx} source={{ uri: img }} style={styles.galleryImage} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  thumbnail: { width: '100%', height: 250, resizeMode: 'cover' },
  contentWrapper: { padding: 20 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  categoryBadge: { backgroundColor: '#E31837', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 2 },
  categoryText: { color: '#fff', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  dateInfo: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 12, color: '#999', marginLeft: 5 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#002B5B', marginBottom: 15, lineHeight: 30 },
  statsRow: { flexDirection: 'row', paddingVertical: 15, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#eee', marginBottom: 20 },
  statItem: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  statText: { fontSize: 12, color: '#666', marginLeft: 6 },
  summaryBox: { backgroundColor: '#f9f9f9', padding: 15, borderLeftWidth: 4, borderLeftColor: '#002B5B', marginBottom: 25 },
  summaryText: { fontSize: 16, fontStyle: 'italic', color: '#444', lineHeight: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#002B5B', marginBottom: 15, marginTop: 20 },
  galleryContainer: { marginTop: 10 },
  galleryImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 15 },
});

export default NewsDetail;