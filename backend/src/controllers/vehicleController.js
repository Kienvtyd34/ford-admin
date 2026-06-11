import VehicleModel from "../models/VehicleModel.js";
import Variant from "../models/Variant.js";
import Inventory from "../models/Inventory.js";
import Booking from "../models/Booking.js";
import VehicleColor from "../models/VehicleColor.js";

import cloudinary from "../config/cloudinary.js";

// ================= HELPER =================

const getPublicIdFromUrl = (url) => {
  try {

    const urlParts = url.split("/upload/");

    if (urlParts.length < 2) return null;

    let publicIdWithVersion = urlParts[1];

    // remove version
    publicIdWithVersion =
      publicIdWithVersion.replace(/^v\d+\//, "");

    // remove extension
    const publicId =
      publicIdWithVersion.replace(/\.[^/.]+$/, "");

    return publicId;

  } catch (err) {

    console.log("GET PUBLIC ID ERROR:", err);

    return null;
  }
};

// ================= GET VEHICLES =================

export const getVehicles = async (req, res) => {
  try {

    const { type, search, isHot } = req.query;

    let query = {};

    if (search) {
      query.name = {
        $regex: search,
        $options: "i"
      };
    }

    if (type && type !== "Tất cả") {
      query.type = type;
    }

    if (isHot === "true") {
      query.isHot = true;
    }

    const models = await VehicleModel.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const data = await Promise.all(
      models.map(async (model) => {

        const variants = await Variant.find({
          modelId: model._id
        }).lean();

        const variantsWithColors =
          await Promise.all(
            variants.map(async (variant) => {

              const colors =
                await VehicleColor.find({
                  variantId: variant._id
                }).lean();

              return {
                ...variant,
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

    console.log("GET VEHICLES ERROR:", err);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ================= GET VEHICLE DETAILS =================

export const getVehicleDetails = async (req, res) => {
  try {

    const model =
      await VehicleModel.findById(
        req.params.id
      ).lean();

    if (!model) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy xe"
      });
    }

    const variants = await Variant.find({
      modelId: model._id
    }).lean();

    const variantsWithColors =
      await Promise.all(
        variants.map(async (variant) => {

          const colors =
            await VehicleColor.find({
              variantId: variant._id
            }).lean();

          return {
            ...variant,
            colors
          };
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

// ================= ADD VEHICLE =================

export const addVehicle = async (req, res) => {
  try {

    console.log("=== ADD VEHICLE ===");
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    let data = { ...req.body };

    if (req.files?.imageUrl?.[0]) {
      data.imageUrl =
        req.files.imageUrl[0].path ||
        req.files.imageUrl[0].secure_url;
    }

    if (req.files?.images?.length > 0) {
      data.images =
        req.files.images.map(
          file => file.path || file.secure_url
        );
    }

    console.log("DATA CREATE:", data);

    const newVehicle =
      await VehicleModel.create(data);

    res.status(201).json({
      success: true,
      data: newVehicle
    });

  } catch (err) {

    console.log("ADD VEHICLE ERROR:");
    console.log(err);

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

    let data = { ...req.body };

    const vehicle =
      await VehicleModel.findById(
        req.params.id
      );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy xe"
      });
    }

    // ================= UPDATE IMAGEURL =================

    if (req.files?.imageUrl?.[0]) {

      try {

        if (vehicle.imageUrl) {

          const publicId =
            getPublicIdFromUrl(
              vehicle.imageUrl
            );

          if (publicId) {

            console.log(
              "DELETE IMAGEURL:",
              publicId
            );

            await cloudinary.uploader.destroy(
              publicId
            );
          }
        }

      } catch (err) {

        console.log(
          "DELETE IMAGEURL ERROR:",
          err.message
        );
      }

      data.imageUrl =
        req.files.imageUrl[0].path;
    }

    // ================= UPDATE GALLERY =================

    if (req.files?.images?.length > 0) {

      try {

        if (
          vehicle.images &&
          vehicle.images.length > 0
        ) {

          for (const img of vehicle.images) {

            const publicId =
              getPublicIdFromUrl(img);

            if (publicId) {

              console.log(
                "DELETE IMAGE:",
                publicId
              );

              await cloudinary.uploader.destroy(
                publicId
              );
            }
          }
        }

      } catch (err) {

        console.log(
          "DELETE GALLERY ERROR:",
          err.message
        );
      }

      data.images =
        req.files.images.map(
          file => file.path
        );
    }

    const updated =
      await VehicleModel.findByIdAndUpdate(
        req.params.id,
        data,
        { new: true }
      );

    res.json({
      success: true,
      data: updated
    });

  } catch (err) {

    console.log(
      "UPDATE VEHICLE ERROR:"
    );

    console.log(err);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ================= DELETE VEHICLE =================

export const deleteVehicle = async (req, res) => {
  try {

    const hasVariant =
      await Variant.exists({
        modelId: req.params.id
      });

    if (hasVariant) {
      return res.status(400).json({
        success: false,
        message:
          "Không thể xóa vì còn phiên bản!"
      });
    }

    const vehicle =
      await VehicleModel.findById(
        req.params.id
      );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy xe"
      });
    }

    // DELETE IMAGEURL
    if (vehicle.imageUrl) {

      const publicId =
        getPublicIdFromUrl(
          vehicle.imageUrl
        );

      if (publicId) {

        await cloudinary.uploader.destroy(
          publicId
        );
      }
    }

    // DELETE GALLERY
    if (
      vehicle.images &&
      vehicle.images.length > 0
    ) {

      for (const img of vehicle.images) {

        const publicId =
          getPublicIdFromUrl(img);

        if (publicId) {

          await cloudinary.uploader.destroy(
            publicId
          );
        }
      }
    }

    await VehicleModel.findByIdAndDelete(
      req.params.id
    );

    res.json({
      success: true
    });

  } catch (err) {

    console.log("DELETE ERROR:", err);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ================= ADD COLOR =================

export const addVehicleColor = async (req, res) => {
  try {

    const {
      variantId,
      name,
      hexCode
    } = req.body;

    const images =
      req.files?.map(
        file => file.path
      ) || [];

    const color =
      await VehicleColor.create({
        variantId,
        name,
        hexCode,
        images
      });

    res.json({
      success: true,
      data: color
    });

  } catch (err) {

    console.log("ADD COLOR ERROR:", err);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ================= GET COLORS BY VARIANT =================

export const getColorsByVariant = async (req, res) => {
  try {

    const colors =
      await VehicleColor.find({
        variantId: req.params.variantId
      });

    res.json({
      success: true,
      data: colors
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ================= GET COLORS BY MODEL =================

export const getColorsByModel = async (req, res) => {
  try {

    const variants =
      await Variant.find({
        modelId: req.params.modelId
      }).select("_id");

    const variantIds =
      variants.map(v => v._id);

    const colors =
      await VehicleColor.find({
        variantId: {
          $in: variantIds
        }
      });

    res.json({
      success: true,
      data: colors
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ================= UPDATE COLOR =================

export const updateVehicleColor = async (req, res) => {
  try {

    const {
      name,
      hexCode
    } = req.body;

    const images =
      req.files?.map(
        file => file.path
      );

    const color =
      await VehicleColor.findById(
        req.params.id
      );

    if (!color) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy màu"
      });
    }

    if (name) {
      color.name = name;
    }

    if (hexCode) {
      color.hexCode = hexCode;
    }

    if (images?.length > 0) {
      color.images = images;
    }

    await color.save();

    res.json({
      success: true,
      data: color
    });

  } catch (err) {

    console.log("UPDATE COLOR ERROR:", err);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ================= DELETE COLOR =================

export const deleteVehicleColor = async (req, res) => {
  try {

    await VehicleColor.findByIdAndDelete(
      req.params.id
    );

    res.json({
      success: true
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ================= INVENTORY =================

export const getInventory = async (req, res) => {
  try {

    const {
      status,
      category,
      vin,
      modelId,
      variantId
    } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (variantId) {
      query.variantId = variantId;
    }

    if (vin) {
      query.vin = {
        $regex: vin,
        $options: "i"
      };
    }

    let items =
      await Inventory.find(query)
        .populate({
          path: "variantId",
          populate: {
            path: "modelId"
          }
        })
        .populate({
          path: "colorId",
          select: "name hexCode images"
        })
        .sort({
          createdAt: -1
        })
        .lean();

    items = items.map(item => ({
      ...item,

      modelName:
        item.variantId?.modelId?.name || "",

      variantName:
        item.variantId?.variantName || "",

      image:
        item.colorId?.images?.[0] ||
        item.variantId?.modelId?.imageUrl ||
        "",

      color:
        item.colorId || null
    }));

    if (modelId) {

      items = items.filter(
        item =>
          item.variantId?.modelId?._id.toString()
          === modelId
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

// ================= UPDATE INVENTORY =================

export const updateInventory = async (req, res) => {
  try {

    const {
      importPrice,
      status,
      colorId
    } = req.body;

    const item =
      await Inventory.findById(
        req.params.id
      );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy xe"
      });
    }

    if (importPrice !== undefined) {
      item.importPrice = importPrice;
    }

    if (status) {
      item.status = status;
    }

    if (colorId) {
      item.colorId = colorId;
    }

    await item.save();

    res.json({
      success: true,
      data: item
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ================= ADD INVENTORY =================

export const addInventory = async (req, res) => {
  try {

    const {
      variantId,
      vin,
      colorId,
      importPrice,
      status,
      category
    } = req.body;

    const existed =
      await Inventory.findOne({ vin });

    if (existed) {
      return res.status(400).json({
        success: false,
        message: "VIN đã tồn tại!"
      });
    }

    const item =
      await Inventory.create({
        variantId,
        vin: vin.toUpperCase().trim(),
        colorId,
        importPrice,
        status,
        category,
        importDate: new Date()
      });

    res.status(201).json({
      success: true,
      data: item
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ================= DASHBOARD =================

export const getDashboard = async (req, res) => {
  try {

    const inventory =
      await Inventory.find().lean();

    res.json({
      success: true,
      data: {
        totalCars: inventory.length,
        totalValue:
          inventory.reduce(
            (sum, item) =>
              sum + (item.importPrice || 0),
            0
          )
      }
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ================= CONFIRM DELIVERY =================

export const confirmDelivery = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy booking"
      });
    }

    // update inventory
    await Inventory.findByIdAndUpdate(
      booking.vehicle,
      { status: "Đã bán" }
    );

    // 🔥 FIX QUAN TRỌNG
    booking.orderStatus = "Completed";
    booking.paymentStatus = "Paid";
    booking.confirmedBy = req.user._id; // 👈 LẤY TỪ TOKEN

    await booking.save();

    res.json({
      success: true,
      data: booking
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
// ================= ADD VARIANT =================

export const addVariant = async (req, res) => {
  try {

    const { modelId } = req.body;

    const model =
      await VehicleModel.findById(modelId);

    if (!model) {
      return res.status(404).json({
        success: false,
        message: "Model không tồn tại"
      });
    }

    const variant =
      await Variant.create(req.body);

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
// ================= UPDATE VARIANT =================

export const updateVariant = async (req, res) => {
  try {

    console.log("========== UPDATE VARIANT ==========");
    console.log("PARAM ID:", req.params.id);

    console.log(
      "BODY:",
      JSON.stringify(req.body, null, 2)
    );

    const variant =
      await Variant.findById(req.params.id);

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phiên bản",
      });
    }

    const updated =
      await Variant.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    console.log(
      "UPDATED:",
      JSON.stringify(updated, null, 2)
    );

    res.json({
      success: true,
      data: updated,
    });

  } catch (err) {

    console.log(
      "UPDATE VARIANT ERROR:",
      err
    );

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
  // ================= DELETE VARIANT =================

export const deleteVariant =
  async (req, res) => {
    try {

      const inventoryExists =
        await Inventory.exists({
          variantId:
            req.params.id,
        });

      if (inventoryExists) {

        return res.status(400).json({
          success: false,
          message:
            "Không thể xóa vì còn xe trong kho",
        });
      }

      await Variant.findByIdAndDelete(
        req.params.id
      );

      res.json({
        success: true,
      });

    } catch (err) {

      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  };
  // ================= GET VARIANTS BY MODEL =================

export const getVariantsByModel =
  async (req, res) => {
    try {

      const variants =
        await Variant.find({
          modelId:
            req.params.modelId,
        });

      res.json({
        success: true,
        data: variants,
      });

    } catch (err) {

      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  };