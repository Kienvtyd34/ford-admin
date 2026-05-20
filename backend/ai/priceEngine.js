export const priceEngine = async (
  results,
  context = {}
) => {

  try {

    const lastVehicle =
      context.lastVehicle;

    // =========================
    // ALL VARIANTS
    // =========================

    let variants =
      results.filter(
        (r) =>
          r.type === "variant"
      );

    // =========================
    // FILTER BY LAST VEHICLE
    // =========================

    if (lastVehicle) {

      const vehicleName =
        lastVehicle.name
          .toLowerCase()
          .replace("ford", "")
          .trim();

      variants = variants.filter(
        (v) => {

          const name =
            v.payload.variantName
              ?.toLowerCase() || "";

          return name.includes(
            vehicleName
          );
        }
      );
    }

    // =========================
    // FALLBACK
    // =========================

    if (variants.length === 0) {

      const {
        brainMap,
      } = await import(
        "./vector/vectorStore.js"
      );

      variants = brainMap.filter(
        (r) => {

          if (
            r.type !== "variant"
          ) {
            return false;
          }

          if (!lastVehicle) {
            return true;
          }

          const vehicleName =
            lastVehicle.name
              .toLowerCase()
              .replace("ford", "")
              .trim();

          const name =
            r.payload.variantName
              ?.toLowerCase() || "";

          return name.includes(
            vehicleName
          );
        }
      );
    }

    // =========================
    // FORMAT
    // =========================

    const mapped =
      variants.map((v) => ({
        variantName:
          v.payload.variantName,
        basePrice:
          v.payload.basePrice,
      }));

    // REMOVE DUPLICATE

    const unique =
      mapped.filter(
        (v, index, self) =>
          index ===
          self.findIndex(
            (x) =>
              x.variantName ===
              v.variantName
          )
      );

    return unique.slice(0, 10);

  } catch (err) {

    console.log(
      "❌ priceEngine:",
      err.message
    );

    return [];
  }
};