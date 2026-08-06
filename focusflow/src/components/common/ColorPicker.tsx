import React from 'react';
import { TASK_COLORS } from '../../utils/constants';
import { Check } from 'lucide-react';

interface ColorPickerProps {
  selectedColor: string;
  onChange: (color: string) => void;
  label?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = React.memo(({ selectedColor, onChange, label = 'Select Color' }) => {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">{label}</label>}
      <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label={label}>
        {TASK_COLORS.map((color) => {
          const isSelected = selectedColor.toLowerCase() === color.toLowerCase();
          return (
            <button
              key={color}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`Color option ${color}`}
              onClick={() => onChange(color)}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rose-500"
              style={{ backgroundColor: color }}
            >
              {isSelected && <Check className="w-4 h-4 text-white drop-shadow-sm" />}
            </button>
          );
        })}
      </div>
    </div>
  );
});

ColorPicker.displayName = 'ColorPicker';
