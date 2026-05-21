export const extractEntities = (text = "") => {
  text = text.toLowerCase();

  const e = {};

  if (text.includes("suv")) e.type = "SUV";
  if (text.includes("sedan")) e.type = "Sedan";

  if (/7\s*chỗ/.test(text)) e.seats = 7;
  if (/5\s*chỗ/.test(text)) e.seats = 5;

  const budget = text.match(/(\d+)\s*triệu/);
  if (budget) e.budget = Number(budget[1]) * 1_000_000;

  return e;
};