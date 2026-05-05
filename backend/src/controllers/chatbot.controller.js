import VehicleModel from "../models/VehicleModel.js";
import Variant from "../models/Variant.js";
import VehicleColor from "../models/VehicleColor.js";
import Inventory from "../models/Inventory.js";

// =========================
// 🔥 HELPER: extract keyword
// =========================
const extractKeyword = (text = "") => {
  text = text.toLowerCase();

  if (text.includes("everest")) return "everest";
  if (text.includes("ranger")) return "ranger";
  if (text.includes("territory")) return "territory";

  return text;
};

// =========================
// 🔥 HELPER: parse AI query
// =========================
const parseQuery = (text = "") => {
  text = text.toLowerCase();

  let maxPrice = null;
  let seats = null;
  let type = null;

  // 💰 giá
  if (text.includes("1 tỷ")) maxPrice = 1000000000;
  if (text.includes("2 tỷ")) maxPrice = 2000000000;
  if (text.includes("500 triệu")) maxPrice = 500000000;

  // 👨‍👩‍👧‍👦 số chỗ
  const match = text.match(/(\d+)\s*chỗ/);
  if (match) seats = Number(match[1]);

  // 🚙 loại xe
  if (text.includes("suv")) type = "SUV";
  if (text.includes("bán tải") || text.includes("pickup")) type = "Pick-up";
  if (text.includes("sedan")) type = "Sedan";

  return { maxPrice, seats, type };
};

// =========================
// 1. Lấy giá xe theo tên
// =========================
export const getCarPrice = async (req, res) => {
  try {
    let { name } = req.query;

    if (!name) {
      return res.json({ message: "Thiếu tên xe" });
    }

    const keyword = extractKeyword(name);

    const model = await VehicleModel.findOne({
      name: { $regex: keyword, $options: "i" }
    });

    if (!model) {
      return res.json({ message: "Không tìm thấy dòng xe" });
    }

    const variants = await Variant.find({ modelId: model._id });

    const result = variants.map(v => ({
      variant: v.variantName,
      price: v.basePrice
    }));

    res.json({
      model: model.name,
      variants: result
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================
// 🔥 2. Gợi ý xe thông minh
// =========================
export const recommendCar = async (req, res) => {
  try {
    let { query, maxPrice, seats, type } = req.query;

    // 👉 nếu có query text → parse AI
    if (query) {
      const parsed = parseQuery(query);
      maxPrice = parsed.maxPrice || maxPrice;
      seats = parsed.seats || seats;
      type = parsed.type || type;
    }

    // =========================
    // 🔥 LỌC THEO GIÁ (Variant)
    // =========================
    let variantFilter = {};

    if (maxPrice) {
      variantFilter.basePrice = { $lte: Number(maxPrice) };
    }

    const variants = await Variant.find(variantFilter).populate("modelId");

    // =========================
    // 🔥 MAP → MODEL
    // =========================
    let models = variants.map(v => v.modelId);

    // =========================
    // 🔥 FILTER thêm
    // =========================
    if (seats) {
      models = models.filter(m => m.seats == seats);
    }

    if (type) {
      models = models.filter(m => m.type === type);
    }

    // =========================
    // 🔥 UNIQUE MODEL
    // =========================
    const uniqueModels = [
      ...new Map(models.map(m => [m._id.toString(), m])).values()
    ];

    if (uniqueModels.length === 0) {
      return res.json({
        message: "Không tìm thấy xe phù hợp",
        suggest: "Bạn thử tăng ngân sách hoặc đổi tiêu chí nhé"
      });
    }

    res.json(uniqueModels.slice(0, 5));

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================
// 3. Lấy chi tiết xe
// =========================
export const getCarDetail = async (req, res) => {
  try {
    const { name } = req.query;

    const keyword = extractKeyword(name);

    const model = await VehicleModel.findOne({
      name: { $regex: keyword, $options: "i" }
    });

    if (!model) {
      return res.json({ message: "Không tìm thấy xe" });
    }

    const variants = await Variant.find({ modelId: model._id });

    res.json({
      model,
      variants
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================
// 4. Kiểm tra xe còn hàng
// =========================
export const checkAvailability = async (req, res) => {
  try {
    const { name } = req.query;

    const keyword = extractKeyword(name);

    const model = await VehicleModel.findOne({
      name: { $regex: keyword, $options: "i" }
    });

    if (!model) {
      return res.json({ message: "Không tìm thấy xe" });
    }

    const variants = await Variant.find({ modelId: model._id });

    const variantIds = variants.map(v => v._id);

    const count = await Inventory.countDocuments({
      variantId: { $in: variantIds },
      status: "Trong kho"
    });

    res.json({
      model: model.name,
      available: count
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================
// 5. Lấy màu xe
// =========================
export const getCarColors = async (req, res) => {
  try {
    const { variantId } = req.query;

    if (!variantId) {
      return res.json({ message: "Thiếu variantId" });
    }

    const colors = await VehicleColor.find({ variantId });

    res.json(colors);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};