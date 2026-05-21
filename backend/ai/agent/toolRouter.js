import { salesEngine } from "../engines/salesEngine.js";
import { compareEngine } from "../engines/compareEngine.js";
import { installmentEngine } from "../engines/installmentEngine.js";

export const toolRouter = async (plan, input) => {

  switch (plan.tool) {

    case "salesEngine":
      return await salesEngine(input.entities);

    case "compareEngine":
      return await compareEngine(
        plan.args.a,
        plan.args.b
      );

    case "installmentEngine":
      return installmentEngine(
        plan.args.price,
        plan.args.percent,
        plan.args.months
      );

    default:
      return null;
  }
};