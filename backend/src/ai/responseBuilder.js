// ai/responseBuilder.js

export const buildVehicleResponse = (car, variant) => `
🚗 ${car.name}

💰 ${variant?.basePrice?.toLocaleString("vi-VN")} VNĐ
🚘 ${variant?.variantName}
⚙️ ${variant?.transmission}
🛞 ${variant?.driveTrain}
👥 ${car.seats} chỗ
🔥 ${car.type}
`;

export const buildCompareResponse = (a, b, v1, v2) => `
⚔️ ${a.name} vs ${b.name}

${a.name}: ${v1?.basePrice} VNĐ
${b.name}: ${v2?.basePrice} VNĐ
`;

export const buildTechnicalResponse = (p) => `
⚠️ ${p.title}

🔍 ${p.symptoms.join(", ")}
🛠 ${p.causes.join(", ")}
✅ ${p.solutions.join(", ")}
`;