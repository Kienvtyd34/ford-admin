export const priceEngine = async (results) => {
  return results
    .filter((r) => r.type === "variant")
    .slice(0, 5)
    .map((v) => ({
      variantName: v.payload.variantName,
      basePrice: v.payload.basePrice,
    }));
};