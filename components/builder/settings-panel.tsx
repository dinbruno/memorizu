"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Type } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

interface SettingsPanelProps {
  settings: {
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    template: string;
  };
  onUpdateSettings: (
    settings: Partial<{
      backgroundColor: string;
      textColor: string;
      fontFamily: string;
      template: string;
    }>
  ) => void;
}

export function SettingsPanel({ settings, onUpdateSettings }: SettingsPanelProps) {
  const { t } = useLanguage();

  const fontFamilies = [
    { value: "Inter", label: "Inter" },
    { value: "Roboto", label: "Roboto" },
    { value: "Poppins", label: "Poppins" },
    { value: "Montserrat", label: "Montserrat" },
    { value: "Open Sans", label: "Open Sans" },
    { value: "Lato", label: "Lato" },
    { value: "Playfair Display", label: "Playfair Display" },
    { value: "Dancing Script", label: "Dancing Script" },
  ];

  const colorPresets = [
    { name: "Default", bg: "#ffffff", text: "#000000" },
    { name: "Dark", bg: "#0f0f0f", text: "#ffffff" },
    { name: "Warm", bg: "#fef7ed", text: "#1c1917" },
    { name: "Cool", bg: "#f0f9ff", text: "#0c4a6e" },
    { name: "Romantic", bg: "#fdf2f8", text: "#831843" },
    { name: "Nature", bg: "#f0fdf4", text: "#14532d" },
  ];

  return (
    <div className="space-y-4">
      <Card className="border-border/40">
        <CardHeader className="pb-2 px-3 pt-3">
          <CardTitle className="text-sm flex items-center gap-2 font-semibold">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500" />
            Colors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-3 pb-3">
          <div className="grid grid-cols-2 gap-2">
            {colorPresets.map((preset) => (
              <button
                key={preset.name}
                className="p-2.5 rounded-lg border border-border/40 text-left hover:border-primary/50 hover:shadow-sm transition-all duration-200"
                style={{ backgroundColor: preset.bg, color: preset.text }}
                onClick={() =>
                  onUpdateSettings({
                    backgroundColor: preset.bg,
                    textColor: preset.text,
                  })
                }
              >
                <div className="text-xs font-semibold">{preset.name}</div>
                <div className="text-[10px] opacity-70">Click to apply</div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="backgroundColor" className="text-xs font-medium">
                Background
              </Label>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md border border-border/40" style={{ backgroundColor: settings.backgroundColor }} />
                <Input
                  id="backgroundColor"
                  type="color"
                  value={settings.backgroundColor}
                  onChange={(e) => onUpdateSettings({ backgroundColor: e.target.value })}
                  className="flex-1 h-8 text-xs"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="textColor" className="text-xs font-medium">
                Text Color
              </Label>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md border border-border/40" style={{ backgroundColor: settings.textColor }} />
                <Input
                  id="textColor"
                  type="color"
                  value={settings.textColor}
                  onChange={(e) => onUpdateSettings({ textColor: e.target.value })}
                  className="flex-1 h-8 text-xs"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/40">
        <CardHeader className="pb-2 px-3 pt-3">
          <CardTitle className="text-sm flex items-center gap-2 font-semibold">
            <Type className="h-3.5 w-3.5 text-indigo-500" />
            Typography
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="space-y-1.5">
            <Label htmlFor="fontFamily" className="text-xs font-medium">
              Font Family
            </Label>
            <Select value={settings.fontFamily} onValueChange={(value) => onUpdateSettings({ fontFamily: value })}>
              <SelectTrigger id="fontFamily" className="h-8 text-xs">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map((font) => (
                  <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }} className="text-xs">
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
