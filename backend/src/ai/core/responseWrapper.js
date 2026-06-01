export const responseWrapper = ({
  success = true,
  intent = "UNKNOWN",
  confidence = 0,
  entities = {},
  data = null,
  message = "",
  error = null,
}) => {
  return {
    success,
    intent,
    confidence,
    entities,
    data,
    message,
    error,
    timestamp: Date.now(),
  };
};

export default responseWrapper;