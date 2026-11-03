import { useState } from "react";

import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerHueSlider,
  ColorPickerInput,
} from "@/shared/components/ui/color-picker";
import { stageColorPresets } from "@/shared/constants/stageColors";
import { cn } from "@/shared/utils/cn";

const HEX_LENGTH = 7;
const CHANNEL_ROUNDING_TOLERANCE = 1;

const channelsOf = (hex: string) =>
  [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16));

// The picker converts through HSB and can return the same color off by one per channel.
const isSameColor = (a: string, b: string) =>
  channelsOf(a).every(
    (channel, index) =>
      Math.abs(channel - (channelsOf(b)[index] ?? 0)) <= CHANNEL_ROUNDING_TOLERANCE
  );

type StageColorFieldProps = {
  value: string;
  onChange: (color: string) => void;
};

export function StageColorField({ value, onChange }: StageColorFieldProps) {
  const [pickerKey, setPickerKey] = useState(0);

  const choosePreset = (color: string) => {
    onChange(color);
    setPickerKey((key) => key + 1);
  };

  return (
    <div className="flex flex-col gap-3">
      <div role="radiogroup" aria-label="Cores sugeridas" className="grid grid-cols-5 gap-2">
        {stageColorPresets.map((color) => (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={color === value}
            aria-label={color}
            onClick={() => choosePreset(color)}
            className={cn(
              "focus-visible:ring-ring/50 h-8 cursor-pointer rounded-md border-2 outline-none focus-visible:ring-3",
              color === value ? "border-foreground" : "border-transparent"
            )}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <ColorPicker
        key={pickerKey}
        inline
        format="hex"
        defaultValue={value}
        onValueChange={(next) => {
          const hex = next.slice(0, HEX_LENGTH).toLowerCase();
          if (!isSameColor(hex, value)) onChange(hex);
        }}
      >
        <ColorPickerContent className="w-full p-0">
          <ColorPickerArea />
          <ColorPickerHueSlider />
          <ColorPickerInput withoutAlpha />
        </ColorPickerContent>
      </ColorPicker>
    </div>
  );
}
