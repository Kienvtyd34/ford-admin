export const mapColors = (car) => {
  if (!car.colors) return [];

  const map = new Map();

  car.colors.forEach((c) => {
    if (!map.has(c.name)) {
      map.set(c.name, {
        name: c.name,
        hexCode: c.hexCode,
        images: c.images || [],
      });
    }
  });

  return [...map.values()];
};