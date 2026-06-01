import price from "../pipelines/price.pipeline.js";
import suggestion from "../pipelines/suggestion.pipeline.js";
import compare from "../pipelines/compare.pipeline.js";
import feature from "../pipelines/feature.pipeline.js";
import inventory from "../pipelines/inventory.pipeline.js";
import tech from "../pipelines/tech.pipeline.js";

export const router = async (intent, entities, message) => {
  try {
    switch (intent) {
      case "PRICE":
        return await price(entities);

      case "SUGGEST":
        return await suggestion(entities);

      case "COMPARE":
        return await compare(entities);

      case "FEATURE":
        return await feature(entities);

      case "INVENTORY":
        return await inventory(entities);

      case "TECH":
        return await tech(message);

      default:
        return null;
    }
  } catch (err) {
    console.error("ROUTER_ERROR:", err);

    return {
      intent: "ERROR",
      message: "⚠️ Hệ thống đang xử lý quá tải, vui lòng thử lại",
    };
  }
};

export default router;