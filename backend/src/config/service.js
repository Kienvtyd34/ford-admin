const parsePositiveInteger = (value, fallback) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const SERVICE_DEPOSIT_AMOUNT = parsePositiveInteger(
  process.env.SERVICE_DEPOSIT_AMOUNT,
  200000
);

export const SERVICE_HOLD_MINUTES = parsePositiveInteger(
  process.env.SERVICE_HOLD_MINUTES,
  15
);

export const SERVICE_TIME_SLOTS = (
  process.env.SERVICE_TIME_SLOTS || "08:00-10:00,10:00-12:00,13:30-15:30,15:30-17:30"
)
  .split(",")
  .map((slot) => slot.trim())
  .filter(Boolean);

export const SERVICE_TRANSFER_PREFIX = "DICHVU";
