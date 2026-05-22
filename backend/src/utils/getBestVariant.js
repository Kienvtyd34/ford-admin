export const getBestVariant = (vehicle) => {
  if (!vehicle?.variants?.length) return null;

  return (
    vehicle.variants.find((v) => v.basePrice) ||
    vehicle.variants[0] ||
    null
  );
};