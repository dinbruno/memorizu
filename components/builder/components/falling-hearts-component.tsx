"use client"

import { Zap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

interface FallingHeartsData {
  count: number
  speed: number
  size: number
  color: string
  shape: "heart" | "star" | "circle" | "flower"
  direction: "down" | "up" | "diagonal"
  opacity: number
  duration: number
  enabled: boolean
}

interface FallingHeartsComponentProps {
  data: FallingHeartsData
  onUpdate?: (data: Partial<FallingHeartsData>) => void
  isEditable?: boolean
  isInlineEdit?: boolean
  isPreview?: boolean
}

export function FallingHeartsComponent({
  data,
  onUpdate,
  isEditable,
  isInlineEdit,
  isPreview,
}: FallingHeartsComponentProps) {
  // Valores padrão
  const defaultData: FallingHeartsData = {
    count: 15,
    speed: 3,
    size: 24,
    color: "#ff69b4",
    shape: "heart",
    direction: "down",
    opacity: 0.8,
    duration: 5,
    enabled: false,
    ...data,
  }

  const handleUpdate = (updates: Partial<FallingHeartsData>) => {
    const newData = { ...defaultData, ...updates }
    console.log("FallingHearts handleUpdate:", newData)
    if (onUpdate) {
      onUpdate(newData)
    }
  }

  if (isInlineEdit) {
    return (
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Falling Effects Settings</h3>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="enabled"
              checked={defaultData.enabled}
              onCheckedChange={(enabled) => {
                console.log("Switch toggled:", enabled)
                handleUpdate({ enabled })
              }}
            />
            <Label htmlFor="enabled">Enable Effect</Label>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Shape</Label>
                <Select value={defaultData.shape} onValueChange={(value: any) => handleUpdate({ shape: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="heart">❤️ Hearts</SelectItem>
                    <SelectItem value="star">⭐ Stars</SelectItem>
                    <SelectItem value="circle">● Circles</SelectItem>
                    <SelectItem value="flower">🌸 Flowers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Direction</Label>
                <Select
                  value={defaultData.direction}
                  onValueChange={(value: any) => handleUpdate({ direction: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="down">⬇️ Falling Down</SelectItem>
                    <SelectItem value="up">⬆️ Rising Up</SelectItem>
                    <SelectItem value="diagonal">↗️ Diagonal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Count: {defaultData.count}</Label>
              <Slider
                value={[defaultData.count]}
                onValueChange={([value]) => handleUpdate({ count: value })}
                min={5}
                max={50}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Speed: {defaultData.speed}s</Label>
              <Slider
                value={[defaultData.speed]}
                onValueChange={([value]) => handleUpdate({ speed: value })}
                min={1}
                max={10}
                step={0.5}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Size: {defaultData.size}px</Label>
              <Slider
                value={[defaultData.size]}
                onValueChange={([value]) => handleUpdate({ size: value })}
                min={16}
                max={64}
                step={4}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Opacity: {Math.round(defaultData.opacity * 100)}%</Label>
              <Slider
                value={[defaultData.opacity]}
                onValueChange={([value]) => handleUpdate({ opacity: value })}
                min={0.1}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-md border border-input"
                  style={{ backgroundColor: defaultData.color }}
                />
                <Input
                  id="color"
                  type="color"
                  value={defaultData.color}
                  onChange={(e) => handleUpdate({ color: e.target.value })}
                  className="flex-1"
                />
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
          <Zap className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">
            {defaultData.enabled ? "Falling Effects (Active)" : "Falling Effects (Disabled)"}
          </p>
          <p className="text-xs text-muted-foreground">
            {defaultData.enabled ? "Effects will overlay the entire page" : "Enable in settings to activate"}
          </p>
        </div>
      </div>
    </div>
  )
}
