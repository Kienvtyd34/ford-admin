import price from "../pipelines/price.pipeline.js";
import suggestion from "../pipelines/suggestion.pipeline.js";
import compare from "../pipelines/compare.pipeline.js";
import feature from "../pipelines/feature.pipeline.js";
import inventory from "../pipelines/inventory.pipeline.js";
import tech from "../pipelines/tech.pipeline.js";

export const router = async (intent, entities, message) => {
  try {
    switch (intent) {
      case "PRICE": return await price(entities);
      case "SUGGEST": return await suggestion(entities);
      case "COMPARE": return await compare(entities);
      case "FEATURE": return await feature(entities);
      case "INVENTORY": return await inventory(entities);
      case "TECH": return await tech(message);

      default:
        return {
          intent: "FALLBACK",
          message: "🤖 Tôi chưa hiểu rõ yêu cầu, bạn có thể nói rõ hơn không?",
        };
    }
  } catch (e) {
    return {
      intent: "ERROR",
      message: "❌ Router error",
    };
  }
};

export default router;