export const router = async (intent, entities, message) => {
  try {
    switch (intent) {
      case "PRICE": return await (await import("../pipelines/price.pipeline.js")).default(entities);
      case "SUGGEST": return await (await import("../pipelines/suggestion.pipeline.js")).default(entities);
      case "COMPARE": return await (await import("../pipelines/compare.pipeline.js")).default(entities);
      case "FEATURE": return await (await import("../pipelines/feature.pipeline.js")).default(entities);
      case "INVENTORY": return await (await import("../pipelines/inventory.pipeline.js")).default();
      case "TECH": return await (await import("../pipelines/tech.pipeline.js")).default(message);

      default:
        return null;
    }
  } catch (err) {
    return {
      intent: "ROUTER_ERROR",
      message: "❌ Router error",
    };
  }
};

export default router;