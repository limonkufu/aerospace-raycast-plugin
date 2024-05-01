/* eslint-disable @typescript-eslint/no-explicit-any */
import { Action, ActionPanel, Keyboard, List, showHUD } from "@raycast/api";
import { getConfig, AppConfig, Shortcut } from "./utils/config";
import { normalizeKey, mapKeyToKeyCode } from "./utils/keys";
import { runAppleScript } from "@raycast/utils";

async function executeShortcut(shortcut: string) {
  const parts = shortcut.split("-");
  const key = parts.pop(); // Assuming the last part is always the key
  if (!key) {
    console.error("No key found in shortcut");
    return;
  }
  const modifiers = parts
    .map((mod) => {
      switch (mod.toLowerCase()) {
        case "cmd":
          return "command down";
        case "ctrl":
          return "control down";
        case "alt":
          return "option down";
        case "shift":
          return "shift down";
        default:
          return "";
      }
    })
    .filter(Boolean)
    .join(", ");

  const keyCode = mapKeyToKeyCode(key);

  console.log(`Executing shortcut: ${keyCode ? `key code ${keyCode}` : `keystroke "${key}"`} using {${modifiers}}`);
  const script = `
tell application "System Events"
    ${keyCode ? `key code ${keyCode}` : `keystroke "${key}"`} using {${modifiers}}
    return "Executed: ${shortcut}(${modifiers} - ${key})}"
end
`;

  try {
    const res = await runAppleScript(script, []);
    await showHUD(res);
  } catch (error) {
    console.error(`Failed to execute shortcut: ${error}`);
    await showHUD(`Failed to execute: ${shortcut}`);
  }
}

function extractKeyboardShortcuts(config: AppConfig): Record<string, Shortcut> {
  const shortcuts: Record<string, Shortcut> = {};
  console.log(config);
  // Check if 'mode' exists in the configuration
  if (config.mode) {
    // Iterate over each mode
    console.log("Modes:", Object.keys(config.mode));
    for (const mode of Object.keys(config.mode)) {
      console.log("Mode:", mode);
      const bindings = config.mode[mode].binding;
      if (bindings) {
        // Add each key binding found to the shortcuts object
        for (const key of Object.keys(bindings)) {
          console.log("Key:", key, "\t\tValue:", bindings[key]);
          shortcuts[mode + key] = {
            mode: mode,
            shortcut: key,
            description: JSON.stringify(bindings[key]),
          };
        }
      }
    }
  }

  return shortcuts;
}

export default function Command() {
  const { config } = getConfig() as { config: AppConfig };
  const keyboardShortcuts = extractKeyboardShortcuts(config);

  console.debug("Keyboard shortcuts:", keyboardShortcuts);

  return (
    <List navigationTitle="Keyboard Shortcuts" searchBarPlaceholder="Search your shortcuts">
      {Object.entries(keyboardShortcuts).map(([key, value]) => {
        const shortcutParts = value.shortcut.split("-");
        const modifiers = shortcutParts.slice(0, -1); // all parts except last as modifiers
        // Change alt to opt in modifiers using the normalizeKey function
        const normalizedModifiers = modifiers.map((modifier) => normalizeKey(modifier));
        // console.log("Modifiers:", modifiers);
        const keyPart = normalizeKey(shortcutParts[shortcutParts.length - 1]); // last part as key
        // console.log("Key:", keyPart);
        // If the key is esc set it to nothing to avoid conflict with raycast api

        return (
          <List.Item
            key={key}
            title={value.description}
            subtitle={value.shortcut}
            accessories={[{ text: value.mode }]}
            actions={
              <ActionPanel>
                <Action
                  title="Activate"
                  onAction={() => {
                    console.log("Activated", value.description);
                    executeShortcut(value.shortcut);
                  }}
                  shortcut={{
                    modifiers: normalizedModifiers.map((modifier) => modifier as Keyboard.KeyModifier),
                    key: keyPart === "escape" ? "home" : (keyPart as Keyboard.KeyEquivalent),
                  }}
                />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}
