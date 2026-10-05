import ServicePackage from "../models/ServicePackage.js";

const packageFields = [
  "name",
  "description",
  "category",
  "price",
  "durationMinutes",
  "isActive",
  "displayOrder",
];

const pickPackageFields = (body = {}) =>
  packageFields.reduce((data, field) => {
    if (body[field] !== undefined) data[field] = body[field];
    return data;
  }, {});

export const getActiveServicePackages = async (req, res) => {
  try {
    const packages = await ServicePackage.find({ isActive: true }).sort({
      displayOrder: 1,
      name: 1,
    });
    res.json({ success: true, data: packages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllServicePackages = async (req, res) => {
  try {
    const packages = await ServicePackage.find().sort({
      isActive: -1,
      displayOrder: 1,
      name: 1,
    });
    res.json({ success: true, data: packages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createServicePackage = async (req, res) => {
  try {
    const data = pickPackageFields(req.body);
    const servicePackage = await ServicePackage.create(data);
    res.status(201).json({ success: true, data: servicePackage });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateServicePackage = async (req, res) => {
  try {
    const servicePackage = await ServicePackage.findByIdAndUpdate(
      req.params.id,
      pickPackageFields(req.body),
      { new: true, runValidators: true }
    );

    if (!servicePackage) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy gói dịch vụ",
      });
    }

    res.json({ success: true, data: servicePackage });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deactivateServicePackage = async (req, res) => {
  try {
    const servicePackage = await ServicePackage.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!servicePackage) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy gói dịch vụ",
      });
    }

    res.json({ success: true, data: servicePackage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
