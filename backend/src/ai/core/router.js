import price from "../pipelines/price.pipeline.js";
import suggestion from "../pipelines/suggestion.pipeline.js";
import compare from "../pipelines/compare.pipeline.js";
import feature from "../pipelines/feature.pipeline.js";
import inventory from "../pipelines/inventory.pipeline.js";
import tech from "../pipelines/tech.pipeline.js";

export const router = async (intent, entities, message) => {
  switch (intent) {
    case "PRICE": return price(entities);
    case "SUGGEST": return suggestion(entities);
    case "COMPARE": return compare(entities);
    case "FEATURE": return feature(entities);
    case "INVENTORY": return inventory(entities);
    case "TECH": return tech(message);
    default: return null;
  }
};

export default router;