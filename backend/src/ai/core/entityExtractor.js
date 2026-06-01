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

// =====================================
// LOAD CACHE
// =====================================

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
      Variant.find().populate("modelId"),
      VehicleColor.find(),
    ]);

  cache.models = models;
  cache.variants = variants;
  cache.colors = colors;
  cache.lastUpdate = now;

  return cache;
};

// =====================================
// FEATURE MAP
// =====================================

const featureMap = {

  adas: [
    "adas"
  ],

  camera360: [
    "camera 360",
    "360"
  ],

  sunroof: [
    "cua so troi",
    "sunroof"
  ],

  wirelessCharging: [
    "sac khong day",
    "wireless charging"
  ],

  powerTailgate: [
    "cop dien"
  ],

  ventilatedSeat: [
    "ghe lam mat"
  ],

  appleCarplay: [
    "apple carplay",
    "carplay"
  ],

  androidAuto: [
    "android auto"
  ],

  blindSpot: [
    "canh bao diem mu",
    "diem mu"
  ],

  adaptiveCruise: [
    "adaptive cruise",
    "cruise control"
  ],
};

// =====================================
// SPEC MAP
// =====================================

const specMap = {

  engine: [
    "dong co"
  ],

  horsepower: [
    "cong suat",
    "ma luc",
    "hp"
  ],

  torque: [
    "mo men",
    "mo men xoan",
    "torque"
  ],

  transmission: [
    "hop so"
  ],

  driveTrain: [
    "dan dong"
  ],

  fuelTank: [
    "binh xang"
  ],

  wheelSize: [
    "mam xe"
  ],

  seats: [
    "may cho",
    "so cho"
  ],

  wheelbase: [
    "chieu dai co so"
  ],

  groundClearance: [
    "khoang sang gam"
  ]
};

// =====================================
// MAIN
// =====================================

export const extractEntities = async (
  message = ""
) => {

  const text =
    normalize(message);

  const db =
    await loadDatabaseEntities();

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

  // =====================================
  // MODEL
  // =====================================

  for (const model of db.models) {

    const names = [

      model.name,

      model.name
        .replace("Ford ", "")
        .trim(),

      ...(model.aliases || [])
    ];

    const matched =
      names.some(
        (name) =>
          text.includes(
            normalize(name)
          )
      );

    if (matched) {

      entities.compareModels.push(
        model
      );

      if (!entities.model) {
        entities.model =
          model;
      }
    }
  }

  // =====================================
  // VARIANT
  // =====================================

  const foundVariants = [];

  for (const variant of db.variants) {

    const names = [

      variant.variantName,

      ...(variant.aliases || [])
    ];

    const matched =
      names.some(
        (name) =>
          text.includes(
            normalize(name)
          )
      );

    if (matched) {

      foundVariants.push(
        variant
      );
    }
  }

  if (
    foundVariants.length >= 2
  ) {

    entities.compareVariants =
      foundVariants.slice(
        0,
        2
      );
  }

  if (
    foundVariants.length === 1
  ) {

    entities.variant =
      foundVariants[0];
  }

  // =====================================
  // FUZZY VARIANT
  // =====================================

  if (
    !entities.variant
  ) {

    const variantFuse =
      new Fuse(
        db.variants,
        {
          keys: [
            "variantName",
            "aliases"
          ],

          threshold: 0.35,
        }
      );

    const result =
      variantFuse.search(text);

    if (
      result.length
    ) {

      entities.variant =
        result[0].item;
    }
  }

  // =====================================
  // COLOR
  // =====================================

  const colorFuse =
    new Fuse(
      db.colors,
      {
        keys: ["name"],
        threshold: 0.3,
      }
    );

  const colorResult =
    colorFuse.search(text);

  if (
    colorResult.length
  ) {

    entities.color =
      colorResult[0].item;
  }

  // =====================================
  // FEATURE
  // =====================================

  for (
    const [key, keywords]
    of Object.entries(
      featureMap
    )
  ) {

    const found =
      keywords.some(
        (keyword) =>
          text.includes(keyword)
      );

    if (found) {

      entities.feature =
        key;

      break;
    }
  }

  // =====================================
  // SPEC FIELD
  // =====================================

  for (
    const [field, keywords]
    of Object.entries(
      specMap
    )
  ) {

    const found =
      keywords.some(
        (keyword) =>
          text.includes(keyword)
      );

    if (found) {

      entities.specField =
        field;

      break;
    }
  }

  // =====================================
  // BUDGET
  // =====================================

  const budgetMatch =
    text.match(
      /(\d+(?:\.\d+)?)\s*(ty|trieu)/i
    );

  if (
    budgetMatch
  ) {

    let value =
      Number(
        budgetMatch[1]
      );

    if (
      budgetMatch[2]
        .toLowerCase() ===
      "ty"
    ) {

      value *=
        1000000000;
    }

    if (
      budgetMatch[2]
        .toLowerCase() ===
      "trieu"
    ) {

      value *=
        1000000;
    }

    entities.budget =
      Math.round(value);
  }

  // =====================================
  // SEATS
  // =====================================

  if (
    text.includes("7 cho")
  ) {

    entities.seats = 7;
  }

  if (
    text.includes("5 cho")
  ) {

    entities.seats = 5;
  }

  // =====================================
  // TAGS
  // =====================================

  const tags = [

    "gia dinh",

    "du lich",

    "di pho",

    "tiet kiem",

    "cong trinh",

    "ban tai"
  ];

  tags.forEach(
    (tag) => {

      if (
        text.includes(tag)
      ) {

        entities.tags.push(
          tag
        );
      }
    }
  );

  return entities;
};

export default extractEntities;