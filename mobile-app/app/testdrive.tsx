import React, { useEffect, useState, useMemo } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, Image, ScrollView, Modal, StyleSheet, Alert 
} from "react-native";
import axios from 'axios';

interface Color { name: string; }
interface Vehicle {
  _id: string;
  modelName: string;
  variantName: string;
  image: string;
  color?: Color;
}

const TestDrivePage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [search, setSearch] = useState<string>("");

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    date: "",
    timeSlot: ""
  });

  const fetchDemo = async () => {
    try {
      const res = await axios.get("/contacts/demo-vehicles");
      setVehicles(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDemo();
  }, []);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const keyword = search.toLowerCase().trim();
      return !search || v.modelName?.toLowerCase().includes(keyword) || v.variantName?.toLowerCase().includes(keyword);
    });
  }, [vehicles, search]);

  const handleSubmit = async () => {
    if (!selected) return;
    try {
      await axios.post("/contacts/book", { ...form, inventoryId: selected._id });
      Alert.alert("Thành công", "Đặt lịch lái thử thành công!");
      setSelected(null);
    } catch (err: any) {
      Alert.alert("Lỗi", err.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Xe lái thử</Text>

      <TextInput
        placeholder="Tìm tên xe..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchBar}
      />

      <View style={styles.grid}>
        {filteredVehicles.map((v) => (
          <View key={v._id} style={styles.card}>
            <Image source={{ uri: v.image }} style={styles.image} />
            <Text style={styles.modelText}>{v.modelName} {v.variantName}</Text>
            <TouchableOpacity onPress={() => setSelected(v)} style={styles.btn}>
              <Text style={styles.btnText}>Đặt lịch</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Modal thay thế cho div fixed */}
      <Modal visible={!!selected} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Đặt lịch: {selected?.modelName}</Text>
            <TextInput placeholder="Tên" style={styles.input} onChangeText={(t) => setForm({...form, customerName: t})} />
            <TextInput placeholder="SĐT" style={styles.input} onChangeText={(t) => setForm({...form, phone: t})} />
            <TouchableOpacity onPress={handleSubmit} style={styles.btn}>
              <Text style={styles.btnText}>Xác nhận</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelected(null)} style={{marginTop: 10}}>
              <Text style={{textAlign: 'center', color: 'red'}}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f3f4f6" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  searchBar: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 20 },
  grid: { flexDirection: 'column', gap: 15 },
  card: { backgroundColor: "#fff", padding: 15, borderRadius: 10, alignItems: 'center' },
  image: { width: '100%', height: 150, resizeMode: 'contain' },
  modelText: { fontWeight: 'bold', marginVertical: 10 },
  btn: { backgroundColor: "#1e3a8a", padding: 12, borderRadius: 8, width: '100%' },
  btnText: { color: "#fff", textAlign: 'center', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: { borderBottomWidth: 1, marginBottom: 15, padding: 5 }
});

export default TestDrivePage;