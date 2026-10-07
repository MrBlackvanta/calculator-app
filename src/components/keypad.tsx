import type { CalculatorAction } from "@/lib/calculator";

type KeyFace = "key" | "action" | "accent";

type KeyDefinition = {
  label: string;
  name?: string;
  face: KeyFace;
  wide?: boolean;
  action: CalculatorAction;
};

const FACE_CLASSES: Record<KeyFace, string> = {
  key: "v-face-key text-keycap md:text-keycap-lg",
  action: "v-face-action text-command md:text-command-lg",
  accent: "v-face-accent text-command md:text-command-lg",
};

const KEYS: KeyDefinition[] = [
  { label: "7", face: "key", action: { type: "digit", digit: "7" } },
  { label: "8", face: "key", action: { type: "digit", digit: "8" } },
  { label: "9", face: "key", action: { type: "digit", digit: "9" } },
  { label: "DEL", face: "action", action: { type: "delete" } },
  { label: "4", face: "key", action: { type: "digit", digit: "4" } },
  { label: "5", face: "key", action: { type: "digit", digit: "5" } },
  { label: "6", face: "key", action: { type: "digit", digit: "6" } },
  {
    label: "+",
    name: "+ add",
    face: "key",
    action: { type: "operator", operator: "+" },
  },
  { label: "1", face: "key", action: { type: "digit", digit: "1" } },
  { label: "2", face: "key", action: { type: "digit", digit: "2" } },
  { label: "3", face: "key", action: { type: "digit", digit: "3" } },
  {
    label: "-",
    name: "- subtract",
    face: "key",
    action: { type: "operator", operator: "-" },
  },
  {
    label: ".",
    name: ". decimal point",
    face: "key",
    action: { type: "decimal" },
  },
  { label: "0", face: "key", action: { type: "digit", digit: "0" } },
  {
    label: "/",
    name: "/ divide",
    face: "key",
    action: { type: "operator", operator: "/" },
  },
  {
    label: "x",
    name: "x multiply",
    face: "key",
    action: { type: "operator", operator: "x" },
  },
  { label: "RESET", face: "action", wide: true, action: { type: "reset" } },
  {
    label: "=",
    name: "= equals",
    face: "accent",
    wide: true,
    action: { type: "equals" },
  },
];

export default function Keypad({
  onPress,
  pressedKey,
}: {
  onPress: (action: CalculatorAction) => void;
  pressedKey: string | null;
}) {
  return (
    <div className="bg-panel rounded-panel grid grid-cols-4 gap-3.25 p-6 md:gap-6 md:p-8">
      {KEYS.map(({ label, name, face, wide, action }) => (
        <button
          key={label}
          type="button"
          aria-label={name}
          data-pressed={label === pressedKey ? "" : undefined}
          onClick={() => onPress(action)}
          onMouseDown={(event) => event.preventDefault()}
          className={`v-key rounded-key md:rounded-key-lg h-16 ${FACE_CLASSES[face]} ${wide ? "col-span-2" : ""}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
