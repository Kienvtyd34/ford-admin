export const logger = {
  info: (...a) => console.log("[INFO]", ...a),
  warn: (...a) => console.log("[WARN]", ...a),
  error: (...a) => console.log("[ERROR]", ...a),
};

export default logger;