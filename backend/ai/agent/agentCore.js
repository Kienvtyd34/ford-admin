import { classifyIntent } from "../brain/intentClassifier.js";
import { extractEntities } from "../brain/entityExtractor.js";

import { planner } from "./planner.js";
import { toolRouter } from "./toolRouter.js";
import { reasoner } from "./reasoner.js";

import {
  getConversationContext,
  saveConversationContext
} from "../memory/sessionMemory.js";

export const agentCore = async (userId, message) => {

  const context = getConversationContext(userId);

  const intent = classifyIntent(message);
  const entities = extractEntities(message);

  const plan = await planner({
    message,
    intent,
    entities,
    context
  });

  const toolResult = await toolRouter(plan, {
    message,
    entities,
    context
  });

  const answer = await reasoner({
    message,
    toolResult
  });

  saveConversationContext(userId, {
    message,
    intent,
    entities,
    toolResult
  });

  return answer;
};