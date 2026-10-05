import CustomerVehicle from "../models/CustomerVehicle.js";

const editableFields = [
  "licensePlate",
  "vin",
  "vehicleModel",
  "variant",
  "modelName",
  "variantName",
  "color",
  "manufactureYear",
  "currentMileage",
  "notes",
];

const pickEditableFields = (body = {}) =>
  editableFields.reduce((data, field) => {
    if (body[field] !== undefined) data[field] = body[field];
    return data;
  }, {});

export const getMyVehicles = async (req, res) => {
  try {
    const vehicles = await CustomerVehicle.find({
      user: req.user._id,
      isActive: true,
    })
      .populate("vehicleModel", "name brand type")
      .populate("variant", "variantName")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyVehicleById = async (req, res) => {
  try {
    const vehicle = await CustomerVehicle.findOne({
      _id: req.params.id,
      user: req.user._id,
      isActive: true,
    })
      .populate("vehicleModel", "name brand type")
      .populate("variant", "variantName");

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy xe của bạn",
      });
    }

    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createMyVehicle = async (req, res) => {
  try {
    const data = pickEditableFields(req.body);

    if (!data.licensePlate && !data.vin) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp biển số hoặc số VIN",
      });
    }

    const vehicle = await CustomerVehicle.create({
      ...data,
      user: req.user._id,
    });

    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    const duplicate = error.code === 11000;
    res.status(duplicate ? 409 : 400).json({
      success: false,
      message: duplicate
        ? "Biển số hoặc số VIN đã tồn tại"
        : error.message,
    });
  }
};

export const updateMyVehicle = async (req, res) => {
  try {
    const vehicle = await CustomerVehicle.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, isActive: true },
      pickEditableFields(req.body),
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy xe của bạn",
      });
    }

    res.json({ success: true, data: vehicle });
  } catch (error) {
    const duplicate = error.code === 11000;
    res.status(duplicate ? 409 : 400).json({
      success: false,
      message: duplicate
        ? "Biển số hoặc số VIN đã tồn tại"
        : error.message,
    });
  }
};

export const deactivateMyVehicle = async (req, res) => {
  try {
    const vehicle = await CustomerVehicle.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy xe của bạn",
      });
    }

    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
