export const formatResponse = ({
  intent,
  confidence = 1,
  entities = {},
  data = null,
  message = "",
}) => {
  return {
    success: true,
    intent,
    confidence,
    entities,
    data,
    message,
    timestamp: Date.now(),
  };
};

export default formatResponse;