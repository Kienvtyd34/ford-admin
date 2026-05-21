import { planner } from "../brain/planner.js";
import { reasoner } from "../brain/reasoner.js";
import { extractEntities } from "../brain/entityExtractor.js";
import { toolRouter } from "../tool/toolRouter.js";
import {
  getConversationContext,
  saveConversationContext
} from "../memory/sessionMemory.js";

export const agentCore = async (userId, message, deps) => {

  const context = await getConversationContext(deps.redis, userId);

  const entities = extractEntities(message);

  const plan = await planner({
    message,
    context,
    entities
  });

  const toolResult = await toolRouter(plan, {
    message,
    entities,
    context
  });

  const answer = await reasoner({
    message,
    toolResult,
    context
  });

  await saveConversationContext(deps.redis, userId, {
    message,
    entities,
    plan,
    toolResult
  });

  return answer;
};