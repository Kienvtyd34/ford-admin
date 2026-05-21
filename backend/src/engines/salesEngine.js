import Vehicle from "../models/VehicleModel.js";

export const salesEngine = async (entities) => {
  const query = {};

  if (entities.type) query.type = entities.type;
  if (entities.seats) query.seats = entities.seats;

  const vehicles = await Vehicle.find(query).lean();

  return vehicles
    .map(v => ({
      ...v,
      score:
        (v.isHot ? 3 : 0) +
        (v.type === entities.type ? 2 : 0) +
        (v.seats === entities.seats ? 2 : 0)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
};