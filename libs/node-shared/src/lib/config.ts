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
  if (!existsSync) {
    throw Error("config file does not exist");
  }
  const config = JSON.parse(
    readFileSync(configPath, { encoding: "utf-8" })
  ) as Config;
  config.GitLabProjects = config.GitLabProjects.map((p) => ({
    ...p,
    path: untildify(p.path),
  }));
  config.TaskTodoFolder = untildify(config.TaskTodoFolder);
  config.TodoFile = untildify(config.TodoFile);
  config.WorkNoteFile = untildify(config.WorkNoteFile);
  return config;
}

export const CONFIG = getConfig();
