import VehicleModel from "../src/models/VehicleModel.js";
import Variant from "../src/models/Variant.js";
import Inventory from "../src/models/Inventory.js";
import CarProblem from "../src/models/CarProblem.js";
import News from "../src/models/News.js";
import VehicleColor from "../src/models/VehicleColor.js";

import { embedText } from "./embedding.js";

// ===============================
// 1. BUILD UNIFIED BRAIN INDEX
// ===============================
export const buildBrain = async () => {
  const brain = [];

  const models = await VehicleModel.find();
  const variants = await Variant.find();
  const inventory = await Inventory.find();
  const problems = await CarProblem.find();
  const news = await News.find();
  const colors = await VehicleColor.find();

  // ===== VEHICLES =====
  models.forEach((m) => {
    brain.push({
      type: "model",
      id: m._id,
      text: `${m.name} ${m.type} ${m.seats} chỗ ${m.description}`,
      raw: m,
    });
  });

  // ===== VARIANTS =====
  variants.forEach((v) => {
    brain.push({
      type: "variant",
      id: v._id,
      text: `${v.variantName} ${v.basePrice} ${v.driveTrain} ${v.transmission}`,
      raw: v,
    });
  });

  // ===== INVENTORY =====
  inventory.forEach((i) => {
    brain.push({
      type: "inventory",
      id: i._id,
      text: `${i.vin} ${i.status} ${i.category}`,
      raw: i,
    });
  });

  // ===== CAR PROBLEMS =====
  problems.forEach((p) => {
    brain.push({
      type: "problem",
      id: p._id,
      text: `${p.title} ${p.symptoms.join(" ")} ${p.causes.join(" ")} ${p.solutions.join(" ")}`,
      raw: p,
    });
  });

  // ===== NEWS =====
  news.forEach((n) => {
    brain.push({
      type: "news",
      id: n._id,
      text: `${n.title} ${n.summary} ${n.category}`,
      raw: n,
    });
  });

  // ===== COLORS =====
  colors.forEach((c) => {
    brain.push({
      type: "color",
      id: c._id,
      text: `${c.name} ${c.hexCode}`,
      raw: c,
    });
  });

  // EMBED ALL
  for (let i = 0; i < brain.length; i++) {
    brain[i].vector = await embedText(brain[i].text);
  }

  return brain;
};