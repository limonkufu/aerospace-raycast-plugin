/* eslint-disable @typescript-eslint/no-explicit-any */
import { List } from "@raycast/api";
import { getConfig } from "./utils/config";
import { text } from "stream/consumers";


function extractKeyboardShortcuts(config: any): Record<string, object> {
  const shortcuts: Record<string, object> = {};
  console.log(config)
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
            description: JSON.stringify(bindings[key])
          };
        }
      }
    }
  }

  return shortcuts;
}

export default function Command() {
  const { config } = getConfig();
  const keyboardShortcuts = extractKeyboardShortcuts(config);

  console.debug("Keyboard shortcuts:", keyboardShortcuts);

  return (
    <List navigationTitle="Keyboard Shortcuts" searchBarPlaceholder="Search your shortcuts">
      {Object.entries(keyboardShortcuts).map(
        ([key, value]) => (
          console.log(value),
          (
            <List.Item
              key={key}
              title={value.shortcut}
              subtitle={value.description}
              accessories={[{ text: value.mode }]}
            />
          )
        ),
      )}
    </List>
  );
}
