export const mapColors = (car) => {
  if (!car.colors) return [];

  const unique = new Map();

  car.colors.forEach((c) => {
    unique.set(c.name, {
      name: c.name,
      hexCode: c.hexCode,
      images: c.images || [],
    });
  });

  return [...unique.values()];
};