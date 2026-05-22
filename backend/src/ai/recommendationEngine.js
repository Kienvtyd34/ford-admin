import { semanticScore } from "./semanticEngine.js";

export const recommendVehicles = ({ message, models }) => {
  return models
    .map((m) => {
      let score = 0;

      score += semanticScore(message, "suv") * (m.type === "SUV" ? 3 : 0);
      score += semanticScore(message, "pickup") * (m.type === "Pick-up" ? 3 : 0);
      score += semanticScore(message, "offroad") * (m.type === "Pick-up" ? 2 : 1);

      if (m.seats >= 7 && message.includes("gia dinh")) {
        score += 3;
      }

      return { ...m, score };
    })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
};