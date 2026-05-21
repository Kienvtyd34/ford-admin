export const reasoner = async ({
  message,
  toolResult,
  context
}) => {

  try {

    // lỗi
    if (!toolResult?.success) {
      return {
        message:
          toolResult?.message ||
          "Không thể xử lý yêu cầu"
      };
    }

    // vehicle response
    if (toolResult.vehicle) {

      const car = toolResult.vehicle;

      return {
        message: `
🚗 ${car.name}

💰 Giá từ:
${Number(car.price).toLocaleString("vi-VN")} VNĐ

🚘 Phiên bản:
${car.variantName}

⚙️ Hộp số:
${car.transmission}

🛞 Dẫn động:
${car.driveTrain}

⛽ Nhiên liệu:
${car.fuelType}

👥 Số chỗ:
${car.seats}

🔥 Dòng xe:
${car.type}
`
      };
    }

    return {
      message: "Không có dữ liệu phù hợp"
    };

  } catch (err) {

    console.log("REASONER ERROR:", err);

    return {
      message: "AI reasoning lỗi"
    };
  }
};