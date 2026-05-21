import VehicleModel from "../models/VehicleModel.js";
import VehicleVariant from "../models/Variant.js";

export const getVehicleTool = async (entities = {}) => {
  try {

    const keyword =
      entities.vehicle ||
      entities.model ||
      entities.name ||
      "";

    if (!keyword) {
      return {
        success: false,
        message: "Không tìm thấy tên xe"
      };
    }

    // tìm model xe
    const vehicle = await VehicleModel.findOne({
      name: { $regex: keyword, $options: "i" }
    });

    if (!vehicle) {
      return {
        success: false,
        message: "Không tìm thấy dòng xe"
      };
    }

    // lấy variant rẻ nhất
    const cheapestVariant = await VehicleVariant
      .find({ modelId: vehicle._id })
      .sort({ basePrice: 1 })
      .limit(1);

    const variant = cheapestVariant[0];

    return {
      success: true,

      vehicle: {
        id: vehicle._id,
        name: vehicle.name,
        slug: vehicle.slug,
        brand: vehicle.brand,
        type: vehicle.type,
        seats: vehicle.seats,
        imageUrl: vehicle.imageUrl,
        description: vehicle.description,
        isHot: vehicle.isHot,

        price: variant?.basePrice || 0,

        variantName:
          variant?.variantName || "Đang cập nhật",

        transmission:
          variant?.transmission || "Đang cập nhật",

        driveTrain:
          variant?.driveTrain || "Đang cập nhật",

        fuelType:
          variant?.fuelType || "Đang cập nhật"
      }
    };

  } catch (err) {

    console.log("GET VEHICLE TOOL ERROR:", err);

    return {
      success: false,
      message: "Lỗi lấy dữ liệu xe"
    };
  }
};