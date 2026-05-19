import VehicleModel from "../src/models/VehicleModel.js";
import Variant from "../src/models/Variant.js";
import VehicleColor from "../src/models/VehicleColor.js";
import Inventory from "../src/models/Inventory.js";
import News from "../src/models/News.js";
import CarProblem from "../src/models/CarProblem.js";

// ======================================
// NORMALIZE
// ======================================

const normalize = (text = "") => {
  return text.toLowerCase().trim();
};

// ======================================
// DETECT CAR
// ======================================

const detectCar = (text) => {

  text = normalize(text);

  if (text.includes("ranger")) return "ranger";
  if (text.includes("everest")) return "everest";
  if (text.includes("territory")) return "territory";
  if (text.includes("transit")) return "transit";

  return null;
};

// ======================================
// MAIN ENGINE
// ======================================

export const processUserQuestion = async (message) => {

  try {

    const text = normalize(message);

    const keyword = detectCar(text);

    // ======================================
    // 1. CHI TIẾT XE
    // ======================================

    if (
      keyword &&
      (
        text === keyword ||
        text.includes("thông số") ||
        text.includes("chi tiết") ||
        text.includes("giới thiệu") ||
        text.includes("xem xe")
      )
    ) {

      const model = await VehicleModel.findOne({
        name: {
          $regex: keyword,
          $options: "i"
        }
      });

      if (!model) {
        return {
          success: false,
          message: "Không tìm thấy dòng xe"
        };
      }

      const variants = await Variant.find({
        modelId: model._id
      });

      let reply = `🚗 ${model.name}\n\n`;

      reply += `📌 Loại xe: ${model.type}\n`;

      if (model.seats) {
        reply += `👨‍👩‍👧‍👦 Số chỗ: ${model.seats}\n`;
      }

      if (model.description) {
        reply += `\n${model.description}\n`;
      }

      reply += `\n🔥 Các phiên bản:\n`;

      variants.forEach(v => {

        reply += `
• ${v.variantName}
💰 ${v.basePrice.toLocaleString()} VNĐ
⚙️ ${v.transmission || "N/A"}
🚘 ${v.driveTrain || "N/A"}
⛽ ${v.fuelType || "N/A"}

`;
      });

      return {
        success: true,
        data: {
          type: "text",
          message: reply
        }
      };
    }

    // ======================================
    // 2. GIÁ XE
    // ======================================

    if (
      text.includes("giá") ||
      text.includes("bao nhiêu")
    ) {

      if (!keyword) {
        return {
          success: false,
          message: "Bạn muốn xem giá dòng xe nào?"
        };
      }

      const model = await VehicleModel.findOne({
        name: {
          $regex: keyword,
          $options: "i"
        }
      });

      if (!model) {
        return {
          success: false,
          message: "Không tìm thấy xe"
        };
      }

      const variants = await Variant.find({
        modelId: model._id
      });

      let reply = `💰 Giá xe ${model.name}\n\n`;

      variants.forEach(v => {

        reply += `
• ${v.variantName}
💵 ${v.basePrice.toLocaleString()} VNĐ

`;
      });

      return {
        success: true,
        data: {
          type: "text",
          message: reply
        }
      };
    }

    // ======================================
    // 3. MÀU XE
    // ======================================

    if (
      text.includes("màu")
    ) {

      if (!keyword) {
        return {
          success: false,
          message: "Bạn muốn xem màu xe nào?"
        };
      }

      const model = await VehicleModel.findOne({
        name: {
          $regex: keyword,
          $options: "i"
        }
      });

      if (!model) {
        return {
          success: false,
          message: "Không tìm thấy xe"
        };
      }

      const variants = await Variant.find({
        modelId: model._id
      });

      const variantIds = variants.map(v => v._id);

      const colors = await VehicleColor.find({
        variantId: {
          $in: variantIds
        }
      });

      if (!colors.length) {
        return {
          success: false,
          message: "Hiện chưa có màu xe"
        };
      }

      let reply = `🎨 Màu xe ${model.name}\n`;

      colors.forEach(c => {
        reply += `\n• ${c.name}`;
      });

      return {
        success: true,
        data: {
          type: "text",
          message: reply
        }
      };
    }

    // ======================================
    // 4. TỒN KHO
    // ======================================

    if (
      text.includes("còn hàng") ||
      text.includes("trong kho") ||
      text.includes("còn xe")
    ) {

      if (!keyword) {
        return {
          success: false,
          message: "Bạn muốn kiểm tra xe nào?"
        };
      }

      const model = await VehicleModel.findOne({
        name: {
          $regex: keyword,
          $options: "i"
        }
      });

      if (!model) {
        return {
          success: false,
          message: "Không tìm thấy xe"
        };
      }

      const variants = await Variant.find({
        modelId: model._id
      });

      const variantIds = variants.map(v => v._id);

      const count =
        await Inventory.countDocuments({
          variantId: {
            $in: variantIds
          },
          status: "Trong kho"
        });

      return {
        success: true,
        data: {
          type: "text",
          message: `🚗 ${model.name} hiện còn ${count} xe trong kho`
        }
      };
    }

    // ======================================
    // 5. GỢI Ý XE
    // ======================================

    if (
      text.includes("dưới 1 tỷ") ||
      text.includes("xe gia đình") ||
      text.includes("7 chỗ") ||
      text.includes("suv") ||
      text.includes("tư vấn") ||
      text.includes("gợi ý")
    ) {

      let filter = {};

      const variants = await Variant
        .find()
        .populate("modelId");

      let result = variants;

      // dưới 1 tỷ
      if (text.includes("1 tỷ")) {

        result = result.filter(
          v => v.basePrice <= 1000000000
        );
      }

      // 7 chỗ
      if (text.includes("7 chỗ")) {

        result = result.filter(
          v => v.modelId?.seats >= 7
        );
      }

      // SUV
      if (text.includes("suv")) {

        result = result.filter(
          v => v.modelId?.type === "SUV"
        );
      }

      if (!result.length) {

        return {
          success: false,
          message: "Không tìm thấy xe phù hợp"
        };
      }

      let reply = "🚗 Gợi ý xe phù hợp:\n";

      result.slice(0, 5).forEach(v => {

        reply += `
• ${v.modelId?.name} ${v.variantName}
💰 ${v.basePrice.toLocaleString()} VNĐ
`;
      });

      return {
        success: true,
        data: {
          type: "text",
          message: reply
        }
      };
    }

    // ======================================
    // 6. TIN TỨC
    // ======================================

    if (
      text.includes("tin tức") ||
      text.includes("khuyến mãi")
    ) {

      const news = await News.find()
        .sort({ createdAt: -1 })
        .limit(5);

      let reply = "📰 Tin mới nhất:\n";

      news.forEach(n => {

        reply += `
• ${n.title}
`;
      });

      return {
        success: true,
        data: {
          type: "text",
          message: reply
        }
      };
    }

    // ======================================
    // 7. LỖI XE
    // ======================================

    const problems = await CarProblem.find();

    const found = problems.find(p => {

      const title = p.title.toLowerCase();

      return (
        text.includes(title) ||
        p.symptoms.some(s =>
          text.includes(
            s.toLowerCase()
          )
        )
      );
    });

    if (found) {

      let reply = `⚠️ ${found.title}\n`;

      reply += `\n🔍 Nguyên nhân:\n`;

      found.causes.forEach(c => {
        reply += `• ${c}\n`;
      });

      reply += `\n🛠️ Khuyến nghị:\n`;

      found.solutions.forEach(s => {
        reply += `• ${s}\n`;
      });

      return {
        success: true,
        data: {
          type: "text",
          message: reply
        }
      };
    }

    // ======================================
    // DEFAULT
    // ======================================

    return {
      success: true,
      data: {
        type: "text",
        message:
          "Tôi có thể tư vấn xe Ford, báo giá, kiểm tra tồn kho, màu xe, khuyến mãi và hỗ trợ lỗi kỹ thuật 🚗"
      }
    };

  } catch (err) {

    console.log(err);

    return {
      success: false,
      message: "Lỗi AI Engine"
    };
  }
};