import stringSimilarity from "string-similarity";
import VehicleModel from "./models/VehicleModel.js";
import Variant from "./models/Variant.js";

export const cleanText = (text = "") => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ");
};

export const processSemanticAI = async (userId, rawMessage) => {
  const message = cleanText(rawMessage);

  let intent = "DEFAULT";

  const entities = {
    modelName: null,
    variantName: null,
    feature: null,
    color: null,
    vin: null,
    minBudget: null,
    maxBudget: null,
    seats: null
  };

  // =========================
  // INTENT DETECTION
  // =========================

  const intentScores = {
    PRICE_QUERY: 0,
    INSTALLMENT_QUERY: 0,
    STOCK_QUERY: 0,
    COLOR_QUERY: 0,
    SPECS_QUERY: 0,
    TECHNICAL_SUPPORT: 0,
    NEWS_QUERY: 0,
    CONSULTING_QUERY: 0
  };

  const keywordWeights = {
    PRICE_QUERY: [
 "gia",
 "bao nhieu",
 "bao gia",
 "gia lan banh",
 "gia niem yet",
 "nhieu tien",
 "bao tien"
],

    INSTALLMENT_QUERY: [
 "tra gop",
 "vay",
 "ngan hang",
 "lai suat",
 "tra truoc"
],

    STOCK_QUERY: [
 "con xe",
 "co xe",
 "san xe",
 "san hang",
 "giao ngay",
 "kho",
 "bai"
],

    COLOR_QUERY: [
 "mau gi",
 "may mau",
 "bang mau",
 "mau do",
 "mau trang",
 "mau den",
 "mau bac",
 "mau xam",
 "mau xanh"
],
SPECS_QUERY: [
  "thong so",
  "dong co",
  "hop so",
  "ma luc",
  "option",
  "adas",
  "an toan",
  "camera 360",
  "cua so troi",
  "sac khong day",
  "fordpass",
  "ghe suoi",
  "ghe lam mat",
  "awd",
  "fwd",
  "4wd",
  "4x4",
  "may xang",
  "may dau",
  "xe dien"
],

    TECHNICAL_SUPPORT: [
 "loi",
 "hong",
 "su co",
 "khong no",
 "khoi",
 "chay dau",
 "giat so",
 "dps6",
 "abs"
],

    NEWS_QUERY: [
 "tin tuc",
 "khuyen mai",
 "su kien",
 "uu dai",
 "ra mat",
 "launch",
 "the he moi"
],

   CONSULTING_QUERY: [

 "tu van",

 "nen mua",

 "xe nao",

 "ford nao",

 "gia dinh",

 "7 cho",

 "5 cho",

 "rong rai",

 "dong nguoi",

 "di du lich",

 "di pho",

 "tai chinh",

 "ngan sach",

 "duoi",

 "tren",

 "1 ty",

 "2 ty",

 "3 ty",

 "cao cap",

 "phu hop"

]
  };

  for (const intent in keywordWeights) {
  keywordWeights[intent] =
    keywordWeights[intent].map(cleanText);
}
  for (const [intentName, keywords] of Object.entries(keywordWeights)) {
    keywords.forEach((kw) => {
      if (message.includes(kw)) {
        intentScores[intentName]++;
      }
    });
  }
  console.log("MESSAGE:", message);
console.log("INTENT SCORES:", intentScores);

  let maxScore = 0;

  for (const [intentName, score] of Object.entries(intentScores)) {
    if (score > maxScore) {
      maxScore = score;
      intent = intentName;
    }
  }

  // =========================
  // MODEL DETECTION
  // =========================

  try {
    const allModels = await VehicleModel.find({});

    for (const model of allModels.sort(
      (a, b) => b.name.length - a.name.length
    )) {
      const targets = [
        model.name,
        ...(model.aliases || [])
      ];

      for (const target of targets) {
        const normalized = cleanText(target);

        if (message.includes(normalized)) {
          entities.modelName = model.name;
          break;
        }
      }

      if (entities.modelName) break;
    }
  } catch (err) {
    console.error(err);
  }

  // =========================
  // VARIANT DETECTION
  // =========================

  try {
    const allVariants = await Variant.find({});

    let bestScore = 0;

    for (const variant of allVariants) {
      const targets = [
        variant.variantName,
        ...(variant.aliases || [])
      ];

      for (const target of targets) {
        const normalized = cleanText(target);

        if (message.includes(normalized)) {
          entities.variantName = variant.variantName;
          bestScore = 1;
          break;
        }

        const score = stringSimilarity.compareTwoStrings(
          message,
          normalized
        );

        if (score > bestScore && score > 0.55) {
          bestScore = score;
          entities.variantName = variant.variantName;
        }
      }
    }
  } catch (err) {
    console.error(err);
  }

  // =========================
  // FEATURE DETECTION
  // =========================

  const featureMap = {
  "camera 360": "camera360",

  "cua so troi": "sunroof",
  "ghe da": "leatherSeat",
  "sac khong day": "wirelessCharging",
  "cop dien": "powerTailgate",

  "adas": "adas",

  "phanh tu dong": "autoEmergencyBrake",

  "giu lan": "laneKeepAssist",

  "diem mu": "blindSpot",

  "adaptive cruise": "adaptiveCruise",

  "fordpass": "fordPass",

  "ghe suoi": "heatedSeat",

  "ghe lam mat": "ventilatedSeat",

  "may xang": "fuel_gasoline",
  "may dau": "fuel_diesel",

  "xe dien": "fuel_electric",
  "dong co dien": "fuel_electric"
};
  for (const [k, v] of Object.entries(featureMap)) {
    if (message.includes(k)) {
      entities.feature = v;
      break;
    }
  }

  if (message.includes("fwd"))
    entities.feature = "drive_fwd";

  if (message.includes("awd"))
    entities.feature = "drive_awd";

  if (message.includes("4wd"))
    entities.feature = "drive_4wd";

  if (message.includes("4x4"))
    entities.feature = "drive_4wd";

  // =========================
  // COLOR
  // =========================

  const colors = [
  "den",
  "do",
  "trang",
  "bac",
  "xam",
  "xanh"
];
  for (const color of colors) {
    if (message.includes(color)) {
      entities.color = color;
      break;
    }
  }

  // =========================
  // VIN
  // =========================

  const vinMatch = message.match(
    /\b[A-HJ-NPR-Z0-9]{17}\b/i
  );

  if (vinMatch) {
    entities.vin = vinMatch[0].toUpperCase();
  }

  // =========================
  // BUDGET
  // =========================

  const numbers = message.match(/\d+/g);

  if (numbers) {
    if (
      numbers.length >= 2 &&
      /(đến|toi|tới|-)/i.test(message)
    ) {
      const val1 = parseInt(numbers[0]);
      const val2 = parseInt(numbers[1]);

      const multiplier =
  message.includes("ty")
    ? 1000000000
    : 1000000;

      entities.minBudget = val1 * multiplier;
      entities.maxBudget = val2 * multiplier;
    } else if (numbers.length === 1) {
      const value = parseInt(numbers[0]);

      const multiplier =
  message.includes("ty")
    ? 1000000000
    : 1000000;

      const budget = value * multiplier;

      if (message.includes("duoi")) {
  entities.maxBudget = budget;
} else if (message.includes("tren")) {
  entities.minBudget = budget;
}
    }
  }

  // =========================
  // SEATS
  // =========================

  if (
  message.includes("5 cho") ||
  message.includes("5 nguoi")
) {
  entities.seats = 5;
}

if (
  message.includes("7 cho") ||
  message.includes("7 nguoi")
) {
  entities.seats = 7;
}

  console.log("MESSAGE:", message);
console.log("INTENT:", intent);
console.log("ENTITIES:", entities);
  return {
    intent,
    entities
  };
};