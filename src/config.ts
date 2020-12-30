import { existsSync, readFileSync } from "fs";
import untildify from "untildify";
import { Config } from "./models/models";

export function getConfigPath() {
  if (process.env.ACCEL_SHOOTER_CONFIG_FILE) {
    return untildify(process.env.ACCEL_SHOOTER_CONFIG_FILE);
  } else {
    throw Error("environment variable ACCEL_SHOOTER_CONFIG_FILE not found");
  }
}

export function getConfig(): Config {
  const configPath = getConfigPath();
  return existsSync(configPath)
    ? JSON.parse(readFileSync(configPath, { encoding: "utf-8" }))
    : {};
}

export const CONFIG = getConfig();
