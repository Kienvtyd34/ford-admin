export const buildVehicleResponse = (car, variant) => {
  const v = variant || {};

  return `
🚗 ${car?.name || "Không rõ"}

💰 ${
    v.basePrice
      ? v.basePrice.toLocaleString("vi-VN") + " VNĐ"
      : "Liên hệ"
  }

🚘 ${v.variantName || "Tiêu chuẩn"}
⚙️ ${v.transmission || "Không rõ"}
🛞 ${v.driveTrain || "Không rõ"}
⛽ ${v.fuelType || "Không rõ"}

👥 ${car?.seats ?? "?"} chỗ
🔥 ${car?.type || "?"}
`.trim();
};

export const buildTechnicalResponse = (p) => {
  if (!p) return "Không tìm thấy lỗi";

  return `
⚠️ ${p.title}

🔍 ${(p.symptoms || []).join(", ")}
🛠 ${(p.causes || []).join(", ")}
✅ ${(p.solutions || []).join(", ")}
`.trim();
};