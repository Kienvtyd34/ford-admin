export const priceEngine = async (
  results,
  context = {}
) => {

  let variants =
    results.filter(
      (r) =>
        r.type === "variant"
    );

  // dùng context xe trước đó

  if (context.lastVehicle) {

    variants =
      variants.filter((v) =>
        v.payload.variantName
          ?.toLowerCase()
          .includes(
            context.lastVehicle.name.toLowerCase()
          )
      );
  }

  return variants
    .slice(0, 5)
    .map((v) => ({
      variantName:
        v.payload.variantName,

      basePrice:
        v.payload.basePrice,
    }));
};