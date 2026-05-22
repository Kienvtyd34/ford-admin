export const buildVehicleResponse = (car, variant) => {
  const v = variant || car?.variants?.[0];

  return `
🚗 ${car?.name || "Không rõ"}

💰 ${v?.basePrice ? v.basePrice.toLocaleString("vi-VN") + " VNĐ" : "Liên hệ"}
🚘 ${v?.variantName || "Tiêu chuẩn"}
⚙️ ${v?.transmission || "AT"}
🛞 ${v?.driveTrain || "4x2"}
⛽ ${v?.fuelType || "Xăng"}

👥 ${car?.seats || "?"} chỗ
🔥 ${car?.type || "?"}
`.trim();
};

export const buildTechnicalResponse = (p) => {
  return `
⚠️ ${p.title}

🔍 ${p.symptoms?.join(", ")}
🛠 ${p.causes?.join(", ")}
✅ ${p.solutions?.join(", ")}
`.trim();
};