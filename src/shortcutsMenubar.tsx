import { Keyboard, MenuBarExtra } from "@raycast/api";
import { AppConfig, getConfig } from "./utils/config";
import { extractKeyboardShortcuts } from "./utils/shortcuts";
import { normalizeKey } from "./utils/keys";

export default function Command() {
  const { config } = getConfig() as { config: AppConfig };
  const keyboardShortcuts = extractKeyboardShortcuts(config);

  console.debug("Keyboard shortcuts:", keyboardShortcuts);
  return (
    <MenuBarExtra icon={"command-icon.png"} tooltip="Your Shortcuts">
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
            <MenuBarExtra.Item
              key={key}
              title={value.description}
              shortcut={{
                modifiers: normalizedModifiers.map((modifier) => modifier as Keyboard.KeyModifier),
                key: keyPart === "escape" ? "home" : (keyPart as Keyboard.KeyEquivalent),
              }}
              onAction={() => {
                console.log("clicked", value);
              }}
            />
          );
      })}
      <MenuBarExtra.Item title="Main" />

      <MenuBarExtra.Item
        title="Example Seen Pull Request"
        onAction={() => {
          console.log("seen pull request clicked");
        }}
      />
      <MenuBarExtra.Item title="Unseen" />
      <MenuBarExtra.Item
        title="Example Unseen Pull Request"
        onAction={() => {
          console.log("unseen pull request clicked");
        }}
      />
    </MenuBarExtra>
  );
}
