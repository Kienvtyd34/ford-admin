export const normalizeText = (text = "") => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

export const normalizeMoney = (price = 0) => {
  return Number(price).toLocaleString("vi-VN");
};