import { chatRouter } from "../../ai/router.js";
import { saveMemory } from "../../ai/memoryService.js";

export const chatController = async (req, res) => {
  try {
    const { message, userId } = req.body;

    if (!message?.trim()) {
      return res.json({
        success: false,
        reply: "Bạn chưa nhập nội dung",
      });
    }

    const result = await chatRouter(message, { userId });

    await saveMemory(userId, "user", message, result.mode);

    // =========================
    // 🧠 SALES MODE (SMART)
    // =========================
    if (result.mode === "sales" && result.data) {
      const v = result.data;

      return res.json({
        success: true,
        reply:
          `🚗 Xe phù hợp nhất cho bạn:\n\n` +
          `👉 ${v.name}\n` +
          `👥 ${v.seats} chỗ (${v.type})\n` +
          `📝 ${v.description?.slice(0, 120) || "Xe Ford chính hãng"}\n\n` +
          `💡 Bạn muốn:\n` +
          `• Báo giá\n• Trả góp\n• Lái thử?`,
      });
    }

    // =========================
    // 🔧 CAR PROBLEM MODE
    // =========================
    if (result.mode === "problem") {
      const p = result.data;

      return res.json({
        success: true,
        reply:
          `🔧 Vấn đề: ${p.title}\n\n` +
          `👉 Nguyên nhân:\n- ${p.causes.join("\n- ")}\n\n` +
          `💡 Giải pháp:\n- ${p.solutions.join("\n- ")}`,
      });
    }

    // =========================
    // 💰 PRICE MODE
    // =========================
    if (result.mode === "price") {
      return res.json({
        success: true,
        reply:
          "💰 Các phiên bản:\n\n" +
          result.data
            .map(v => `• ${v.variantName}: ${Number(v.basePrice).toLocaleString()} VNĐ`)
            .join("\n"),
      });
    }

    // =========================
    // 🧠 FALLBACK (SMART)
    // =========================
    return res.json({
      success: true,
      reply:
        "🚗 Bạn đang cần xe cho gia đình, đi công việc hay chở nhiều người?",
    });
  } catch (err) {
    console.error("CHAT ERROR:", err);

    return res.json({
      success: true,
      reply:
        "⚠️ Hệ thống đang tự khôi phục. Bạn muốn mình gợi ý xe 5 chỗ hay 7 chỗ?",
    });
  }
};