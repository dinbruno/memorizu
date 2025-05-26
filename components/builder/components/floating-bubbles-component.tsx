"use client";

import { Waves, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface FloatingBubblesData {
  count: number;
  minSize: number;
  maxSize: number;
  color: string;
  speed: number;
  opacity: number;
  blur: boolean;
  enabled: boolean;
}

interface FloatingBubblesComponentProps {
  data: FloatingBubblesData;
  onUpdate?: (data: Partial<FloatingBubblesData>) => void;
  isEditable?: boolean;
  isInlineEdit?: boolean;
  isPreview?: boolean;
}

export function FloatingBubblesComponent({ data, onUpdate, isEditable, isInlineEdit, isPreview }: FloatingBubblesComponentProps) {
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
  };

  const finalData = { ...defaultData, ...data };

  const handleUpdate = (updates: Partial<FloatingBubblesData>) => {
    const newData = { ...finalData, ...updates };
    console.log("FloatingBubbles update:", newData);
    if (onUpdate) {
      onUpdate(newData);
    }
  };

  if (isInlineEdit) {
    return (
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Waves className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Floating Bubbles Settings</h3>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="enabled" checked={finalData.enabled} onCheckedChange={(enabled) => handleUpdate({ enabled })} />
            <Label htmlFor="enabled">Enable Effect</Label>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Count: {finalData.count}</Label>
              <Slider
                value={[finalData.count]}
                onValueChange={([value]) => handleUpdate({ count: value })}
                min={5}
                max={30}
                step={1}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Size: {finalData.minSize}px</Label>
                <Slider
                  value={[finalData.minSize]}
                  onValueChange={([value]) => handleUpdate({ minSize: value })}
                  min={10}
                  max={50}
                  step={2}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Max Size: {finalData.maxSize}px</Label>
                <Slider
                  value={[finalData.maxSize]}
                  onValueChange={([value]) => handleUpdate({ maxSize: value })}
                  min={20}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Speed: {finalData.speed}s</Label>
              <Slider
                value={[finalData.speed]}
                onValueChange={([value]) => handleUpdate({ speed: value })}
                min={2}
                max={15}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Opacity: {Math.round(finalData.opacity * 100)}%</Label>
              <Slider
                value={[finalData.opacity]}
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
                <div className="w-10 h-10 rounded-full border border-input" style={{ backgroundColor: finalData.color }} />
                <Input id="color" type="color" value={finalData.color} onChange={(e) => handleUpdate({ color: e.target.value })} className="flex-1" />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="blur" checked={finalData.blur} onCheckedChange={(blur) => handleUpdate({ blur })} />
              <Label htmlFor="blur">Blur effect</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render small floating indicator
  return (
    <div className="fixed top-4 right-20 z-40 pointer-events-auto">
      <div
        className={`
          flex items-center gap-2 px-3 py-2 rounded-full shadow-lg border backdrop-blur-sm transition-all duration-200 hover:scale-105 cursor-pointer
          ${
            finalData.enabled
              ? "bg-gradient-to-r from-blue-500/90 to-cyan-500/90 border-blue-400/50 text-white"
              : "bg-background/90 border-border text-muted-foreground hover:border-primary/50"
          }
        `}
        title={finalData.enabled ? "Floating Bubbles Active" : "Floating Bubbles Disabled"}
      >
        <Waves className={`h-4 w-4 ${finalData.enabled ? "animate-bounce" : ""}`} />
        <span className="text-xs font-medium">Bubbles</span>
        {finalData.enabled && <div className="w-2 h-2 bg-white rounded-full animate-ping" />}
      </div>
    </div>
  );
}
