let failCount = 0;
let successCount = 0;
let lastError = null;

export const reportFailure = (
  error = null
) => {
  failCount++;

  lastError = {
    message: error?.message || "Unknown",
    time: new Date(),
  };

  console.log(
    "❌ AI FAILURE:",
    lastError.message
  );
};

export const reportSuccess = () => {
  successCount++;
};

export const getHealthStatus = () => {
  return {
    failCount,
    successCount,
    lastError,

    status:
      failCount >= 5
        ? "DEGRADED"
        : "HEALTHY",
  };
};

export const resetHealth = () => {
  failCount = 0;
  successCount = 0;
  lastError = null;
};