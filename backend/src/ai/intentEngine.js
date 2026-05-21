// src/ai/intentEngine.js

export const detectIntent = (
  message = ""
) => {

  const msg =
    message.toLowerCase();

  // ================= COMPARE =================

  if (
    msg.includes("vs") ||
    msg.includes("so sánh")
  ) {
    return "COMPARE";
  }

  // ================= TEST DRIVE =================

  if (
    msg.includes("lái thử") ||
    msg.includes("test drive")
  ) {
    return "TEST_DRIVE";
  }

  // ================= TECHNICAL =================

  if (
    msg.includes("lỗi") ||
    msg.includes("abs") ||
    msg.includes("check engine") ||
    msg.includes("triệu chứng") ||
    msg.includes("đèn báo")
  ) {
    return "TECHNICAL";
  }

  // ================= RECOMMEND =================

  if (
    msg.includes("suv") ||
    msg.includes("7 chỗ") ||
    msg.includes("gia đình") ||
    msg.includes("offroad") ||
    msg.includes("tiết kiệm") ||
    msg.includes("bán tải") ||
    msg.includes("gợi ý")
  ) {
    return "RECOMMEND";
  }

  // ================= PRICE =================

  if (
    msg.includes("giá")
  ) {
    return "PRICE";
  }

  return "GENERAL";
};