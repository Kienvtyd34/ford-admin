import VehicleModel from "../../models/VehicleModel.js";
import Variant from "../../models/Variant.js";
import VehicleColor from "../../models/VehicleColor.js";
import { normalize } from "../../../src/utils/normalize.js";
import Fuse from "fuse.js";

let cache = { models: [], variants: [], colors: [], last: 0 };
const TTL = 5 * 60 * 1000;

const load = async () => {
  if (Date.now() - cache.last < TTL) return cache;

  const [models, variants, colors] = await Promise.all([
    VehicleModel.find(),
    Variant.find().populate("modelId"),
    VehicleColor.find(),
  ]);

  cache = { models, variants, colors, last: Date.now() };
  return cache;
};

export const extractEntities = async (message = "") => {
  const text = normalize(message);
  const db = await load();

  const entities = {
    model: null,
    variant: null,
    color: null,
    compareModels: [],
    compareVariants: [],
    budget: null,
    seats: null,
    feature: null,
    specField: null,
    tags: [],
  };

  // ================= MODEL MATCH (VERY STRONG FIX)
  for (const m of db.models) {
    const names = [
      m.name,
      m.name.replace("Ford", "").trim(),
      ...(m.aliases || []),
      m.slug
    ];

    if (names.some(n => text.includes(normalize(n)))) {
      entities.model = m;
      entities.compareModels.push(m);
      break;
    }
  }

  // fallback fuzzy model
  if (!entities.model) {
    const fuse = new Fuse(db.models, {
      keys: ["name", "aliases", "slug"],
      threshold: 0.35,
    });

    const r = fuse.search(text);
    if (r.length) {
      entities.model = r[0].item;
      entities.compareModels.push(r[0].item);
    }
  }

  // ================= VARIANT
  for (const v of db.variants) {
    const names = [v.variantName, ...(v.aliases || [])];

    if (names.some(n => text.includes(normalize(n)))) {
      entities.variant = v;
      break;
    }
  }

  if (!entities.variant) {
    const fuse = new Fuse(db.variants, {
      keys: ["variantName", "aliases"],
      threshold: 0.3,
    });

    const r = fuse.search(text);
    if (r.length) entities.variant = r[0].item;
  }

  // ================= COLOR
  const colorFuse = new Fuse(db.colors, {
    keys: ["name"],
    threshold: 0.3,
  });

  const c = colorFuse.search(text);
  if (c.length) entities.color = c[0].item;

  // ================= SEATS
  if (text.includes("7 cho")) entities.seats = 7;
  if (text.includes("5 cho")) entities.seats = 5;

  // ================= BUDGET
  const budget = text.match(/(\d+)\s*(ty|trieu)/i);
  if (budget) {
    let val = Number(budget[1]);
    if (budget[2] === "ty") val *= 1e9;
    if (budget[2] === "trieu") val *= 1e6;
    entities.budget = val;
  }

  return entities;
};

export default extractEntities;