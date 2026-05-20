import VehicleModel from "../../src/models/VehicleModel.js";
import Variant from "../../src/models/Variant.js";
import Inventory from "../../src/models/Inventory.js";
import VehicleColor from "../../src/models/VehicleColor.js";
import CarProblem from "../../src/models/CarProblem.js";
import News from "../../src/models/News.js";

import { embedText } from "../vector/embedding.js";
import {
  addBrainItem,
  brainMap,
} from "../vector/vectorStore.js";

export const buildBrain = async () => {

  console.log("🧠 Building AI Brain...");

  // ================= LOAD DATA =================

  const vehicles =
    await VehicleModel.find();

  const variants =
    await Variant.find();

  const inventory =
    await Inventory.find();

  const colors =
    await VehicleColor.find();

  const problems =
    await CarProblem.find();

  const news =
    await News.find();

  console.log(
    "🚗 VEHICLES:",
    vehicles.length
  );

  console.log(
    "💰 VARIANTS:",
    variants.length
  );

  console.log(
    "🔧 PROBLEMS:",
    problems.length
  );

  // ================= VEHICLES =================

  for (const v of vehicles) {

    console.log(
      "ADD VEHICLE:",
      v.name,
      v.type,
      v.seats
    );

    const text = `
      ${v.name}
      ${String(v.type)}
      ${Number(v.seats)} chỗ
      ${v.description || ""}
      ${v.brand || "Ford"}
    `;

    const vector =
      await embedText(text);

    console.log(
      "VECTOR LENGTH:",
      vector.length
    );

    addBrainItem(vector, {
      type: "vehicle",
      text,
      payload: v,
    });
  }

  // ================= VARIANTS =================

  for (const v of variants) {

    const text = `
      ${v.variantName}
      ${v.basePrice}
      ${v.transmission}
      ${v.driveTrain}
    `;

    const vector =
      await embedText(text);

    addBrainItem(vector, {
      type: "variant",
      text,
      payload: v,
    });
  }

  // ================= INVENTORY =================

  for (const i of inventory) {

    const text = `
      ${i.vin}
      ${i.status}
      ${i.category}
    `;

    const vector =
      await embedText(text);

    addBrainItem(vector, {
      type: "inventory",
      text,
      payload: i,
    });
  }

  // ================= COLORS =================

  for (const c of colors) {

    const text = `
      ${c.name}
      ${c.hexCode}
    `;

    const vector =
      await embedText(text);

    addBrainItem(vector, {
      type: "color",
      text,
      payload: c,
    });
  }

  // ================= PROBLEMS =================

  for (const p of problems) {

    console.log(
      "ADD PROBLEM:",
      p.title
    );

    const text = `
      ${p.title}
      ${p.symptoms.join(" ")}
      ${p.causes.join(" ")}
      ${p.solutions.join(" ")}
    `;

    const vector =
      await embedText(text);

    addBrainItem(vector, {
      type: "problem",
      text,
      payload: p,
    });
  }

  // ================= NEWS =================

  for (const n of news) {

    const text = `
      ${n.title}
      ${n.summary}
      ${n.category}
    `;

    const vector =
      await embedText(text);

    addBrainItem(vector, {
      type: "news",
      text,
      payload: n,
    });
  }

  console.log(
    "🧠 TOTAL INDEXED:",
    brainMap.length
  );

  console.log(
    "✅ AI Brain completed"
  );
};