import { planner } from "../brain/planner.js";
import { reasoner } from "../brain/reasoner.js";
import { extractEntities } from "../brain/entityExtractor.js";
import { toolRouter } from "../tool/toolRouter.js";

import {
  getConversationContext,
  saveConversationContext
} from "../memory/sessionMemory.js";

export const agentCore = async (
  userId,
  message,
  deps = {}
) => {

  try {

    // ================= SAFE REDIS =================

    const redis = deps?.redis || null;

    // ================= MEMORY =================

    let context = {};

    if (redis) {

      context = await getConversationContext(
        redis,
        userId
      );

    }

    // ================= ENTITY =================

    const entities =
      extractEntities(message);

    // ================= PLAN =================

    const plan = await planner({
      message,
      context,
      entities
    });

    console.log("PLAN:", plan);

    // ================= TOOL =================

    const toolResult = await toolRouter(
      plan,
      {
        message,
        entities,
        context
      }
    );

    console.log(
      "TOOL RESULT:",
      toolResult
    );

    // ================= REASON =================

    const answer = await reasoner({
      message,
      toolResult,
      context
    });

    // ================= SAVE MEMORY =================

    if (redis) {

      await saveConversationContext(
        redis,
        userId,
        {
          message,
          entities,
          plan,
          toolResult
        }
      );

    }

    return answer;

  } catch (err) {

    console.error(
      "AGENT CORE ERROR:",
      err
    );

    return `
AGENT ERROR:

${err.message}

STACK:
${err.stack}
`;

  }

};