import ServicePackage from "../models/ServicePackage.js";

const DEFAULT_SERVICE_PACKAGES = [
  { name: "Bảo dưỡng cơ bản", category: "Bảo dưỡng định kỳ", price: 990000, durationMinutes: 60, description: "Bảo dưỡng cơ bản dành cho xe định kỳ", isActive: true, displayOrder: 1 },
  { name: "Bảo dưỡng định kỳ", category: "Bảo dưỡng định kỳ", price: 1490000, durationMinutes: 90, description: "Kiểm tra và thay thế vật tư theo lịch bảo dưỡng", isActive: true, displayOrder: 2 },
  { name: "Bảo dưỡng nâng cao", category: "Bảo dưỡng định kỳ", price: 2490000, durationMinutes: 150, description: "Bảo dưỡng nâng cao với kiểm tra toàn diện", isActive: true, displayOrder: 3 },
  { name: "Bảo dưỡng 5.000 km", category: "Bảo dưỡng định kỳ", price: 1990000, durationMinutes: 120, description: "Kiểm tra và bảo dưỡng sau 5.000 km", isActive: true, displayOrder: 4 },
  { name: "Bảo dưỡng 10.000 km", category: "Bảo dưỡng định kỳ", price: 2990000, durationMinutes: 150, description: "Bảo dưỡng định kỳ 10.000 km", isActive: true, displayOrder: 5 },
  { name: "Bảo dưỡng 20.000 km", category: "Bảo dưỡng định kỳ", price: 4990000, durationMinutes: 180, description: "Bảo dưỡng toàn diện 20.000 km", isActive: true, displayOrder: 6 },
  { name: "Bảo dưỡng 40.000 km", category: "Bảo dưỡng định kỳ", price: 6990000, durationMinutes: 240, description: "Bảo dưỡng chuyên sâu 40.000 km", isActive: true, displayOrder: 7 },
  { name: "Bảo dưỡng 60.000 km", category: "Bảo dưỡng định kỳ", price: 8990000, durationMinutes: 300, description: "Bảo dưỡng sâu 60.000 km", isActive: true, displayOrder: 8 },
  { name: "Kiểm tra tổng quát xe", category: "Gói kiểm tra – chẩn đoán", price: 590000, durationMinutes: 45, description: "Kiểm tra tổng quát xe miễn phí/chi tiết", isActive: true, displayOrder: 9 },
  { name: "Kiểm tra xe trước chuyến đi", category: "Gói kiểm tra – chẩn đoán", price: 790000, durationMinutes: 60, description: "Kiểm tra trước khi đi xa hoặc hành trình dài", isActive: true, displayOrder: 10 },
  { name: "Chẩn đoán lỗi điện tử", category: "Gói kiểm tra – chẩn đoán", price: 1390000, durationMinutes: 90, description: "Chẩn đoán hệ thống điện tử và bộ điều khiển", isActive: true, displayOrder: 11 },
  { name: "Kiểm tra động cơ", category: "Gói kiểm tra – chẩn đoán", price: 1090000, durationMinutes: 75, description: "Kiểm tra sức khỏe động cơ và hệ thống nhiên liệu", isActive: true, displayOrder: 12 },
  { name: "Kiểm tra hệ thống điện", category: "Gói kiểm tra – chẩn đoán", price: 850000, durationMinutes: 60, description: "Kiểm tra hệ thống điện, pin và dây điện", isActive: true, displayOrder: 13 },
  { name: "Kiểm tra hệ thống phanh", category: "Gói kiểm tra – chẩn đoán", price: 950000, durationMinutes: 75, description: "Kiểm tra má phanh, dầu phanh và hệ thống phanh", isActive: true, displayOrder: 14 },
  { name: "Kiểm tra gầm và hệ thống treo", category: "Gói kiểm tra – chẩn đoán", price: 1190000, durationMinutes: 90, description: "Kiểm tra gầm và treo cho xe vận hành ổn định", isActive: true, displayOrder: 15 },
  { name: "Sửa chữa hệ thống phanh", category: "Gói sửa chữa", price: 2590000, durationMinutes: 180, description: "Sửa chữa và thay thế phụ tùng hệ thống phanh", isActive: true, displayOrder: 16 },
  { name: "Sửa chữa hệ thống treo", category: "Gói sửa chữa", price: 2990000, durationMinutes: 180, description: "Sửa chữa hệ thống treo và giảm xóc", isActive: true, displayOrder: 17 },
  { name: "Sửa chữa hệ thống lái", category: "Gói sửa chữa", price: 3190000, durationMinutes: 210, description: "Sửa chữa hệ thống lái và bánh xe", isActive: true, displayOrder: 18 },
  { name: "Sửa chữa động cơ", category: "Gói sửa chữa", price: 4990000, durationMinutes: 300, description: "Sửa chữa và hiệu chuẩn động cơ", isActive: true, displayOrder: 19 },
  { name: "Sửa chữa hệ thống điện", category: "Gói sửa chữa", price: 3490000, durationMinutes: 210, description: "Sửa chữa hệ thống điện, cảm biến và ECU", isActive: true, displayOrder: 20 },
  { name: "Sửa chữa điều hòa", category: "Gói sửa chữa", price: 2890000, durationMinutes: 180, description: "Sửa chữa và nạp khí điều hòa", isActive: true, displayOrder: 21 },
  { name: "Thay dầu động cơ", category: "Gói sửa chữa", price: 990000, durationMinutes: 60, description: "Thay dầu động cơ và lọc dầu", isActive: true, displayOrder: 22 },
  { name: "Thay lọc dầu", category: "Gói sửa chữa", price: 450000, durationMinutes: 30, description: "Thay lọc dầu động cơ", isActive: true, displayOrder: 23 },
  { name: "Thay lọc gió động cơ", category: "Gói sửa chữa", price: 550000, durationMinutes: 45, description: "Thay lọc gió động cơ", isActive: true, displayOrder: 24 },
  { name: "Thay lọc gió điều hòa", category: "Gói sửa chữa", price: 650000, durationMinutes: 45, description: "Thay lọc gió điều hòa", isActive: true, displayOrder: 25 },
  { name: "Thay ắc quy", category: "Gói sửa chữa", price: 1800000, durationMinutes: 60, description: "Thay ắc quy xe theo thông số kỹ thuật", isActive: true, displayOrder: 26 },
  { name: "Thay má phanh", category: "Gói sửa chữa", price: 2190000, durationMinutes: 150, description: "Thay má phanh và kiểm tra hệ thống phanh", isActive: true, displayOrder: 27 },
  { name: "Rửa xe", category: "Gói chăm sóc xe", price: 390000, durationMinutes: 60, description: "Rửa xe và bảo dưỡng bề mặt ngoài", isActive: true, displayOrder: 28 },
  { name: "Vệ sinh nội thất", category: "Gói chăm sóc xe", price: 850000, durationMinutes: 90, description: "Vệ sinh nội thất và khoang cabin", isActive: true, displayOrder: 29 },
  { name: "Vệ sinh khoang động cơ", category: "Gói chăm sóc xe", price: 1490000, durationMinutes: 120, description: "Vệ sinh khoang máy và khu vực động cơ", isActive: true, displayOrder: 30 },
  { name: "Vệ sinh hệ thống điều hòa", category: "Gói chăm sóc xe", price: 990000, durationMinutes: 90, description: "Vệ sinh hệ thống điều hòa và lọc gió", isActive: true, displayOrder: 31 },
  { name: "Chăm sóc và đánh bóng xe", category: "Gói chăm sóc xe", price: 1290000, durationMinutes: 120, description: "Đánh bóng và bảo vệ lớp sơn xe", isActive: true, displayOrder: 32 },
  { name: "Khử mùi nội thất", category: "Gói chăm sóc xe", price: 700000, durationMinutes: 60, description: "Khử mùi nội thất và làm sạch không khí", isActive: true, displayOrder: 33 },
  { name: "Chăm sóc lốp và mâm xe", category: "Gói chăm sóc xe", price: 850000, durationMinutes: 60, description: "Vệ sinh lốp, mâm và kiểm tra áp suất", isActive: true, displayOrder: 34 },
  { name: "Kiểm tra xe miễn phí", category: "Gói dịch vụ tiện ích", price: 0, durationMinutes: 30, description: "Kiểm tra nhanh xe và tư vấn ban đầu", isActive: true, displayOrder: 35 },
  { name: "Tư vấn bảo dưỡng", category: "Gói dịch vụ tiện ích", price: 0, durationMinutes: 30, description: "Tư vấn bảo dưỡng và lộ trình chăm sóc xe", isActive: true, displayOrder: 36 },
  { name: "Cứu hộ xe", category: "Gói dịch vụ tiện ích", price: 990000, durationMinutes: 60, description: "Hỗ trợ cứu hộ và chở xe khi gặp sự cố", isActive: true, displayOrder: 37 },
  { name: "Hỗ trợ xe tại nhà", category: "Gói dịch vụ tiện ích", price: 1490000, durationMinutes: 90, description: "Hỗ trợ và kiểm tra xe tại nhà", isActive: true, displayOrder: 38 },
  { name: "Đặt lịch bảo dưỡng", category: "Gói dịch vụ tiện ích", price: 0, durationMinutes: 15, description: "Đặt lịch bảo dưỡng theo mẫu tiện ích", isActive: true, displayOrder: 39 },
  { name: "Nhắc lịch bảo dưỡng định kỳ", category: "Gói dịch vụ tiện ích", price: 0, durationMinutes: 15, description: "Nhắc lịch bảo dưỡng định kỳ cho chủ xe", isActive: true, displayOrder: 40 },
];

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

const ensureDefaultServicePackages = async () => {
  const packages = await ServicePackage.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });

  if (packages.length > 0) {
    return packages;
  }

  const seeded = await ServicePackage.insertMany(DEFAULT_SERVICE_PACKAGES);
  return seeded;
};

export const getActiveServicePackages = async (req, res) => {
  try {
    const packages = await ensureDefaultServicePackages();
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

    if (packages.length === 0) {
      const seeded = await ServicePackage.insertMany(DEFAULT_SERVICE_PACKAGES);
      return res.json({ success: true, data: seeded });
    }

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
