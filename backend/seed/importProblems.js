import mongoose from "mongoose";
import dotenv from "dotenv"; // 1. Import dotenv để đọc file .env
import connectDb from "../src/config/db.js"; // 2. Import hàm kết nối của bạn (sửa lại đường dẫn tới file connectDb cho đúng)
import CarProblem from "../src/models/CarProblem.js";
import { problems } from "./carProblems.js";

// 3. Cấu hình dotenv để ứng dụng hiểu được process.env.DATA_URL
dotenv.config(); 

// 4. Gọi hàm kết nối database đã viết sẵn của bạn
await connectDb();

try {
  // 5. Xóa dữ liệu cũ
  await CarProblem.deleteMany();
  
  // 6. Thêm dữ liệu mới vào
  await CarProblem.insertMany(problems);
  console.log("IMPORT SUCCESS");
} catch (error) {
  console.error("Lỗi khi import dữ liệu:", error);
} finally {
  // 7. Ngắt kết nối database sau khi chạy xong để giải phóng bộ nhớ
  await mongoose.disconnect();
  process.exit();
}