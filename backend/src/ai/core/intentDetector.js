import { normalize } from "../../../src/utils/normalize.js";

export const detectIntent = (
  message = ""
) => {

  const text = normalize(message);

  // =========================
  // PRICE QUERY
  // =========================

  if (

    (
      text.includes("gia") ||
      text.includes("bao nhieu") ||
      text.includes("lan banh")
    )

  ) {

    return {
      intent: "PRICE_QUERY",
      confidence: 1,
    };
  }

  // =========================
  // COMPARE
  // =========================

  if (

    text.includes("so sanh") ||
    text.includes("khac nhau") ||
    text.includes("hon gi") ||
    text.includes("nen chon")

  ) {

    return {
      intent: "COMPARE",
      confidence: 1,
    };
  }

  // =========================
  // INVENTORY
  // =========================

  if (

    text.includes("con hang") ||
    text.includes("giao ngay") ||
    text.includes("ton kho") ||
    text.includes("co san") ||
    text.includes("showroom") ||
    text.includes("mau")

  ) {

    return {
      intent: "INVENTORY_CHECK",
      confidence: 1,
    };
  }

  // =========================
  // VEHICLE SPEC
  // =========================

  if (

    text.includes("dong co") ||
    text.includes("may cho") ||
    text.includes("adas") ||
    text.includes("camera 360") ||
    text.includes("4x4") ||
    text.includes("turbo") ||
    text.includes("cua so troi") ||
    text.includes("binh xang") ||
    text.includes("tai duoc")

  ) {

    return {
      intent: "VEHICLE_SPEC",
      confidence: 1,
    };
  }

  // =========================
  // TECH SUPPORT
  // =========================

  if (

    text.includes("khong mat") ||
    text.includes("rung") ||
    text.includes("abs") ||
    text.includes("hao xang") ||
    text.includes("chet binh") ||
    text.includes("dong co") ||
    text.includes("vo lang") ||
    text.includes("kho no")

  ) {

    return {
      intent: "TECH_SUPPORT",
      confidence: 1,
    };
  }

  // =========================
  // VEHICLE SUGGESTION
  // =========================

  if (

    text.includes("goi y") ||
    text.includes("gia dinh") ||
    text.includes("rong rai") ||
    text.includes("du lich") ||
    text.includes("di pho") ||
    text.includes("cong trinh") ||
    text.includes("tiet kiem") ||
    text.includes("phu hop") ||
    text.includes("7 cho") ||
    text.includes("duoi")

  ) {

    return {
      intent:
        "VEHICLE_SUGGESTION",

      confidence: 1,
    };
  }

  // =========================
  // GREETING
  // =========================

  if (

    text === "xin chao" ||
    text === "hello" ||
    text === "hi" ||
    text === "cam on" ||
    text === "tam biet"

  ) {

    return {
      intent: "GREETING",
      confidence: 1,
    };
  }

  return {
    intent: "UNKNOWN",
    confidence: 0,
  };
};

export default detectIntent;