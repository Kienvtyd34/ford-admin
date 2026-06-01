export const safeGet = (obj, path, fallback = "-") => {
  try {
    return path.split(".").reduce((a, b) => a?.[b], obj) ?? fallback;
  } catch {
    return fallback;
  }
};