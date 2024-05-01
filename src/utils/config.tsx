import { getPreferenceValues } from "@raycast/api";
import fs from "fs";
import path from "path";
import os from "os";
import TOML from "@iarna/toml";

function readConfigFile(configPath: string): { content?: string; error?: string } {
  if (configPath.startsWith("~")) {
    configPath = path.join(os.homedir(), configPath.slice(1));
  }

  if (!fs.existsSync(configPath)) {
    return { error: "Config file does not exist. Please check the path in preferences." };
  }

  try {
    const content = fs.readFileSync(configPath, "utf-8");
    return { content };
  } catch (error) {
    let errorMessage: string;

    if (error instanceof Error) {
      errorMessage = `Error reading config file: ${error.message}`;
    } else {
      // This branch is highly unlikely to be reached since fs.readFileSync should always throw an Error, but it's safe to handle any type of throw.
      errorMessage = "Error reading config file: An unexpected error occurred.";
    }

    console.error(errorMessage);
    return { error: errorMessage };
  }
}

function parseTOML(content: string): { config?: object; error?: string } {
  try {
    const config = TOML.parse(content);
    return { config };
  } catch (error) {
    let errorMessage: string;

    if (error instanceof Error) {
      errorMessage = `Error parsing config file: ${error.message}`;
    } else {
      errorMessage = "Error parsing config file: An unexpected error occurred.";
    }

    console.error(errorMessage);
    return { error: errorMessage };
  }
}

export function getConfig() {
  const { configPath } = getPreferenceValues();
  console.log("Config file path as is:", configPath);

  const { content, error: readFileError } = readConfigFile(configPath);
  if (readFileError) {
    console.error(readFileError);
    return { error: readFileError };
  }

  const { config, error: parseError } = parseTOML(content!);
  if (parseError) {
    console.error(parseError);
    return { error: parseError };
  }

  console.log("Config:", config);
  return { config };
}
