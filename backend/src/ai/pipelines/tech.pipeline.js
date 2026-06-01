export default async (message) => {
  const text = message.toLowerCase();

  if (text.includes("rung")) {
    return {
      intent: "TECH",
      message: "🔧 Xe bị rung có thể do lốp hoặc động cơ. Bạn đang chạy tốc độ bao nhiêu?",
    };
  }

  if (text.includes("khong mát")) {
    return {
      intent: "TECH",
      message: "❄️ Điều hòa không mát có thể do gas hoặc lọc gió.",
    };
  }

  return {
    intent: "TECH",
    message: "🔧 Đang kiểm tra lỗi kỹ thuật...",
  };
};