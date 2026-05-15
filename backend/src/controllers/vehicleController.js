import VehicleModel from '../models/VehicleModel.js';
import Variant from '../models/Variant.js';
import Inventory from '../models/Inventory.js';
import Booking from '../models/Booking.js';
import VehicleColor from "../models/VehicleColor.js";

import cloudinary from "../config/cloudinary.js";

// ================= HELPER =================
const safeParse = (data) => {
    if (typeof data === 'string') {
        try { return JSON.parse(data); } catch { return data; }
    }
    return data;
};

// ================= CLOUDINARY HELPER =================

// Lấy public_id từ url cloudinary
const getPublicIdFromUrl = (url) => {
    try {
        const parts = url.split('/');
        const fileName = parts[parts.length - 1];
        const publicId = fileName.split('.')[0];

        // folder/uploads/abc123
        const folderIndex = parts.findIndex(p => p === 'upload');
        const folderParts = parts.slice(folderIndex + 2, parts.length - 1);

        return folderParts.length
            ? `${folderParts.join('/')}/${publicId}`
            : publicId;

    } catch {
        return null;
    }
};

// ================= VEHICLE MODEL =================

// 1. Lấy danh sách dòng xe
export const getVehicles = async (req, res) => {
    try {
        const { type, search, isHot } = req.query;

        let query = {};

        if (search) query.name = { $regex: search, $options: "i" };
        if (type && type !== "Tất cả") query.type = type;
        if (isHot === "true") query.isHot = true;

        const models = await VehicleModel.find(query)
            .sort({ createdAt: -1 })
            .lean();

        const data = await Promise.all(
            models.map(async (model) => {
                const variants = await Variant.find({
                    modelId: model._id
                }).lean();

                const variantsWithColors = await Promise.all(
                    variants.map(async (v) => {
                        const colors = await VehicleColor.find({
                            variantId: v._id
                        });

                        return {
                            ...v,
                            colors
                        };
                    })
                );

                return {
                    ...model,
                    variants: variantsWithColors
                };
            })
        );

        res.json({
            success: true,
            data
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// 2. Chi tiết xe
export const getVehicleDetails = async (req, res) => {
    try {

        const model = await VehicleModel.findById(req.params.id).lean();

        if (!model) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy xe"
            });
        }

        const variants = await Variant.find({
            modelId: model._id
        }).lean();

        const variantsWithColors = await Promise.all(
            variants.map(async (v) => {

                try {

                    const colors = await VehicleColor.find({
                        variantId: v._id
                    }).lean();

                    return {
                        ...v,
                        colors
                    };

                } catch (err) {

                    console.log(err);

                    return {
                        ...v,
                        colors: []
                    };
                }
            })
        );

        res.json({
            success: true,
            data: {
                ...model,
                variants: variantsWithColors
            }
        });

    } catch (err) {

        console.log("DETAIL ERROR:", err);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// 3. Thêm xe
// ================= ADD VEHICLE =================

export const addVehicle = async (req, res) => {
    try {

        let data = { ...req.body };

        // ẢNH THÔNG SỐ
        if (req.files?.imageUrl?.[0]) {

            data.imageUrl =
                req.files.imageUrl[0].path ||
                req.files.imageUrl[0].secure_url;
        }

        // GALLERY
        if (req.files?.images?.length > 0) {

            data.images = req.files.images.map(file =>
                file.path || file.secure_url
            );
        }

        const newModel = await VehicleModel.create(data);

        res.status(201).json({
            success: true,
            data: newModel
        });

    } catch (err) {

        console.log("ADD VEHICLE ERROR:", err);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// ================= UPDATE VEHICLE =================

export const updateVehicle = async (req, res) => {
    try {

        console.log("BODY:", req.body);
        console.log("FILES:", req.files);

        const vehicle = await VehicleModel.findById(req.params.id);

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy xe"
            });
        }

        const updateData = {
            name: req.body.name,
            type: req.body.type,
            seats: req.body.seats,
            description: req.body.description,
            isHot: req.body.isHot
        };

        // ================= IMAGEURL =================

        if (
            req.files &&
            req.files.imageUrl &&
            req.files.imageUrl.length > 0
        ) {

            const imageFile = req.files.imageUrl[0];

            updateData.imageUrl =
                imageFile.path ||
                imageFile.secure_url ||
                imageFile.url;
        }

        // ================= GALLERY =================

        if (
            req.files &&
            req.files.images &&
            req.files.images.length > 0
        ) {

            updateData.images = req.files.images.map(file =>
                file.path ||
                file.secure_url ||
                file.url
            );
        }

        const updated = await VehicleModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true
            }
        );

        res.json({
            success: true,
            data: updated
        });

    } catch (err) {

        console.log("UPDATE VEHICLE ERROR:");
        console.log(err);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};
// 5. Xóa xe
export const deleteVehicle = async (req, res) => {
    try {

        const hasVariant = await Variant.exists({
            modelId: req.params.id,
        });

        if (hasVariant) {
            return res.status(400).json({
                message: "Không thể xóa vì còn phiên bản!",
            });
        }

        const vehicle = await VehicleModel.findById(req.params.id);

        if (!vehicle) {
            return res.status(404).json({
                message: "Không tìm thấy xe"
            });
        }

        // ================= XÓA IMAGEURL =================
        if (vehicle.imageUrl) {
            const publicId = getPublicIdFromUrl(vehicle.imageUrl);

            if (publicId) {
                await cloudinary.uploader.destroy(publicId);
            }
        }

        // ================= XÓA GALLERY =================
        if (vehicle.images?.length > 0) {
            await Promise.all(
                vehicle.images.map(async (img) => {
                    const publicId = getPublicIdFromUrl(img);

                    if (publicId) {
                        await cloudinary.uploader.destroy(publicId);
                    }
                })
            );
        }

        await VehicleModel.findByIdAndDelete(req.params.id);

        res.json({
            success: true
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

// ================= VEHICLE COLOR (CHỈNH SỬA THEO VARIANT) =================

// Thêm màu (Gắn vào variantId)
export const addVehicleColor = async (req, res) => {
    try {
        const { variantId, name, hexCode } = req.body;

        const images = req.files?.map(f => f.path) || [];

        const color = await VehicleColor.create({
            variantId,
            name,
            hexCode,
            images
        });

        res.json({ success: true, data: color });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Lấy màu theo variantId (Sửa tên hàm cho đồng nhất)
export const getColorsByVariant = async (req, res) => {
    try {
        const colors = await VehicleColor.find({ variantId: req.params.variantId });
        res.json({ success: true, data: colors });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Giữ lại tên cũ nhưng logic mới để tránh lỗi Route nếu bạn chưa sửa file Route
export const getColorsByModel = async (req, res) => {
    try {
        // Nếu route vẫn truyền modelId, chúng ta tìm tất cả variants của model đó rồi lấy màu
        const variants = await Variant.find({ modelId: req.params.modelId }).select('_id');
        const variantIds = variants.map(v => v._id);
        const colors = await VehicleColor.find({ variantId: { $in: variantIds } });
        res.json({ success: true, data: colors });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteVehicleColor = async (req, res) => {
    try {
        await VehicleColor.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateVehicleColor = async (req, res) => {
    try {
        const { name, hexCode } = req.body;
        const images = req.files?.map(f => f.path);

        const color = await VehicleColor.findById(req.params.id);
        if (!color) return res.status(404).json({ message: "Không tìm thấy màu" });

        if (name) color.name = name;
        if (hexCode) color.hexCode = hexCode;
        if (images?.length) color.images = images;

        await color.save();

        res.json({ success: true, data: color });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// ================= INVENTORY & DASHBOARD =================

// ================= INVENTORY =================

export const getInventory = async (req, res) => {
    try {
        const { status, category, vin, modelId, variantId } = req.query;

        let query = {};
        if (status) query.status = status;
        if (category) query.category = category;
        if (variantId) query.variantId = variantId;
        if (vin) query.vin = { $regex: vin, $options: "i" };

        let items = await Inventory.find(query)
            .populate({
                path: 'variantId',
                populate: { path: 'modelId' }
            })
            .populate({
                path: 'colorId',
                select: 'name hexCode images'
            })
            .sort({ createdAt: -1 })
            .lean();

        items = items.map(i => ({
            ...i,

            modelName: i.variantId?.modelId?.name || '',
            variantName: i.variantId?.variantName || '',

            // 🔥 CHUẨN ẢNH THEO COLOR + VARIANT
            image: (() => {
                if (i.colorId?.images?.length > 0) {
                    return i.colorId.images[0];
                }
                return i.variantId?.modelId?.imageUrl || '';
            })(),

            color: i.colorId || null
        }));

        if (modelId) {
            items = items.filter(i =>
                i.variantId?.modelId?._id.toString() === modelId
            );
        }

        res.json({
            success: true,
            data: items
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};
export const updateInventory = async (req, res) => {
    try {
        const { importPrice, status, colorId } = req.body;

        const item = await Inventory.findById(req.params.id);
        if (!item) return res.status(404).json({ message: "Không tìm thấy xe" });

        if (importPrice !== undefined) item.importPrice = importPrice;
        if (status) item.status = status;
        if (colorId) item.colorId = colorId;

        await item.save();

        res.json({ success: true, data: item });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const addInventory = async (req, res) => {
    try {
        const { variantId, vin, colorId, importPrice, status, category } = req.body;
        const existed = await Inventory.findOne({ vin });
        if (existed) return res.status(400).json({ message: "VIN đã tồn tại!" });

        const newItem = await Inventory.create({
            variantId, vin: vin.toUpperCase().trim(), colorId,
            importPrice, status, category, importDate: new Date()
        });
        res.status(201).json({ success: true, data: newItem });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getDashboard = async (req, res) => {
    try {
        const inventory = await Inventory.find().lean();
        const bookings = await Booking.find({ orderStatus: 'Completed' }).lean();
        res.json({
            success: true,
            data: {
                totalCars: inventory.length,
                totalValue: inventory.reduce((sum, i) => sum + (i.importPrice || 0), 0),
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const confirmDelivery = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { vin, confirmedBy } = req.body;
        const booking = await Booking.findById(bookingId);
        const item = await Inventory.findOneAndUpdate({ vin, status: "Trong kho" }, { status: "Đã bán" });
        if (!item) return res.status(400).json({ message: "VIN không hợp lệ" });

        booking.orderStatus = 'Completed';
        booking.paymentStatus = 'Paid';
        booking.confirmedBy = confirmedBy;
        await booking.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// ================= VARIANT =================

export const addVariant = async (req, res) => {
    try {

        const { modelId } = req.body;

        const model = await VehicleModel.findById(modelId);

        if (!model) {
            return res.status(404).json({
                success: false,
                message: "Model không tồn tại"
            });
        }

        const variant = await Variant.create(req.body);

        res.status(201).json({
            success: true,
            data: variant
        });

    } catch (err) {

        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};