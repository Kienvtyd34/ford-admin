import mongoose from "mongoose";
import dotenv from "dotenv";
import Variant from "./src/models/Variant.js";
import VehicleColor from "./src/models/VehicleColor.js";

dotenv.config();

mongoose.connect(process.env.DATA_URL)
  .then(() => console.log("✅ Connected MongoDB (Seed Colors)"))
  .catch(err => console.error(err));

const colorDataMap = {
  "Territory": ["Đỏ", "Trắng", "Bạc", "Xanh", "Đen"],
  "Everest": {
    "Ambiente": ["Xám", "Bạc", "Đen", "Trắng"],
    "Sport": ["Trắng", "Đen"],
    "Titanium": ["Xám", "Bạc", "Đen", "Trắng", "Nâu"],
    "Platinum": ["Xám", "Nâu", "Đen", "Trắng"]
  },
  "Transit": ["Bạc", "Nâu", "Vàng cát", "Trắng", "Đen"],
  "Ranger": {
    "Wildtrak": ["Đen", "Trắng", "Bạc", "Ghi", "Vàng", "Đỏ"],
    "Sport": ["Trắng", "Ghi bạc", "Đen", "Đỏ"],
    "XLS": ["Đen", "Trắng", "Bạc", "Ghi", "Đỏ"],
    "XL": ["Trắng", "Đỏ", "Đen", "Bạc", "Ghi"]
  },
  "Raptor": ["Trắng", "Xanh dương", "Đen", "Xám", "Cam"],
  "Mustang": ["Đỏ", "Đen", "Trắng", "Xanh lá"]
};

const getColors = (variantName) => {
  if (variantName.includes("Territory")) return colorDataMap["Territory"];
  if (variantName.includes("Transit")) return colorDataMap["Transit"];
  if (variantName.includes("Raptor")) return colorDataMap["Raptor"];
  if (variantName.includes("Mustang")) return colorDataMap["Mustang"];

  if (variantName.includes("Everest")) {
    if (variantName.includes("Ambiente")) return colorDataMap["Everest"]["Ambiente"];
    if (variantName.includes("Sport")) return colorDataMap["Everest"]["Sport"];
    if (variantName.includes("Platinum")) return colorDataMap["Everest"]["Platinum"];
    return colorDataMap["Everest"]["Titanium"];
  }

  if (variantName.includes("Ranger")) {
    if (variantName.includes("Wildtrak")) return colorDataMap["Ranger"]["Wildtrak"];
    if (variantName.includes("Sport")) return colorDataMap["Ranger"]["Sport"];
    if (variantName.includes("XLS")) return colorDataMap["Ranger"]["XLS"];
    return colorDataMap["Ranger"]["XL"];
  }

  return [];
};

const seedColors = async () => {
  try {
    const variants = await Variant.find();

    for (const variant of variants) {
      const colors = getColors(variant.variantName);

      for (const colorName of colors) {
        await VehicleColor.updateOne(
          { variantId: variant._id, name: colorName },
          { $setOnInsert: { images: [] } },
          { upsert: true }
        );
      }

      console.log(`✅ ${variant.variantName}`);
    }

    console.log("🚀 Seed màu thành công!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedColors();