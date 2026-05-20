import { chatRouter } from "../../ai/router.js";
import { saveMemory } from "../../ai/memoryEngine.js";

export const chatController = async (
  req,
  res
) => {

  try {

    const {
      message,
      userId = "guest",
    } = req.body;

    // =========================
    // VALIDATE
    // =========================

    if (!message?.trim()) {

      return res.json({
        success: false,
        reply: "Vui lòng nhập nội dung",
      });
    }

    // =========================
    // AI ROUTER
    // =========================

    const result =
      await chatRouter(
        message,
        userId
      );

    // =========================
    // SAVE USER MEMORY
    // =========================

    await saveMemory(
      userId,
      "user",
      message
    );

    // =========================
    // SALES MODE
    // =========================

    if (
      result.mode === "sales" &&
      result.data
    ) {

      const v = result.data;

      const reply =
        `🚗 Xe phù hợp cho anh/chị:\n\n` +
        `👉 ${v.name || "Ford"}\n` +
        `👥 ${v.seats || "?"} chỗ (${v.type || "SUV"})\n\n` +
        `💡 Anh/chị muốn:\n` +
        `• Báo giá\n` +
        `• Trả góp\n` +
        `• Đăng ký lái thử`;

      // SAVE BOT MEMORY

      await saveMemory(
        userId,
        "assistant",
        reply
      );

      return res.json({
        success: true,
        reply,
      });
    }

    // =========================
    // PROBLEM MODE
    // =========================

    if (
      result.mode === "problem" &&
      result.data
    ) {

      const p = result.data;

      const causes =
        Array.isArray(p.causes)
          ? p.causes.join("\n- ")
          : "Đang cập nhật";

      const solutions =
        Array.isArray(p.solutions)
          ? p.solutions.join("\n- ")
          : "Liên hệ kỹ thuật viên";

      const reply =
        `🔧 ${p.title || "Lỗi xe"}\n\n` +
        `📌 Nguyên nhân:\n- ${causes}\n\n` +
        `💡 Giải pháp:\n- ${solutions}`;

      // SAVE BOT MEMORY

      await saveMemory(
        userId,
        "assistant",
        reply
      );

      return res.json({
        success: true,
        reply,
      });
    }

    // =========================
    // PRICE MODE
    // =========================

    if (
      result.mode === "price"
    ) {

      if (
        !result.data ||
        result.data.length === 0
      ) {

        return res.json({
          success: true,
          reply:
            "Hiện chưa tìm thấy bảng giá phù hợp",
        });
      }

      const reply =
        "💰 Bảng giá:\n\n" +
        result.data
          .map(
            (v) =>
              `• ${v.variantName}: ${Number(
                v.basePrice || 0
              ).toLocaleString(
                "vi-VN"
              )} VNĐ`
          )
          .join("\n");

      // SAVE BOT MEMORY

      await saveMemory(
        userId,
        "assistant",
        reply
      );

      return res.json({
        success: true,
        reply,
      });
    }

    // =========================
    // FALLBACK
    // =========================

    const fallbackReply =
      result.reply ||
      "Anh/chị cần xe gia đình, SUV hay bán tải ạ?";

    await saveMemory(
      userId,
      "assistant",
      fallbackReply
    );

    return res.json({
      success: true,
      reply: fallbackReply,
    });

  } catch (err) {

    console.error(
      "CHAT CONTROLLER ERROR:",
      err
    );

    return res.json({
      success: false,
      reply:
        "⚠️ Hệ thống AI đang bảo trì",
    });
  }
};