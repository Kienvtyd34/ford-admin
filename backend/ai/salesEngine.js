import Variant from "../models/Variant.js";

export const recommendCars = async (session, text) => {

  let cars = await Variant.find().populate("modelId");

  // budget filter
  if (session.profile.budget) {
    cars = cars.filter(c =>
      c.basePrice <= session.profile.budget
    );
  }

  // SUV filter
  if (text.includes("suv")) {
    cars = cars.filter(c => c.modelId.type === "SUV");
  }

  // 7 seats
  if (text.includes("7 chỗ")) {
    cars = cars.filter(c => c.modelId.seats >= 7);
  }

  // ranking (sales logic)
  cars = cars.sort((a, b) => {
    const scoreA =
      (a.modelId.isHot ? 2 : 0) +
      (a.basePrice < 1000000000 ? 2 : 0);

    const scoreB =
      (b.modelId.isHot ? 2 : 0) +
      (b.basePrice < 1000000000 ? 2 : 0);

    return scoreB - scoreA;
  });

  return cars.slice(0, 5);
};