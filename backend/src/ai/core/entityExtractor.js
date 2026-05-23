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

  if (now - cache.lastUpdate < CACHE_TIME) {
    return cache;
  }

  const [models, variants, colors] = await Promise.all([
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

export const extractEntities = async (message = "") => {
  const text = normalize(message);

  const db = await loadDatabaseEntities();

  const entities = {
    model: null,
    variant: null,
    color: null,
    budget: null,
    seats: null,
    type: null,
    keywords: [],
  };

  for (const model of db.models) {

  const fullName = normalize(model.name);

  // ford ranger -> ranger
  const shortName = fullName
    .replace("ford ", "")
    .trim();

  if (
    text.includes(fullName) ||
    text.includes(shortName)
  ) {

    entities.model = model;

    break;
  }
}

  for (const variant of db.variants) {
    const name = normalize(variant.variantName);

    if (text.includes(name)) {
      entities.variant = variant;
      break;
    }
  }

  for (const color of db.colors) {
    const name = normalize(color.name);

    if (text.includes(name)) {
      entities.color = color;
      break;
    }
  }

  return entities;
};

export default extractEntities;