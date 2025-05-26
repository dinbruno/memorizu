"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Palette, Type } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

interface SettingsPanelProps {
  settings: {
    backgroundColor: string
    textColor: string
    fontFamily: string
    template: string
  }
  onUpdateSettings: (
    settings: Partial<{
      backgroundColor: string
      textColor: string
      fontFamily: string
      template: string
    }>,
  ) => void
}

export function SettingsPanel({ settings, onUpdateSettings }: SettingsPanelProps) {
  const { t } = useLanguage()

  const fontFamilies = [
    { value: "Inter", label: "Inter" },
    { value: "Roboto", label: "Roboto" },
    { value: "Poppins", label: "Poppins" },
    { value: "Montserrat", label: "Montserrat" },
    { value: "Open Sans", label: "Open Sans" },
    { value: "Lato", label: "Lato" },
    { value: "Playfair Display", label: "Playfair Display" },
    { value: "Dancing Script", label: "Dancing Script" },
  ]

  const colorPresets = [
    { name: "Default", bg: "#ffffff", text: "#000000" },
    { name: "Dark", bg: "#0f0f0f", text: "#ffffff" },
    { name: "Warm", bg: "#fef7ed", text: "#1c1917" },
    { name: "Cool", bg: "#f0f9ff", text: "#0c4a6e" },
    { name: "Romantic", bg: "#fdf2f8", text: "#831843" },
    { name: "Nature", bg: "#f0fdf4", text: "#14532d" },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Colors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            {colorPresets.map((preset) => (
              <button
                key={preset.name}
                className="p-3 rounded-lg border text-left hover:border-primary transition-colors"
                style={{ backgroundColor: preset.bg, color: preset.text }}
                onClick={() =>
                  onUpdateSettings({
                    backgroundColor: preset.bg,
                    textColor: preset.text,
                  })
                }
              >
                <div className="text-sm font-medium">{preset.name}</div>
                <div className="text-xs opacity-70">Click to apply</div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="backgroundColor">Background</Label>
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-md border border-input"
                  style={{ backgroundColor: settings.backgroundColor }}
                />
                <Input
                  id="backgroundColor"
                  type="color"
                  value={settings.backgroundColor}
                  onChange={(e) => onUpdateSettings({ backgroundColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="textColor">Text Color</Label>
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-md border border-input"
                  style={{ backgroundColor: settings.textColor }}
                />
                <Input
                  id="textColor"
                  type="color"
                  value={settings.textColor}
                  onChange={(e) => onUpdateSettings({ textColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Type className="h-4 w-4" />
            Typography
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="fontFamily">Font Family</Label>
            <Select value={settings.fontFamily} onValueChange={(value) => onUpdateSettings({ fontFamily: value })}>
              <SelectTrigger id="fontFamily">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map((font) => (
                  <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
