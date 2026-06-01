export const formatResponse = (data) => ({
  success: true,
  ...data,
  timestamp: Date.now(),
});