import stringSimilarity from "string-similarity";
import VehicleModel from "./models/VehicleModel.js";
import Variant from "./models/Variant.js";
import Intent from "./models/Intent.js";

export const cleanText = (text = "") => {
  return text
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ");
};

//intent detection + entity extraction
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
    seats: null,
    purpose: [],
    priority: [],
    compareModels: []
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
    CONSULTING_QUERY: 0,
    IMAGE_QUERY: 0,
    COMPARE_QUERY: 0
  };
const intents = await Intent.find({ active: true });

const keywordWeights = {};

for (const intent of intents) {
  keywordWeights[intent.name] =
    intent.keywords.map(cleanText);
}
  
  for (const [intentName, keywords] of Object.entries(keywordWeights)) {

  keywords.forEach((kw) => {

    const escapedKeyword =
      kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const regex =
      new RegExp(`\\b${escapedKeyword}\\b`, "i");

    if (regex.test(message)) {

      // ưu tiên mạnh cho thông số
      if (
        intentName === "SPECS_QUERY" &&
        [
          "camera 360",
          "cua so troi",
          "adas",
          "fordpass",
          "ghe suoi",
          "ghe lam mat"
        ].includes(kw)
      ) {
        intentScores[intentName] += 3;
      } else {
        intentScores[intentName] += 1;
      }

    }

  });

}
  console.log("MESSAGE:", message);
console.log("INTENT SCORES:", intentScores);

const stockPriorityWords = [
  "con xe",
  "con hang",
  "ton kho",
  "giao ngay",
  "bao nhieu xe",
  "so luong"
];

if (
  stockPriorityWords.some(w =>
   new RegExp(`\\b${w}\\b`).test(message)
  )
) {
  intentScores.STOCK_QUERY += 3;
}
  
const allModels = await VehicleModel.find({});

// =========================
// MODEL MATCHING
// =========================

let bestMatchModel = null;
let bestModelScore = 0;

for (const model of allModels) {

  const targets = [
    model.name,
    ...(model.aliases || [])
  ];

  let matchedModel = null;

for (const model of allModels) {

  const targets = [
    cleanText(model.name),
    ...(model.aliases || []).map(cleanText)
  ];

  if (
    targets.some(target =>
      message.includes(target)
    )
  ) {
    matchedModel = model;
    break;
  }
}

if (matchedModel) {
  entities.modelName = matchedModel.name;
}
}

if (
  bestMatchModel &&
  bestModelScore > 0.45
) {
  entities.modelName =
    bestMatchModel.name;
}
// =========================
// COMPARE MODELS
// =========================

const foundModels = [];

for (const model of allModels) {

   const targets = [

      model.name,

      ...(model.aliases || [])

   ];

   for (const target of targets) {

      const normalized =
      cleanText(target);

      if (
         message.includes(normalized)
      ) {

         foundModels.push(
            model.name
         );

         break;
      }

   }

}

entities.compareModels =
[...new Set(foundModels)];
 // =========================
  // VARIANT DETECTION
  // =========================

const allVariants = await Variant.find({}).populate("modelId");

const tokenize = (text) =>
  cleanText(text)
    .split(" ")
    .filter(Boolean);

// =========================
// 1. FIND MODEL ID CHÍNH XÁC (KHÔNG so string nữa)
// =========================
let modelId = null;

if (entities.modelName) {
  const model = await VehicleModel.findOne({
    name: new RegExp(entities.modelName, "i")
  });

  if (model) {
    modelId = model._id;
  }
}

// =========================
// 2. FILTER VARIANTS THEO MODEL ID (QUAN TRỌNG)
// =========================
const filteredVariants = modelId
  ? allVariants.filter(v =>
      v.modelId?._id?.toString() === modelId.toString()
    )
  : allVariants;

// =========================
// 3. MATCH VARIANT (TOKEN + FUZZY + BOOST)
// =========================
const messageTokens = tokenize(message);

let bestVariant = null;
let bestVariantScore = 0;

for (const variant of filteredVariants) {

  const candidateText = cleanText(
  [
    variant.modelId?.name || "",
    variant.variantName,
    ...(variant.aliases || [])
  ].join(" ")
);

  const candidateTokens = tokenize(candidateText);

  // TOKEN MATCH
  const matchCount = candidateTokens.filter(t =>
    messageTokens.includes(t)
  ).length;

  const tokenScore =
    candidateTokens.length > 0
      ? matchCount / candidateTokens.length
      : 0;

  // FUZZY MATCH
  const fuzzyScore = stringSimilarity.compareTwoStrings(
    message,
    candidateText
  );
//Công thức Sematic match tổng hợp
  let finalScore = tokenScore * 0.7 + fuzzyScore * 0.3;

  // 🔥 BOOST quan trọng
  const variantTokens = tokenize(variant.variantName);

if (variantTokens.some(t => messageTokens.includes(t))) {
  finalScore += 0.25;
}

 let matchBoost = 0;

for (const token of messageTokens) {
  if (candidateTokens.includes(token)) {
    matchBoost += 0.12;
  }
}

finalScore += Math.min(matchBoost, 0.35);
if (
  finalScore > bestVariantScore &&
  (finalScore > 0.30 || messageTokens.length <= 2)
) {
    bestVariantScore = finalScore;
    bestVariant = variant;
}
}
// =========================
// 4. OUTPUT
// =========================
if (bestVariant && bestVariantScore >= 0.55) {
  entities.modelName = bestVariant.modelId?.name;
  entities.variantName = bestVariant.variantName;
}

// =========================
// COMPARE DETECTION
// =========================

const compareWords = [
   "so sanh",
   "khac nhau",
   "chon giua",
   "doi chieu",
   "uu diem",
   "nhuoc diem"
];
  // =========================
  // FEATURE DETECTION
  // =========================
  if (
  message.includes("xang") &&
  message.includes("dau")
) {
  entities.feature = "fuel_info";
}

  const featureMap = {
  "chay xang": "fuel_gasoline",
  "chay dau": "fuel_diesel",
  "he dan dong": "drive_info",
  "dan dong": "drive_info",
  "camera 360": "camera360",
  "cam 360": "camera360",
  "360 do": "camera360",
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
  "xe dien": "electric",
  "dong co dien": "fuel_electric",
  "autoemergencybrake":
      "autoEmergencyBrake",
  "aeb":
      "autoEmergencyBrake",
  "phanh khan cap":
      "autoEmergencyBrake",
};
  for (const [k, v] of Object.entries(featureMap)) {
    if (message.includes(k)) {
      entities.feature = v;
      break;
    }
  }

  const driveKeywords = [
  "he dan dong",
  "dan dong",
  "awd la gi",
  "fwd la gi",
  "4wd la gi",
  "4x4 la gi"
];

const askingDriveTrain =
  driveKeywords.some(k =>
    message.includes(k)
  );

if (askingDriveTrain) {

  if (message.includes("fwd"))
    entities.feature = "drive_fwd";

  if (message.includes("awd"))
    entities.feature = "drive_awd";

  if (message.includes("4wd"))
    entities.feature = "drive_4wd";

  if (message.includes("4x4"))
    entities.feature = "drive_4wd";
}

  // =========================
  // COLOR
  // =========================


 const colorAliases = {
  xanh_la: [
     "xanh la",
     "mau xanh la"
  ],

  xanh_duong: [
     "xanh duong",
     "mau xanh duong",
     "xanh dương",
    "màu xanh dương",
    "blue"
  ],
  do: ["do", "mau do"],
  trang: ["trang", "mau trang"],
  den: ["den", "mau den"],
  bac: ["bac", "mau bac"],
  xanh: ["xanh"],
  xam: ["xam", "mau xam"],
 vang: ["vang", "mau vang", "mau vang gold", "yellow"],
 nau: ["nau", "mau nau", "mau nau dat"],
};

for (const [color, aliases] of Object.entries(colorAliases)) {

   if (
      aliases.some(alias =>
         new RegExp(
            `\\b${cleanText(alias)}\\b`
         ).test(message)
      )
   ) {

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

  
  const budgetAliases = [
   "trieu",
   "tr",
   "cu",
   "chai",
   "ty"
];

// =========================
// BUDGET
// =========================

const numbers = message.match(/\d+/g);
const budgetKeywords = ["trieu", "tr", "ty", "chai", "cu"];
const hasMoneyKeyword = budgetKeywords.some(k => message.includes(k));

if (numbers && numbers.length > 0 && hasMoneyKeyword) {

  let multiplier = 1000000;

  if (message.includes("ty")) {
    multiplier = 1000000000;
  }

  // từ 800 đến 900 triệu
  if (
    numbers.length >= 2 &&
    /(den|toi|tu.*den|-)/i.test(message)
  ) {

    const value1 = parseInt(numbers[0]);
    const value2 = parseInt(numbers[1]);

    entities.minBudget = value1 * multiplier;
    entities.maxBudget = value2 * multiplier;
  }

  // dưới 800 triệu
  else if (message.includes("duoi")) {

    const value = parseInt(numbers[0]);

    entities.maxBudget = value * multiplier;
  }

  // trên 800 triệu
  else if (message.includes("tren")) {

    const value = parseInt(numbers[0]);

    entities.minBudget = value * multiplier;
  }

  // khoảng / tầm 800 triệu
  else {

    const value = parseInt(numbers[0]);

    const budget = value * multiplier;

    entities.minBudget = Math.round(budget * 0.8);
    entities.maxBudget = Math.round(budget * 1.2);
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
  message.includes("7 nguoi") ||
  message.includes("dong nguoi") ||
   message.includes("gia dinh dong nguoi")
) {
  entities.seats = 7;
}


// =========================
// PURPOSE DETECTION
// =========================

const purposeMap = {

   family: [
      "gia dinh",
      "vo con",
      "dua con",
      "tre nho"
   ],

   city: [
      "di pho",
      "di lam",
      "hang ngay"
   ],

   travel: [
      "di du lich",
      "di xa",
      "cao toc"
   ],

   business: [
      "grab",
      "taxi",
      "dich vu"
   ],

   offroad: [
      "offroad",
      "dia hinh",
      "cam trai",
      "phuot"
   ]

};

for (
   const [purpose, keywords]
   of Object.entries(purposeMap)
){
   if(
      keywords.some(
         k => message.includes(k)
      )
   ){
      entities.purpose.push(purpose);
   }

}
const priorityMap = {

   economy: [

      "it hao xang",

      "tiet kiem",

      "tiet kiem nhien lieu"

   ],

   safety: [

      "an toan",

      "adas"

   ],

   luxury: [

      "cao cap",

      "sang trong"

   ],

   technology: [

      "cong nghe",

      "nhieu option"

   ],

   performance: [

      "manh me",

      "bo toc",

      "cam giac lai"

   ],

   space: [

      "rong",

      "rong rai",

      "nhieu cho"

   ]

};
for (
   const [priority, keywords]
   of Object.entries(priorityMap)
){

   if(
      keywords.some(
         k => message.includes(k)
      )
   ){

      entities.priority.push(priority);

   }

}
if (entities.feature) {
  intentScores.SPECS_QUERY += 2;
}

if (entities.color) {
  // chỉ tăng COLOR khi KHÔNG phải hỏi tồn kho
  if (!message.includes("con") && !message.includes("bao nhieu") && !message.includes("ton kho")) {
    intentScores.COLOR_QUERY += 2;
  }
}

if (entities.seats) {
  intentScores.CONSULTING_QUERY += 2;
}

if (
  entities.maxBudget ||
  entities.minBudget
) {
  intentScores.CONSULTING_QUERY += 2;
}
const isStockQuestion =
  /(con\s*(hang|xe)?|ton kho|so luong|bao nhieu xe|con hang|con xe)/i.test(message);

if (isStockQuestion) {
  intentScores.STOCK_QUERY += 10;
}

if (entities.color && isStockQuestion) {
  intentScores.STOCK_QUERY += 3;   // chỉ boost STOCK nhẹ
}

if (entities.color && !isStockQuestion) {
  intentScores.COLOR_QUERY += 10;  // COLOR phải thắng khi không hỏi kho
}

if(
   compareWords.some(
      w => message.includes(w)
   )
){
   intentScores.COMPARE_QUERY += 5;
}
let maxScore = 0;


for (const [intentName, score] of Object.entries(intentScores)) {
  if (score > maxScore) {
    maxScore = score;
    intent = intentName;
  }
}
  console.log("MESSAGE:", message);
  console.log("INTENT:", intent);
  console.log("ENTITIES:", entities);
  return {
    intent,
    entities
  };
};