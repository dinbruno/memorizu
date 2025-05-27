"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Palette, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  className?: string;
  presets?: string[];
}

const defaultPresets = [
  "transparent",
  "#000000",
  "#ffffff",
  "#f8f9fa",
  "#e9ecef",
  "#dee2e6",
  "#ced4da",
  "#adb5bd",
  "#6c757d",
  "#495057",
  "#343a40",
  "#212529",
  "#ff0000",
  "#ff6b6b",
  "#ff8787",
  "#ffa8a8",
  "#ffc9c9",
  "#ffe3e3",
  "#00ff00",
  "#51cf66",
  "#69db7c",
  "#8ce99a",
  "#a9e34b",
  "#c0eb75",
  "#0000ff",
  "#339af0",
  "#4dabf7",
  "#74c0fc",
  "#91a7ff",
  "#ad7be9",
  "#ffff00",
  "#ffd43b",
  "#ffe066",
  "#ffec99",
  "#fff3bf",
  "#fff8dc",
  "#ff00ff",
  "#e599f7",
  "#f06292",
  "#f48fb1",
  "#f8bbd9",
  "#fce4ec",
  "#00ffff",
  "#3bc9db",
  "#66d9ef",
  "#99e9f2",
  "#c5f6fa",
  "#e3fafc",
  "#ffa500",
  "#ff922b",
  "#ffa94d",
  "#ffb366",
  "#ffc078",
  "#ffd8a8",
  "#800080",
  "#9775fa",
  "#c084fc",
  "#d0bfff",
  "#e5dbff",
  "#f3f0ff",
];

export function ColorPicker({ value, onChange, label, className, presets = defaultPresets }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "transparent");

  const safeValue = value || "transparent";
  const displayValue = safeValue === "transparent" ? "#ffffff" : safeValue;

  // Sync inputValue when value prop changes
  useEffect(() => {
    setInputValue(safeValue);
  }, [safeValue]);

  const handleColorChange = (color: string) => {
    setInputValue(color);
    onChange(color);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Validate hex color or transparent
    if (/^#[0-9A-F]{6}$/i.test(newValue) || /^#[0-9A-F]{3}$/i.test(newValue) || newValue === "transparent") {
      onChange(newValue);
    }
  };

  const handleInputBlur = () => {
    // Reset to current value if invalid
    if (!/^#[0-9A-F]{6}$/i.test(inputValue) && !/^#[0-9A-F]{3}$/i.test(inputValue) && inputValue !== "transparent") {
      setInputValue(safeValue);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label className="text-sm font-medium">{label}</Label>}

      <div className="flex gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-12 h-10 p-1 border rounded-md overflow-hidden" style={{ backgroundColor: displayValue }}>
              <div className="w-full h-full rounded border border-border/20" style={{ backgroundColor: displayValue }} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4" align="start">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Color Picker</span>
              </div>

              {/* Color Input */}
              <div className="space-y-2">
                <Label className="text-xs">Hex Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={displayValue}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-12 h-8 p-1 border rounded cursor-pointer"
                  />
                  <Input
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="transparent"
                    className="flex-1 h-8 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Color Presets */}
              <div className="space-y-2">
                <Label className="text-xs">Presets</Label>
                <div className="grid grid-cols-11 gap-1">
                  {presets.map((preset, index) => (
                    <button
                      key={`${preset}-${index}`}
                      onClick={() => {
                        handleColorChange(preset);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-5 h-5 rounded border border-border/20 hover:scale-110 transition-transform relative",
                        safeValue === preset && "ring-2 ring-primary ring-offset-1"
                      )}
                      style={{
                        backgroundColor: preset === "transparent" ? "#ffffff" : preset,
                        backgroundImage:
                          preset === "transparent"
                            ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
                            : undefined,
                        backgroundSize: preset === "transparent" ? "4px 4px" : undefined,
                        backgroundPosition: preset === "transparent" ? "0 0, 0 2px, 2px -2px, -2px 0px" : undefined,
                      }}
                      title={preset}
                    >
                      {safeValue === preset && <Check className="h-3 w-3 text-black absolute inset-0 m-auto drop-shadow-sm" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent/Custom section could be added here */}
            </div>
          </PopoverContent>
        </Popover>

        <Input
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder="transparent"
          className="flex-1 font-mono text-sm"
        />
      </div>
    </div>
  );
}
