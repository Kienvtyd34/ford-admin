import mongoose from "mongoose";
import dotenv from "dotenv";
import Intent from "../backend/src/models/Intent.js";

dotenv.config();

const intents = [
  {
    name: "PRICE_QUERY",
    label: "Giá xe",
    keywords: [
      "gia",
      "bao gia",
      "gia lan banh",
      "gia niem yet",
      "nhieu tien",
      "bao tien"
    ]
  },

  {
    name: "INSTALLMENT_QUERY",
    label: "Trả góp",
    keywords: [
      "tra gop",
      "vay ngan hang",
      "lai suat",
      "tra truoc"
    ]
  },

  {
    name: "STOCK_QUERY",
    label: "Tồn kho / còn xe",
    keywords: [
      "con hang",
      "ton kho",
      "san xe",
      "san hang",
      "giao ngay",
      "kho",
      "bai",
      "so luong",
      "con xe",
      "bao nhieu xe"
    ]
  },

  {
    name: "COLOR_QUERY",
    label: "Màu xe",
    keywords: [
      "mau gi",
      "may mau",
      "bang mau",
      "co nhung mau nao",
      "co mau nao",
      "mau xe",
      "xem mau"
    ]
  },

  {
    name: "SPECS_QUERY",
    label: "Thông số kỹ thuật",
    keywords: [
      "thong so",
  "dong co",
  "hop so",
  "ma luc",
  "option",
  "adas",
  "an toan",
  "camera 360",
  "cua so troi",
  "sac khong day",
  "fordpass",
  "ghe suoi",
  "ghe lam mat",
  "awd",
  "fwd",
  "4wd",
  "4x4",
  "may xang",
  "may dau",
  "xe dien",
  "xang",
  "dau",
  "chay xang",
  "chay dau",
  "autoemergencybrake",
  "aeb",
  "cua so troi", "cua noc", "co sunroof", "sunroof", 
  "nhan dien bien bao", "traffic sign", 
  "suoi ghe", "lam mat ghe", "sac khong day"
    ]
  },

  {
    name: "TECHNICAL_SUPPORT",
    label: "Hỗ trợ kỹ thuật",
    keywords: [
      "loi",
   "hong",
   "su co",
   "khong no",
   "abs",
   "u3000",
   "giat so",
   "vao so bi giat",
   "sang so bi giat",
   "khung khi sang so",
   "rung khi sang so",
   "ly hop",
   "dps6",
   "tcm"
    ]
  },

  {
    name: "NEWS_QUERY",
    label: "Tin tức / khuyến mãi",
    keywords: [
       "tin tuc",
 "khuyen mai",
 "su kien",
 "uu dai",
 "ra mat",
 "launch",
 "the he moi",
 "bai viet",
"tin moi",
"thang nay",
"showroom",
"ra mat",
"ford viet nam",
"su kien moi",
"everest 2026",
"territory 2026",
"ranger 2026"
    ]
  },

  {
    name: "IMAGE_QUERY",
    label: "Hình ảnh",
    keywords: [
      "xem anh",
      "anh xe",
      "hinh xe",
      "hinh anh",
      "xem hinh"
    ]
  },

  {
    name: "CONSULTING_QUERY",
    label: "Tư vấn chọn xe",
    keywords: [
      "tu van",
 "nen mua",
 "xe nao",
 "ford nao",
 "mua duoc xe gi",
 "mua xe gi",
 "chon xe",
 "goi y xe",
 "de xuat xe",
 "phu hop",
 "gia dinh",
 "5 nguoi",
 "7 nguoi",
 "5 cho",
 "7 cho",
 "rong rai",
 "dong nguoi",
 "di du lich",
 "di pho",
 "di lam",
 "chay dich vu",
 "ban tai",
 "pick up",
 "tai chinh",
 "ngan sach",
 "duoi",
 "tren",
 "khoang",
 "tam",
 "800 trieu",
 "900 trieu",
 "1 ty",
 "2 ty",
 "1 ty ruoi",
 "cao cap",
 "dia hinh",
 "offroad",
 "off road",
 "phuot",
 "manh me",
 "dam chac"
    ]
  },

  {
    name: "COMPARE_QUERY",
    label: "So sánh xe",
    keywords: [
      "so sanh",
      "khac nhau",
      "chon giua",
      "doi chieu",
      "uu diem",
      "nhuoc diem"
    ]
  }
];

const seedIntents = async () => {
  try {
    await mongoose.connect(process.env.DATA_URL);

    await Intent.deleteMany(); // reset data

    await Intent.insertMany(intents);

    console.log("✅ Seed intents success");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedIntents();