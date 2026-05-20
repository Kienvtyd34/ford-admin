let failureCount = 0;
let lastFailureTime = null;

export const reportFailure = () => {
  failureCount++;
  lastFailureTime = Date.now();
};

export const reportSuccess = () => {
  failureCount = 0;
  lastFailureTime = null;
};

export const getHealthState = () => {
  return {
    failureCount,
    lastFailureTime,
    status:
      failureCount >= 3 ? "DEGRADED" : "HEALTHY",
  };
};