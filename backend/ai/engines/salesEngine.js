import Vehicle from "../../models/Vehicle.js";

export const salesEngine = async (entities) => {

  let query = {};

  if (entities.type) query.type = entities.type;
  if (entities.seats) query.seats = entities.seats;

  const vehicles = await Vehicle.find(query).lean();

  // ranking đơn giản theo isHot
  return vehicles.sort((a, b) => (b.isHot ? 1 : 0) - (a.isHot ? 1 : 0));
};