const PRESET_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f59e0b' },
  { name: 'Pink', value: '#ec4899' },
];

interface ColorPickerProps {
  selectedColor?: string;
  onColorChange: (color: string) => void;
}

export function ColorPicker({ selectedColor = PRESET_COLORS[0].value, onColorChange }: ColorPickerProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {PRESET_COLORS.map((color) => (
        <button
          key={color.value}
          type="button"
          onClick={() => onColorChange(color.value)}
          className={`w-8 h-8 rounded-full border-2 transition-all ${
            selectedColor === color.value
              ? 'border-gray-800 scale-110'
              : 'border-gray-300 hover:border-gray-500'
          }`}
          style={{ backgroundColor: color.value }}
          title={color.name}
        />
      ))}
    </div>
  );
}

