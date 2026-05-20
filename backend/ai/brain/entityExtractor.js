import { normalizeText } from "./normalizeData.js";

export const extractEntities = (message = "") => {
  const text = normalizeText(message);

  const entities = {
    budget: null,
    seats: null,
    type: null,
    usage: null,
    wantsInstallment: false,
    wantsTestDrive: false,
    symptoms: [],
  };

  // ================= SEATS =================

  if (
    text.includes("7 cho") ||
    text.includes("7 chỗ")
  ) {
    entities.seats = 7;
  }

  if (
    text.includes("5 cho") ||
    text.includes("5 chỗ")
  ) {
    entities.seats = 5;
  }

  // ================= USAGE =================

  if (
    text.includes("gia dinh") ||
    text.includes("family")
  ) {
    entities.usage = "family";
  }

  if (
    text.includes("dich vu") ||
    text.includes("cho khach")
  ) {
    entities.usage = "service";
  }

  // ================= TYPE =================

  if (text.includes("suv")) {
    entities.type = "SUV";
  }

  if (
    text.includes("ban tai") ||
    text.includes("pickup")
  ) {
    entities.type = "Pick-up";
  }

  // ================= INSTALLMENT =================

  if (
    text.includes("tra gop") ||
    text.includes("gop")
  ) {
    entities.wantsInstallment = true;
  }

  // ================= TEST DRIVE =================

  if (
    text.includes("lai thu") ||
    text.includes("test drive")
  ) {
    entities.wantsTestDrive = true;
  }

  // ================= BUDGET =================

  const billionMatch = text.match(
    /(\d+([.,]\d+)?)\s*(ty|tỷ)/
  );

  if (billionMatch) {
    entities.budget =
      parseFloat(
        billionMatch[1].replace(",", ".")
      ) * 1000000000;
  }

  const millionMatch = text.match(
    /(\d+)\s*(trieu|triệu)/
  );

  if (millionMatch) {
    entities.budget =
      parseInt(millionMatch[1]) * 1000000;
  }

  // ================= PROBLEM =================

  const symptomKeywords = [
    "rung",
    "giat",
    "khung",
    "u3000",
    "abs",
    "nong",
    "chet may",
    "khong lanh",
    "dieu hoa",
    "may yeu",
  ];

  symptomKeywords.forEach((s) => {
    if (text.includes(s)) {
      entities.symptoms.push(s);
    }
  });

  return entities;
};