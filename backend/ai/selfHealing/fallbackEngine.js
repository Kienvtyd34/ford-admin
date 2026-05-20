import { chatRouter } from "../../ai/router.js";
import { saveMemory } from "../../ai/memoryEngine.js";

export const chatController = async (
  req,
  res
) => {
  try {
    const { message, userId } = req.body;

    if (!message?.trim()) {
      return res.json({
        success: false,
        reply: "Vui lòng nhập nội dung",
      });
    }

    const result = await chatRouter(
      message
    );

    await saveMemory(
      userId,
      "user",
      message
    );

    // ================= SALES =================

    if (result.mode === "sales") {
      const v = result.data;

      return res.json({
        success: true,
        reply:
          `🚗 Xe phù hợp cho anh/chị:\n\n` +
          `👉 ${v.name}\n` +
          `👥 ${v.seats} chỗ (${v.type})\n\n` +
          `💡 Anh/chị muốn:\n` +
          `• Báo giá\n` +
          `• Trả góp\n` +
          `• Đăng ký lái thử`,
      });
    }

    // ================= PROBLEM =================

    if (result.mode === "problem") {
      const p = result.data;

      return res.json({
        success: true,
        reply:
          `🔧 ${p.title}\n\n` +
          `📌 Nguyên nhân:\n- ${p.causes.join(
            "\n- "
          )}\n\n` +
          `💡 Giải pháp:\n- ${p.solutions.join(
            "\n- "
          )}`,
      });
    }

    // ================= PRICE =================

    if (result.mode === "price") {
      return res.json({
        success: true,
        reply:
          "💰 Bảng giá:\n\n" +
          result.data
            .map(
              (v) =>
                `• ${v.variantName}: ${Number(
                  v.basePrice
                ).toLocaleString(
                  "vi-VN"
                )} VNĐ`
            )
            .join("\n"),
      });
    }

    // ================= FALLBACK =================

    return res.json({
      success: true,
      reply: result.reply,
    });
  } catch (err) {
    console.error(err);

    return res.json({
      success: false,
      reply:
        "⚠️ AI đang tự phục hồi",
    });
  }
};