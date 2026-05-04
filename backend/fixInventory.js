import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Variant from './src/models/Variant.js';
import VehicleColor from './src/models/VehicleColor.js';
import Inventory from './src/models/Inventory.js';

dotenv.config();

// Kết nối Database
mongoose.connect(process.env.DATA_URL)
  .then(() => console.log("✅ Đã kết nối MongoDB để Seed Inventory..."))
  .catch(err => console.error("❌ Lỗi kết nối:", err));

// Map màu
const colorDataMap = {
  "Territory": ["Đỏ", "Trắng", "Bạc", "Xanh", "Đen"],
  "Everest": {
    "Ambiente": ["Xám", "Bạc", "Đen", "Trắng"],
    "Sport": ["Trắng", "Đen"],
    "Titanium": ["Xám", "Bạc", "Đen", "Trắng", "Nâu"],
    "Platinum": ["Xám", "Nâu", "Đen", "Trắng"]
  },
  "Transit": ["Bạc", "Nâu", "Vàng cát", "Trắng", "Đen"],
  "Ranger": {
    "Wildtrak": ["Đen", "Trắng", "Bạc", "Ghi", "Vàng", "Đỏ"],
    "Sport": ["Trắng", "Ghi bạc", "Đen", "Đỏ"],
    "XLS": ["Đen", "Trắng", "Bạc", "Ghi", "Đỏ"],
    "XL": ["Trắng", "Đỏ", "Đen", "Bạc", "Ghi"]
  },
  "Raptor": ["Trắng", "Xanh dương", "Đen", "Xám", "Cam"],
  "Mustang": ["Đỏ", "Đen", "Trắng", "Xanh lá"]
};

// Hàm random VIN
const generateVIN = () =>
  "WF0" + Math.random().toString(36).substring(2, 16).toUpperCase();

// Lấy màu theo variant
const getColors = (variantName) => {
  if (variantName.includes("Territory")) return colorDataMap["Territory"];
  if (variantName.includes("Transit")) return colorDataMap["Transit"];
  if (variantName.includes("Raptor")) return colorDataMap["Raptor"];
  if (variantName.includes("Mustang")) return colorDataMap["Mustang"];

  if (variantName.includes("Everest")) {
    if (variantName.includes("Ambiente")) return colorDataMap["Everest"]["Ambiente"];
    if (variantName.includes("Sport")) return colorDataMap["Everest"]["Sport"];
    if (variantName.includes("Platinum")) return colorDataMap["Everest"]["Platinum"];
    return colorDataMap["Everest"]["Titanium"];
  }

  if (variantName.includes("Ranger")) {
    if (variantName.includes("Wildtrak")) return colorDataMap["Ranger"]["Wildtrak"];
    if (variantName.includes("Sport")) return colorDataMap["Ranger"]["Sport"];
    if (variantName.includes("XLS")) return colorDataMap["Ranger"]["XLS"];
    return colorDataMap["Ranger"]["XL"];
  }

  return [];
};

const seedInventory = async () => {
  try {
    // 🔥 (Khuyên dùng) Xóa dữ liệu cũ
    await Inventory.deleteMany({});
    console.log("🗑️ Đã xoá dữ liệu Inventory cũ");

    const variants = await Variant.find().lean();
    const inventoryToInsert = [];

    for (const variant of variants) {
      const colors = getColors(variant.variantName);

      for (const colorName of colors) {
        // ✅ CHỈ FIND, KHÔNG CREATE
        const colorObj = await VehicleColor.findOne({
          variantId: variant._id,
          name: colorName
        });

        if (!colorObj) {
          console.log(`❌ Thiếu màu: ${colorName} - ${variant.variantName}`);
          continue; // bỏ qua nếu chưa seed màu
        }

        // 3 xe commercial
        for (let i = 0; i < 3; i++) {
          inventoryToInsert.push({
            variantId: variant._id,
            colorId: colorObj._id,
            vin: generateVIN(),
            engineNumber: "ENG" + Math.random().toString().substring(2, 10),
            importPrice: variant.basePrice * 0.9,
            status: "Trong kho",
            category: "Commercial",
            importDate: new Date()
          });
        }

        // 1 xe demo
        inventoryToInsert.push({
          variantId: variant._id,
          colorId: colorObj._id,
          vin: generateVIN(),
          engineNumber: "DEMO" + Math.random().toString().substring(2, 10),
          importPrice: variant.basePrice * 0.85,
          status: "Đang lái thử",
          category: "Demo",
          demoDetails: {
            plateNumber: "30A-" + Math.floor(10000 + Math.random() * 90000),
            currentKm: Math.floor(Math.random() * 1000),
            lastMaintenanceDate: new Date()
          }
        });
      }

      console.log(`✅ ${variant.variantName}`);
    }

    await Inventory.insertMany(inventoryToInsert);

    console.log(`🚀 THÀNH CÔNG: ${inventoryToInsert.length} xe`);
    process.exit();

  } catch (err) {
    console.error("❌ Lỗi khi Seed:", err);
    process.exit(1);
  }
};

seedInventory();