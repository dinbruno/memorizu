"use client"

import { Waves } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

interface FloatingBubblesData {
  count: number
  minSize: number
  maxSize: number
  color: string
  speed: number
  opacity: number
  blur: boolean
  enabled: boolean
}

interface FloatingBubblesComponentProps {
  data: FloatingBubblesData
  onUpdate?: (data: Partial<FloatingBubblesData>) => void
  isEditable?: boolean
  isInlineEdit?: boolean
  isPreview?: boolean
}

export function FloatingBubblesComponent({
  data,
  onUpdate,
  isEditable,
  isInlineEdit,
  isPreview,
}: FloatingBubblesComponentProps) {
  // Valores padrão
  const defaultData = {
    count: 15,
    minSize: 20,
    maxSize: 60,
    color: "#3b82f6",
    speed: 8,
    opacity: 0.3,
    blur: false,
    enabled: false,
    ...data,
  }

  const handleUpdate = (updates: Partial<FloatingBubblesData>) => {
    const newData = { ...defaultData, ...updates }
    console.log("FloatingBubbles update:", newData)
    if (onUpdate) {
      onUpdate(newData)
    }
  }

  if (isInlineEdit) {
    return (
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Waves className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Floating Bubbles Settings</h3>
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
              <Label>Count: {defaultData.count}</Label>
              <Slider
                value={[defaultData.count]}
                onValueChange={([value]) => handleUpdate({ count: value })}
                min={5}
                max={30}
                step={1}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Size: {defaultData.minSize}px</Label>
                <Slider
                  value={[defaultData.minSize]}
                  onValueChange={([value]) => handleUpdate({ minSize: value })}
                  min={10}
                  max={50}
                  step={2}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Max Size: {defaultData.maxSize}px</Label>
                <Slider
                  value={[defaultData.maxSize]}
                  onValueChange={([value]) => handleUpdate({ maxSize: value })}
                  min={20}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Speed: {defaultData.speed}s</Label>
              <Slider
                value={[defaultData.speed]}
                onValueChange={([value]) => handleUpdate({ speed: value })}
                min={2}
                max={15}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Opacity: {Math.round(defaultData.opacity * 100)}%</Label>
              <Slider
                value={[defaultData.opacity]}
                onValueChange={([value]) => handleUpdate({ opacity: value })}
                min={0.1}
                max={0.8}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-full border border-input"
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

            <div className="flex items-center space-x-2">
              <Switch id="blur" checked={defaultData.blur} onCheckedChange={(blur) => handleUpdate({ blur })} />
              <Label htmlFor="blur">Blur effect</Label>
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
          <Waves className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">
            {defaultData.enabled ? "Floating Bubbles (Active)" : "Floating Bubbles (Disabled)"}
          </p>
          <p className="text-xs text-muted-foreground">
            {defaultData.enabled ? "Effects will overlay the entire page" : "Enable in settings to activate"}
          </p>
        </div>
      </div>
    </div>
  )
}
