import safe from "../utils/safeGet.js";
export const buildVehicleResponse = (car, variant) => {
  if (!car) return "";

  return `
🚗 ${safe.str(car.name)}

💰 ${
    variant?.basePrice
      ? variant.basePrice.toLocaleString("vi-VN") + " VNĐ"
      : "Liên hệ"
  }

🚘 ${safe.str(variant?.variantName)}
⚙️ ${safe.str(variant?.transmission)}
🛞 ${safe.str(variant?.driveTrain)}
⛽ ${safe.str(variant?.fuelType)}

👥 ${safe.str(car.seats)}
🔥 ${safe.str(car.type)}
`.trim();
};

export const buildTechnicalResponse = (p) => {
  if (!p) return "Không tìm thấy lỗi phù hợp";

  return `
⚠️ ${p.title || "Không rõ lỗi"}

🔍 ${(p.symptoms || []).join(", ") || "Không rõ"}
🛠 ${(p.causes || []).join(", ") || "Không rõ"}
✅ ${(p.solutions || []).join(", ") || "Không rõ"}
`.trim();
};