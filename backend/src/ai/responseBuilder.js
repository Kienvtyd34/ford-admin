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
  return `
⚠️ ${p.title}

🔍 ${p.symptoms?.join(", ")}
🛠 ${p.causes?.join(", ")}
✅ ${p.solutions?.join(", ")}
`.trim();
};