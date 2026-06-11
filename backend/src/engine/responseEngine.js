import * as vehicleService from "../services/vehicleService.js";
import * as inventoryService from "../services/inventoryService.js";
import * as newsService from "../services/newsService.js";
import * as problemService from "../services/problemService.js";

export const generateResponse = async ({ intent, entities, message }) => {

  // normalize fallback
  const safeText = message || "";

  switch (intent) {

    // =========================
    // 💰 PRICE QUERY (FULL LOGIC)
    // =========================
    case "PRICE_QUERY": {

      const variant = await vehicleService.getVariant(entities.variantName);

      if (!variant && entities.modelName) {

        const variants = await vehicleService.getVariantsByModel(entities.modelName);

        if (!variants.length) {
          return "❌ Không tìm thấy dòng xe anh/chị yêu cầu.";
        }

        return (
          `🚗 Ford ${entities.modelName}\n\n` +
          variants.map(v =>
            `• ${v.variantName}: ${v.basePrice.toLocaleString("vi-VN")} VNĐ`
          ).join("\n") +
          "\n\nAnh/chị muốn em tư vấn bản phù hợp không ạ?"
        );
      }

      if (!variant) {
        return "Dạ anh/chị vui lòng cho em biết rõ phiên bản xe ạ.";
      }

      return (
        `💰 BÁO GIÁ CHÍNH HÃNG\n` +
        `──────────────────\n` +
        `🚗 ${variant.modelId.name} ${variant.variantName}\n` +
        `💵 Giá: ${variant.basePrice.toLocaleString("vi-VN")} VNĐ\n` +
        `──────────────────\n` +
        `Anh/chị muốn em báo giá lăn bánh không ạ?`
      );
    }

    // =========================
    // 📦 STOCK QUERY (FULL LOGIC + COLOR + MULTI CASE)
    // =========================
    case "STOCK_QUERY": {

      const variant = await vehicleService.getVariant(entities.variantName);

      if (!variant && entities.modelName) {
        return "Dạ anh/chị cho em xin phiên bản cụ thể để kiểm tra kho ạ.";
      }

      if (!variant) return "Không tìm thấy xe trong hệ thống.";

      const stock = await inventoryService.getStockByVariant(variant._id);

      // CASE: hỏi màu còn hàng
      if (
        safeText.includes("mau nao") ||
        safeText.includes("con mau nao") ||
        safeText.includes("mau gi con")
      ) {

        const colors = {};

        stock.items.forEach(i => {
          const c = i.colorId?.name;
          if (!c) return;
          colors[c] = (colors[c] || 0) + 1;
        });

        return (
          `🎨 MÀU XE CÒN TRONG KHO\n\n` +
          Object.entries(colors)
            .map(([c, q]) => `• ${c}: ${q} xe`)
            .join("\n")
        );
      }

      // CASE: stock thường
      return (
        `📦 TỒN KHO XE\n` +
        `──────────────────\n` +
        `🚗 ${variant.variantName}\n` +
        `📊 Còn: ${stock.count} xe\n` +
        `──────────────────\n` +
        `Anh/chị muốn xem màu hoặc hình thực tế không ạ?`
      );
    }

    // =========================
    // 🎨 COLOR QUERY (FULL LOGIC LIKE YOUR OLD CONTROLLER)
    // =========================
    case "COLOR_QUERY": {

      const variant = await vehicleService.getVariant(entities.variantName);

      if (!variant && entities.modelName) {

        const variants = await vehicleService.getVariantsByModel(entities.modelName);

        const colorsSet = new Set();

        for (const v of variants) {
          const colors = await inventoryService.getColorsByVariant(v._id);
          colors.forEach(c => colorsSet.add(c.name));
        }

        return `🎨 ${entities.modelName} có các màu:\n\n` +
          [...colorsSet].map(c => `• ${c}`).join("\n");
      }

      if (!variant) return "Dạ vui lòng cho em biết dòng xe ạ.";

      const colors = await inventoryService.getColorsByVariant(variant._id);

      if (!colors.length) return "Chưa có dữ liệu màu xe.";

      if (safeText.includes("xem") || safeText.includes("hinh")) {

        return (
          `🎨 ${variant.variantName} màu:\n\n` +
          colors.map(c =>
            `• ${c.name}\n${c.images?.join("\n") || ""}`
          ).join("\n\n")
        );
      }

      return (
        `🎨 ${variant.variantName} có ${colors.length} màu:\n` +
        colors.map(c => `• ${c.name}`).join("\n")
      );
    }

    // =========================
    // 🧠 CONSULTING QUERY (FULL LOGIC FROM YOUR OLD SYSTEM)
    // =========================
    case "CONSULTING_QUERY": {

      // OFFROAD
      if (
        safeText.includes("offroad") ||
        safeText.includes("phuot")
      ) {
        return "🚗 Ford Ranger Raptor hoặc Everest Wildtrak là lựa chọn phù hợp off-road.";
      }

      // 7 CHỖ
      if (entities.seats === 7 || safeText.includes("7 cho")) {
        return "🚗 Ford Everest là lựa chọn 7 chỗ rộng rãi phù hợp gia đình.";
      }

      // 5 CHỖ
      if (entities.seats === 5 || safeText.includes("di pho")) {
        return "🚗 Ford Territory là lựa chọn 5 chỗ đi phố tối ưu.";
      }

      // BUDGET LOW
      if (entities.maxBudget && entities.maxBudget <= 1000000000) {
        return "🚗 Tầm dưới 1 tỷ: Ford Territory các phiên bản là phù hợp.";
      }

      // BUDGET HIGH
      if (entities.minBudget >= 1800000000) {
        return "🚗 Tầm 2 tỷ: Everest Platinum hoặc Ranger Raptor.";
      }

      return (
        "🚗 Em gợi ý:\n" +
        "• Territory (đi phố)\n" +
        "• Everest (gia đình 7 chỗ)\n" +
        "• Ranger (bán tải)\n\n" +
        "Anh/chị muốn em so sánh chi tiết không ạ?"
      );
    }

    // =========================
    // 🛠 TECHNICAL SUPPORT (MERGED EXACT MATCH + FUZZY LOGIC STYLE)
    // =========================
    case "TECHNICAL_SUPPORT": {

      const problems = await problemService.getAll();

      let best = null;
      let max = 0;

      for (const p of problems) {
        for (const s of p.symptoms) {

          if (safeText.includes(s)) {
            return `🛠 Lỗi: ${p.title}\nNguyên nhân: ${p.causes.join(", ")}\nCách xử lý: ${p.solutions.join(", ")}`;
          }

          const score = (safeText.length / (s.length + 1)) * 0.1;

          if (score > max) {
            max = score;
            best = p;
          }
        }
      }

      if (best) {
        return `🛠 ${best.title}\nNguyên nhân: ${best.causes.join(", ")}`;
      }

      return "Dạ hệ thống chưa xác định được lỗi, anh/chị mô tả thêm giúp em ạ.";
    }

    // =========================
    // 📰 NEWS QUERY
    // =========================
    case "NEWS_QUERY": {

      const news = await newsService.getLatestNews();

      if (!news) return "Chưa có tin tức mới.";

      return (
        `📢 ${news.title}\n` +
        `${news.summary || ""}`
      );
    }

    // =========================
    // DEFAULT
    // =========================
    default:
      return "Dạ anh/chị cần hỗ trợ giá xe, tồn kho hay tư vấn dòng xe ạ?";
  }
};