export const responseEngine = (data) => ({
  success: true,
  ...data,
  timestamp: Date.now(),
});

export default responseEngine;