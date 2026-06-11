import * as vehicleService from "../services/vehicleService.js";
import * as inventoryService from "../services/inventoryService.js";
import * as newsService from "../services/newsService.js";
import * as problemService from "../services/problemService.js";

export const generateResponse = async ({ intent, entities, message }) => {
  const safeText = (message || "").toLowerCase();

  switch (intent) {

    // ================= PRICE =================
    case "PRICE_QUERY": {

      const result = await vehicleService.getVariant(entities.variantName);

      if (!result && entities.modelName) {
        const list = await vehicleService.getVariantsByModel(entities.modelName);

        if (!list.length)
          return "❌ Không tìm thấy dòng xe.";

        return (
          `🚗 Ford ${entities.modelName}\n\n` +
          list.map(v =>
            `• ${v.variantName}: ${v.basePrice.toLocaleString("vi-VN")} VNĐ`
          ).join("\n")
        );
      }

      if (!result)
        return "Dạ vui lòng cho em biết phiên bản xe ạ.";

      return (
        `💰 BÁO GIÁ\n` +
        `🚗 ${result.modelId.name} ${result.variantName}\n` +
        `💵 ${result.basePrice.toLocaleString("vi-VN")} VNĐ`
      );
    }

    // ================= STOCK =================
    case "STOCK_QUERY": {

      const variant = await vehicleService.getVariant(entities.variantName);

      if (!variant)
        return "Dạ anh/chị cho em xin phiên bản ạ.";

      const stock = await inventoryService.getStockByVariant(variant._id);

      return (
        `📦 TỒN KHO\n` +
        `🚗 ${variant.variantName}\n` +
        `📊 ${stock.count} xe`
      );
    }

    // ================= COLOR =================
    case "COLOR_QUERY": {

      const variant = await vehicleService.getVariant(entities.variantName);

      if (!variant)
        return "Dạ cho em xin dòng xe ạ.";

      const colors = await inventoryService.getColorsByVariant(variant._id);

      return (
        `🎨 MÀU XE ${variant.variantName}\n` +
        colors.map(c => `• ${c.name}`).join("\n")
      );
    }

    // ================= CONSULT =================
    case "CONSULTING_QUERY": {

      if (entities.seats === 7)
        return "🚗 Ford Everest phù hợp 7 chỗ.";

      if (entities.seats === 5)
        return "🚗 Ford Territory phù hợp đi phố.";

      if (entities.maxBudget <= 1e9)
        return "🚗 Dưới 1 tỷ: Territory.";

      return "🚗 Territory / Everest / Ranger đều phù hợp.";
    }

    // ================= NEWS =================
    case "NEWS_QUERY": {
      const news = await newsService.getLatestNews();
      return news?.title || "Chưa có tin mới.";
    }

    default:
      return "Dạ anh/chị cần hỗ trợ gì ạ?";
  }
};