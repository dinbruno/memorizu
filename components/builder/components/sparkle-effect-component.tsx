"use client"

import { Sparkles } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

interface SparkleEffectData {
  count: number
  size: number
  color: string
  secondaryColor: string
  speed: number
  intensity: number
  pattern: "random" | "circular" | "wave"
  enabled: boolean
}

interface SparkleEffectComponentProps {
  data: SparkleEffectData
  onUpdate?: (data: Partial<SparkleEffectData>) => void
  isEditable?: boolean
  isInlineEdit?: boolean
  isPreview?: boolean
}

export function SparkleEffectComponent({
  data,
  onUpdate,
  isEditable,
  isInlineEdit,
  isPreview,
}: SparkleEffectComponentProps) {
  // Valores padrão
  const defaultData = {
    count: 25,
    size: 8,
    color: "#ffd700",
    secondaryColor: "#ff69b4",
    speed: 2,
    intensity: 5,
    pattern: "random" as const,
    enabled: false,
    ...data,
  }

  const handleUpdate = (updates: Partial<SparkleEffectData>) => {
    const newData = { ...defaultData, ...updates }
    console.log("SparkleEffect update:", newData)
    if (onUpdate) {
      onUpdate(newData)
    }
  }

  if (isInlineEdit) {
    return (
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Sparkle Effect Settings</h3>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="enabled"
              checked={defaultData.enabled}
              onCheckedChange={(enabled) => handleUpdate({ enabled })}
            />
            <Label htmlFor="enabled">Enable Effect</Label>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Pattern</Label>
              <Select value={defaultData.pattern} onValueChange={(value: any) => handleUpdate({ pattern: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="random">✨ Random</SelectItem>
                  <SelectItem value="circular">🔄 Circular</SelectItem>
                  <SelectItem value="wave">🌊 Wave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Count: {defaultData.count}</Label>
              <Slider
                value={[defaultData.count]}
                onValueChange={([value]) => handleUpdate({ count: value })}
                min={10}
                max={50}
                step={2}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Size: {defaultData.size}px</Label>
              <Slider
                value={[defaultData.size]}
                onValueChange={([value]) => handleUpdate({ size: value })}
                min={4}
                max={20}
                step={2}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Speed: {defaultData.speed}s</Label>
              <Slider
                value={[defaultData.speed]}
                onValueChange={([value]) => handleUpdate({ speed: value })}
                min={0.5}
                max={5}
                step={0.5}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Intensity: {defaultData.intensity}</Label>
              <Slider
                value={[defaultData.intensity]}
                onValueChange={([value]) => handleUpdate({ intensity: value })}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded border border-input"
                    style={{ backgroundColor: defaultData.color }}
                  />
                  <Input
                    id="primaryColor"
                    type="color"
                    value={defaultData.color}
                    onChange={(e) => handleUpdate({ color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded border border-input"
                    style={{ backgroundColor: defaultData.secondaryColor }}
                  />
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={defaultData.secondaryColor}
                    onChange={(e) => handleUpdate({ secondaryColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render placeholder in builder
  return (
    <div className="relative w-full h-32 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/20">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">
            {defaultData.enabled ? "Sparkle Effect (Active)" : "Sparkle Effect (Disabled)"}
          </p>
          <p className="text-xs text-muted-foreground">
            {defaultData.enabled ? "Effects will overlay the entire page" : "Enable in settings to activate"}
          </p>
        </div>
      </div>
    </div>
  )
}
