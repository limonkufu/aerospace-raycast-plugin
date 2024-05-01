/* eslint-disable @typescript-eslint/no-explicit-any */
import { Action, ActionPanel, Keyboard, List } from "@raycast/api";
import { getConfig } from "./utils/config";

interface Binding {
  [key: string]: any; // Define more specifically if possible, replacing any with a more precise type
}

interface ModeConfig {
  binding?: Binding;
}

interface AppConfig {
  mode?: {
    [key: string]: ModeConfig;
  };
}

interface Shortcut {
  mode: string;
  shortcut: string;
  description: string;
}

function normalizeKey(key: string): string {
  const keyMap: { [key: string]: string } = {
    minus: "-",
    equal: "=",
    period: ".",
    comma: ",",
    slash: "/",
    backslash: "\\",
    quote: "'",
    semicolon: ";",
    backtick: "`",
    leftSquareBracket: "[",
    rightSquareBracket: "]",
    space: "space",
    enter: "enter",
    esc: "escape",
    backspace: "backspace",
    tab: "tab",
    keypad0: "0",
    keypad1: "1",
    keypad2: "2",
    keypad3: "3",
    keypad4: "4",
    keypad5: "5",
    keypad6: "6",
    keypad7: "7",
    keypad8: "8",
    keypad9: "9",
    keypadClear: "clear",
    keypadDecimalMark: "decimal",
    keypadDivide: "divide",
    keypadEnter: "enter",
    keypadEqual: "=",
    keypadMinus: "-",
    keypadMultiply: "*",
    keypadPlus: "+",
    left: "arrowLeft",
    down: "arrowDown",
    up: "arrowUp",
    right: "arrowRight",
    alt: "opt",
  };

  return keyMap[key] || key; // Default to key if not in map
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
            onAction={() => console.log("Activated", value.description)}
            shortcut={{
              modifiers: normalizedModifiers.map((modifier) => modifier as Keyboard.KeyModifier),
              key: keyPart === "escape" ? "home" : keyPart as Keyboard.KeyEquivalent,
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
