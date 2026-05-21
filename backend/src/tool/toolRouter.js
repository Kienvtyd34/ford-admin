import { getVehicleTool } from "./getVehicleTool.js";

export const toolRouter = async (
  plan,
  { message, entities, context }
) => {

  try {

    // hỏi về xe
    if (
      plan.intent === "vehicle_search" ||
      plan.intent === "vehicle_info"
    ) {

      return await getVehicleTool(entities);
    }

    return {
      success: true,
      message: "Không cần dùng tool"
    };

  } catch (err) {

    console.log("TOOL ROUTER ERROR:", err);

    return {
      success: false,
      message: "Tool router lỗi"
    };
  }
};