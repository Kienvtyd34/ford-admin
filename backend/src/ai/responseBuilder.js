import { safeString, safeNumber } from "../utils/safeGet.js";

export const buildVehicleResponse = (car, variant) => {
  return `
🚗 ${car?.name || "Không rõ"}

💰 ${variant?.basePrice
    ? variant.basePrice.toLocaleString("vi-VN") + " VNĐ"
    : "Đang cập nhật"}

🚘 ${variant?.variantName || "Tiêu chuẩn"}
⚙️ ${variant?.transmission || "AT"}
🛞 ${variant?.driveTrain || "4x2"}
⛽ ${variant?.fuelType || "Xăng"}

👥 ${car?.seats || "?"} chỗ
🔥 ${car?.type || "?"}
`.trim();
};
export const buildCompareResponse = (a, b, v1, v2) => {
  if (!a || !b) return "Không đủ dữ liệu để so sánh";

  return `
⚔️ ${safeString(a.name)} vs ${safeString(b.name)}

${safeString(a.name)}:
💰 ${v1?.basePrice?.toLocaleString("vi-VN") || "?"} VNĐ

${safeString(b.name)}:
💰 ${v2?.basePrice?.toLocaleString("vi-VN") || "?"} VNĐ
`.trim();
};

export const buildTechnicalResponse = (p) => {
  if (!p) return "Không tìm thấy lỗi phù hợp";

  return `
⚠️ ${safeString(p.title)}

🔍 ${safeArray(p.symptoms).join(", ") || "Không rõ"}
🛠 ${safeArray(p.causes).join(", ") || "Không rõ"}
✅ ${safeArray(p.solutions).join(", ") || "Không rõ"}
`.trim();
};