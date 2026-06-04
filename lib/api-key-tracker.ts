import fs from 'fs';
import path from 'path';

export interface IApiKeyLog {
  timestamp: string;
  endpoint: string;
  keyMasked: string;
  status: "success" | "failed";
  error: string | null;
  durationMs: number;
}

const LOG_FILE = path.join(process.cwd(), "api-logs.json");

export function logApiKeyUsage(
  endpoint: string,
  key: string,
  status: "success" | "failed",
  durationMs: number,
  error: string | null = null
) {
  try {
    const keyMasked = key ? `${key.slice(0, 8)}...${key.slice(-4)}` : "unknown";
    const logEntry: IApiKeyLog = {
      timestamp: new Date().toISOString(),
      endpoint,
      keyMasked,
      status,
      error,
      durationMs
    };

    let logs: IApiKeyLog[] = [];
    try {
      if (fs.existsSync(LOG_FILE)) {
        const data = fs.readFileSync(LOG_FILE, 'utf8');
        logs = JSON.parse(data || "[]");
      }
    } catch (readErr) {
      console.error("Failed to read api-logs.json, resetting log file:", readErr);
      logs = [];
    }

    logs.unshift(logEntry); // Add newest first
    // Keep last 150 entries
    if (logs.length > 150) {
      logs = logs.slice(0, 150);
    }

    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error("Error writing api log:", err);
  }
}
