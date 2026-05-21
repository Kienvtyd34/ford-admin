import { salesEngine } from "../engines/salesEngine.js";
import { compareEngine } from "../engines/compareEngine.js";
import { installmentEngine } from "../engines/installmentEngine.js";

export const toolRouter = async (plan, input) => {
  try {
    if (!plan?.tool || plan.tool === "none") return null;

    switch (plan.tool) {

      case "salesEngine":
        return await salesEngine(input.entities);

      case "compareEngine":
        if (!plan.args?.a || !plan.args?.b) return null;
        return await compareEngine(plan.args.a, plan.args.b);

      case "installmentEngine":
        if (!plan.args?.price) return null;
        return installmentEngine(
          plan.args.price,
          plan.args.percent ?? 0.2,
          plan.args.months ?? 84
        );

      default:
        return null;
    }

  } catch (err) {
    console.error("toolRouter error:", err);
    return null;
  }
};