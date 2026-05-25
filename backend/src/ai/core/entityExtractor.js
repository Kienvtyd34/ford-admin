import Fuse from "fuse.js";

import VehicleModel from "../../models/VehicleModel.js";
import Variant from "../../models/Variant.js";
import VehicleColor from "../../models/VehicleColor.js";

import { normalize } from "../../../src/utils/normalize.js";

let cache = {
  models: [],
  variants: [],
  colors: [],
  lastUpdate: 0,
};

const CACHE_TIME = 1000 * 60 * 5;

const loadDatabaseEntities = async () => {
  const now = Date.now();

  if (
    now - cache.lastUpdate <
    CACHE_TIME
  ) {
    return cache;
  }

  const [models, variants, colors] =
    await Promise.all([
      VehicleModel.find(),
      Variant.find(),
      VehicleColor.find(),
    ]);

  cache.models = models;
  cache.variants = variants;
  cache.colors = colors;
  cache.lastUpdate = now;

  return cache;
};

export const extractEntities = async (
  message = ""
) => {
  const text = normalize(message);

  const db =
    await loadDatabaseEntities();

  const entities = {
    model: null,
    variant: null,
    color: null,
    compareModels: [],
    budget: null,
    seats: null,
    tags: [],
  };

  // =========================
  // MODELS
  // =========================

  for (const model of db.models) {
    const fullName = normalize(
      model.name
    );

    const shortName = fullName
      .replace("ford ", "")
      .trim();

    if (
      text.includes(fullName) ||
      text.includes(shortName)
    ) {
      entities.compareModels.push(
        model
      );
    }
  }

  if (entities.compareModels[0]) {
    entities.model =
      entities.compareModels[0];
  }

  // =========================
  // VARIANT
  // =========================

  const variantFuse = new Fuse(
    db.variants,
    {
      keys: ["variantName"],
      threshold: 0.4,
    }
  );

  const variantResult =
    variantFuse.search(text);

  if (variantResult.length) {
    entities.variant =
      variantResult[0].item;
  }

  // =========================
  // COLOR
  // =========================

  const colorFuse = new Fuse(
    db.colors,
    {
      keys: ["name"],
      threshold: 0.4,
    }
  );

  const colorResult =
    colorFuse.search(text);

  if (colorResult.length) {
    entities.color =
      colorResult[0].item;
  }

  // =========================
  // BUDGET
  // =========================

  const budgetRegex =
    /(duoi|tam)\s+(\d+)\s*(ty|trieu)/i;

  const budgetMatch =
    text.match(budgetRegex);

  if (budgetMatch) {
    let value = Number(
      budgetMatch[2]
    );

    if (budgetMatch[3] === "ty") {
      value *= 1000000000;
    }

    if (
      budgetMatch[3] ===
      "trieu"
    ) {
      value *= 1000000;
    }

    entities.budget = value;
  }

  // =========================
  // SEATS
  // =========================

  if (text.includes("7 cho")) {
    entities.seats = 7;
  }

  if (text.includes("5 cho")) {
    entities.seats = 5;
  }

  // =========================
  // TAGS
  // =========================

  if (text.includes("gia dinh")) {
    entities.tags.push("gia dinh");
  }

  if (text.includes("du lich")) {
    entities.tags.push("du lich");
  }

  if (text.includes("cong trinh")) {
    entities.tags.push("cong trinh");
  }

  if (text.includes("di pho")) {
    entities.tags.push("di pho");
  }

  if (text.includes("tiet kiem")) {
    entities.tags.push("tiet kiem");
  }

  if (text.includes("ban tai")) {
    entities.tags.push("ban tai");
  }

  return entities;
};

export default extractEntities;
