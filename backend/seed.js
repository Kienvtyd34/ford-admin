import dotenv from "dotenv";
dotenv.config();

import Contact from "./src/models/Contact.js";
import connectDB from "./src/config/db.js";

const firstNames = [
  "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng",
  "Vũ", "Đặng", "Bùi", "Đỗ", "Hồ"
];

const middleNames = [
  "Văn", "Thị", "Minh", "Đức", "Thanh",
  "Quang", "Ngọc", "Gia", "Tuấn", "Anh"
];

const lastNames = [
  "An", "Bình", "Cường", "Dũng", "Giang",
  "Hà", "Hưng", "Khánh", "Long", "Nam",
  "Phong", "Quân", "Sơn", "Trang", "Việt"
];

const requestTypes = [
  "Nhận báo giá",
  "Tư vấn trả góp"
];

const statuses = [
  "Chờ xử lý",
  "Đã hoàn thành"
];

const messages = [
  "Quan tâm Ford Ranger",
  "Muốn nhận báo giá Everest",
  "Tư vấn trả góp Territory",
  "So sánh Everest và Explorer",
  "Đăng ký lái thử Ranger",
  "Quan tâm Ford Transit",
  "Cần báo giá xe giao ngay",
  "Hỏi về khuyến mãi tháng này"
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomName() {
  return `${randomItem(firstNames)} ${randomItem(middleNames)} ${randomItem(lastNames)}`;
}

function randomPhone(index) {
  return `09${String(10000000 + index).slice(-8)}`;
}

function randomDate() {
  const now = new Date();
  const days = Math.floor(Math.random() * 90);

  return new Date(
    now.getTime() -
      days * 24 * 60 * 60 * 1000
  );
}

async function seedContacts() {
  try {
    // Kết nối MongoDB
    await connectDB();

    console.log("🚀 Start seeding contacts...");

    const contacts = [];

    for (let i = 1; i <= 200; i++) {
      contacts.push({
        fullName: randomName(),

        phone: randomPhone(i),

        email: `customer${i}@gmail.com`,

        requestType: randomItem(requestTypes),

        appointmentDate: randomDate(),

        message: randomItem(messages),

        status: randomItem(statuses),

        noteFromStaff: ""
      });
    }

    // Nếu muốn xóa dữ liệu cũ trước
    // await Contact.deleteMany({});

    const result = await Contact.insertMany(
      contacts
    );

    console.log(
      `✅ Đã thêm ${result.length} contact`
    );

    process.exit(0);

  } catch (err) {

    console.error(
      "❌ Seed Error:",
      err
    );

    process.exit(1);
  }
}

seedContacts();