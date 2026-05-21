const VEHICLES = [
  "everest",
  "ranger",
  "raptor",
  "territory",
  "transit",
  "mustang",
  "mach-e"
];

export const extractEntities = (message = "") => {

  const text = message.toLowerCase();

  let vehicle = null;

  for (const item of VEHICLES) {

    if (text.includes(item)) {
      vehicle = item;
      break;
    }
  }

  return {
    vehicle
  };
};