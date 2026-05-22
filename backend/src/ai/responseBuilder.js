import safe from "../utils/getBestVariant.js";
export const buildVehicleResponse = (car, variant) => {
  return `
🚗 ${safe.str(car?.name)}

💰 ${variant?.basePrice
    ? variant.basePrice.toLocaleString("vi-VN") + " VNĐ"
    : "Liên hệ"}

🚘 ${safe.str(variant?.variantName, "Tiêu chuẩn")}
⚙️ ${safe.str(variant?.transmission)}
🛞 ${safe.str(variant?.driveTrain)}
⛽ ${safe.str(variant?.fuelType)}

👥 ${safe.str(car?.seats, "?")} chỗ
🔥 ${safe.str(car?.type)}
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