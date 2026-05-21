export const specEngine = (vehicle) => {

  if (!vehicle) return null;

  return {
    name: vehicle.name,
    specs: vehicle.specs,
    seats: vehicle.seats,
    type: vehicle.type
  };
};