import {
  getHealthStatus,
  resetHealth,
} from "./healthMonitor.js";

export const recoveryEngine = async () => {
  const health = getHealthStatus();

  // ================= AUTO RECOVERY =================

  if (health.status === "DEGRADED") {
    console.log(
      "⚠️ AI entering recovery mode..."
    );

    // reset counters
    resetHealth();

    console.log(
      "✅ AI recovered successfully"
    );
  }
};