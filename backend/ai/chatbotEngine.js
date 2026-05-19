import VehicleModel from "../src/models/VehicleModel.js";
import Variant from "../src/models/Variant.js";
import VehicleColor from "../src/models/VehicleColor.js";
import Inventory from "../src/models/Inventory.js";
import News from "../src/models/News.js";
import CarProblem from "../src/models/CarProblem.js";

const normalize = (text = "") => {
  return text.toLowerCase();
};

const detectCar = (text) => {

  text = normalize(text);

  if (text.includes("ranger")) return "ranger";
  if (text.includes("everest")) return "everest";
  if (text.includes("territory")) return "territory";
  if (text.includes("transit")) return "transit";

  return null;
};

export const processUserQuestion = async (message) => {

  const text = normalize(message);

  // =========================
  // 1. GIÁ XE
  // =========================

  if (
    text.includes("giá") ||
    text.includes("bao nhiêu")
  ) {

    const keyword = detectCar(text);

    if (!keyword) {
      return {
        type: "text",
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
        type: "text",
        message: "Không tìm thấy dòng xe"
      };
    }

    const variants = await Variant.find({
      modelId: model._id
    });

    let reply = `🚗 ${model.name}\n\n`;

    variants.forEach(v => {

      reply += `
• ${v.variantName}
💰 ${v.basePrice.toLocaleString()} VNĐ
`;
    });

    return {
      type: "text",
      message: reply
    };
  }

  // =========================
  // 2. MÀU XE
  // =========================

  if (
    text.includes("màu")
  ) {

    const keyword = detectCar(text);

    const model = await VehicleModel.findOne({
      name: {
        $regex: keyword,
        $options: "i"
      }
    });

    if (!model) {
      return {
        type: "text",
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
        type: "text",
        message: "Hiện chưa có màu xe"
      };
    }

    let reply = `🎨 Màu xe ${model.name}:\n`;

    colors.forEach(c => {
      reply += `\n• ${c.name}`;
    });

    return {
      type: "text",
      message: reply
    };
  }

  // =========================
  // 3. TỒN KHO
  // =========================

  if (
    text.includes("còn hàng") ||
    text.includes("trong kho")
  ) {

    const keyword = detectCar(text);

    const model = await VehicleModel.findOne({
      name: {
        $regex: keyword,
        $options: "i"
      }
    });

    if (!model) {
      return {
        type: "text",
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
      type: "text",
      message: `🚗 ${model.name} hiện còn ${count} xe trong kho`
    };
  }

  // =========================
  // 4. TIN TỨC
  // =========================

  if (
    text.includes("tin tức") ||
    text.includes("khuyến mãi")
  ) {

    const news = await News.find()
      .sort({ createdAt: -1 })
      .limit(3);

    let reply = "📰 Tin mới:\n";

    news.forEach(n => {
      reply += `\n• ${n.title}`;
    });

    return {
      type: "text",
      message: reply
    };
  }

  // =========================
  // 5. LỖI XE
  // =========================

  const problems = await CarProblem.find();

  const found = problems.find(p =>
    text.includes(
      p.title.toLowerCase()
    )
  );

  if (found) {

    let reply = `⚠️ ${found.title}\n`;

    reply += "\nNguyên nhân:";

    found.causes.forEach(c => {
      reply += `\n• ${c}`;
    });

    reply += "\n\nKhuyến nghị:";

    found.solutions.forEach(s => {
      reply += `\n• ${s}`;
    });

    return {
      type: "text",
      message: reply
    };
  }

  // =========================
  // DEFAULT
  // =========================

  return {
    type: "text",
    message:
      "Tôi có thể tư vấn xe, báo giá, kiểm tra tồn kho, màu xe và hỗ trợ lỗi kỹ thuật 🚗"
  };
};