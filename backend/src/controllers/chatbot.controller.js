import VehicleModel from "../models/VehicleModel.js";
import Variant from "../models/Variant.js";
import VehicleColor from "../models/VehicleColor.js";
import Inventory from "../models/Inventory.js";

// =========================
// 1. Lấy giá xe theo tên
// =========================
export const getCarPrice = async (req, res) => {
  try {
    let { name } = req.query;

    if (!name) {
      return res.json({ message: "Thiếu tên xe" });
    }

    // 👉 chuẩn hoá text
    name = name.toLowerCase();

    // 👉 lọc keyword (rất quan trọng)
    let keyword = "";

    if (name.includes("everest")) keyword = "everest";
    else if (name.includes("ranger")) keyword = "ranger";
    else if (name.includes("territory")) keyword = "territory";
    else keyword = name;

    console.log("Keyword search:", keyword);

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
// 2. Gợi ý xe theo nhu cầu
// =========================
export const recommendCar = async (req, res) => {
  try {
    const { type, seats } = req.query;

    const query = {};
    if (type) query.type = type;
    if (seats) query.seats = Number(seats);

    const models = await VehicleModel.find(query).limit(5);

    res.json(models);

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

    const model = await VehicleModel.findOne({
      name: { $regex: name, $options: "i" }
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

    const model = await VehicleModel.findOne({
      name: { $regex: name, $options: "i" }
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

    const colors = await VehicleColor.find({ variantId });

    res.json(colors);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};