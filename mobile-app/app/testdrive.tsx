import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  StyleSheet,
  Alert
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import api from "../src/api/api.js";

interface Color {
  name: string;
}

interface Vehicle {
  _id: string;
  modelName: string;
  variantName: string;
  image: string;
  color?: Color;
}

const TIME_SLOTS = [
  "08:00 - 10:00",
  "10:00 - 12:00",
  "13:00 - 15:00",
  "15:00 - 17:00"
];

const TestDrivePage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selected, setSelected] = useState<Vehicle | null>(null);

  // ===== FILTER =====
  const [search, setSearch] = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");

  // ===== FORM =====
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    date: "",
    timeSlot: ""
  });

  // ===== FETCH =====
  const fetchDemo = async () => {
    try {
      const res = await api.get("/contacts/demo-vehicles");
      setVehicles(res.data.data);
    } catch (err) {
      console.error(err);
      Alert.alert("Lỗi", "Không tải được xe demo");
    }
  };

  useEffect(() => {
    fetchDemo();
  }, []);

  // ===== UNIQUE FILTER DATA =====
  const uniqueColors = useMemo(() => {
    return [...new Set(vehicles.map(v => v.color?.name).filter(Boolean))];
  }, [vehicles]);

  const uniqueModels = useMemo(() => {
    return [...new Set(vehicles.map(v => v.modelName).filter(Boolean))];
  }, [vehicles]);

  // ===== FILTER LOGIC =====
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const keyword = search.toLowerCase().trim();

      if (search) {
        const model = v.modelName?.toLowerCase() || "";
        const variant = v.variantName?.toLowerCase() || "";
        if (!model.includes(keyword) && !variant.includes(keyword)) return false;
      }

      if (colorFilter && v.color?.name !== colorFilter) return false;

      if (modelFilter && v.modelName !== modelFilter) return false;

      return true;
    });
  }, [vehicles, search, colorFilter, modelFilter]);

  // ===== SUBMIT =====
  const handleSubmit = async () => {
    if (!selected) return;

    try {
      await api.post("/contacts/book", {
        ...form,
        inventoryId: selected._id
      });

      Alert.alert("Thành công", "Đặt lịch lái thử thành công!");

      setSelected(null);
      setForm({
        customerName: "",
        phone: "",
        date: "",
        timeSlot: ""
      });

    } catch (err: any) {
      Alert.alert("Lỗi", err.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  // ===== RESET FILTER =====
  const resetFilter = () => {
    setSearch("");
    setColorFilter("");
    setModelFilter("");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Xe lái thử</Text>

      {/* ===== FILTER ===== */}
      <TextInput
        placeholder="Tìm tên xe..."
        value={search}
        onChangeText={setSearch}
        style={styles.input}
      />

      <View style={styles.row}>
        <Text style={styles.label}>Dòng xe</Text>
        <Picker selectedValue={modelFilter} onValueChange={setModelFilter}>
          <Picker.Item label="Tất cả" value="" />
          {uniqueModels.map(m => (
            <Picker.Item key={m} label={m} value={m} />
          ))}
        </Picker>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Màu</Text>
        <Picker selectedValue={colorFilter} onValueChange={setColorFilter}>
          <Picker.Item label="Tất cả" value="" />
          {uniqueColors.map(c => (
            <Picker.Item key={c} label={c} value={c} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity onPress={resetFilter} style={styles.resetBtn}>
        <Text style={{ color: "#333" }}>Reset</Text>
      </TouchableOpacity>

      {/* ===== LIST ===== */}
      {filteredVehicles.map(v => (
        <View key={v._id} style={styles.card}>
          <Image source={{ uri: v.image }} style={styles.image} />

          <Text style={styles.title}>
            {v.modelName} {v.variantName}
          </Text>

          <Text style={styles.sub}>
            Màu: {v.color?.name || "---"}
          </Text>

          <TouchableOpacity
            onPress={() => setSelected(v)}
            style={styles.btn}
          >
            <Text style={styles.btnText}>Đặt lịch</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* ===== MODAL ===== */}
      <Modal visible={!!selected} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>

            <Text style={styles.modalTitle}>
              Đặt lịch: {selected?.modelName}
            </Text>

            <TextInput
              placeholder="Tên"
              style={styles.input}
              value={form.customerName}
              onChangeText={t => setForm({ ...form, customerName: t })}
            />

            <TextInput
              placeholder="SĐT"
              style={styles.input}
              value={form.phone}
              onChangeText={t => setForm({ ...form, phone: t })}
            />

            <TextInput
              placeholder="Ngày (YYYY-MM-DD)"
              style={styles.input}
              value={form.date}
              onChangeText={t => setForm({ ...form, date: t })}
            />

            <Picker
              selectedValue={form.timeSlot}
              onValueChange={t => setForm({ ...form, timeSlot: t })}
            >
              <Picker.Item label="Chọn giờ" value="" />
              {TIME_SLOTS.map(t => (
                <Picker.Item key={t} label={t} value={t} />
              ))}
            </Picker>

            <TouchableOpacity onPress={handleSubmit} style={styles.btn}>
              <Text style={styles.btnText}>Xác nhận</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setSelected(null)}>
              <Text style={styles.close}>Đóng</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f3f4f6" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10
  },

  row: { marginBottom: 10 },

  label: { fontWeight: "bold", marginBottom: 5 },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15
  },

  image: { width: "100%", height: 150, resizeMode: "contain" },

  title: { fontWeight: "bold", marginTop: 10 },

  sub: { color: "gray", marginBottom: 10 },

  btn: {
    backgroundColor: "#1e3a8a",
    padding: 10,
    borderRadius: 8,
    marginTop: 10
  },

  btnText: { color: "#fff", textAlign: "center" },

  resetBtn: {
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center"
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20
  },

  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10
  },

  close: {
    color: "red",
    textAlign: "center",
    marginTop: 10
  }
});

export default TestDrivePage;