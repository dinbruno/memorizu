"use client";

import { PartyPopper } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface ConfettiData {
  count: number;
  colors: string[];
  shapes: string[];
  speed: number;
  spread: number;
  gravity: number;
  trigger: "continuous" | "burst";
  enabled: boolean;
}

interface ConfettiComponentProps {
  data: ConfettiData;
  onUpdate?: (data: Partial<ConfettiData>) => void;
  isEditable?: boolean;
  isInlineEdit?: boolean;
  isPreview?: boolean;
}

export function ConfettiComponent({ data, onUpdate, isEditable, isInlineEdit, isPreview }: ConfettiComponentProps) {
  // Valores padrão
  const defaultData = {
    count: 50,
    colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"],
    shapes: ["square", "circle"],
    speed: 4,
    spread: 60,
    gravity: 1.5,
    trigger: "continuous" as const,
    enabled: false,
  };

  const finalData = { ...defaultData, ...data };

  const handleUpdate = (updates: Partial<ConfettiData>) => {
    const newData = { ...finalData, ...updates };
    console.log("Confetti update:", newData);
    if (onUpdate) {
      onUpdate(newData);
    }
  };

  if (isInlineEdit) {
    return (
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <PartyPopper className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Confetti Settings</h3>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="enabled" checked={finalData.enabled} onCheckedChange={(enabled) => handleUpdate({ enabled })} />
            <Label htmlFor="enabled">Enable Effect</Label>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Trigger Type</Label>
              <Select value={finalData.trigger} onValueChange={(value: any) => handleUpdate({ trigger: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="continuous">🔄 Continuous</SelectItem>
                  <SelectItem value="burst">💥 Burst</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Count: {finalData.count}</Label>
              <Slider
                value={[finalData.count]}
                onValueChange={([value]) => handleUpdate({ count: value })}
                min={20}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Speed: {finalData.speed}s</Label>
              <Slider
                value={[finalData.speed]}
                onValueChange={([value]) => handleUpdate({ speed: value })}
                min={1}
                max={8}
                step={0.5}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Spread: {finalData.spread}%</Label>
              <Slider
                value={[finalData.spread]}
                onValueChange={([value]) => handleUpdate({ spread: value })}
                min={20}
                max={100}
                step={10}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Gravity: {finalData.gravity}</Label>
              <Slider
                value={[finalData.gravity]}
                onValueChange={([value]) => handleUpdate({ gravity: value })}
                min={0.5}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Colors (comma separated hex codes)</Label>
              <Input
                value={finalData.colors.join(", ")}
                onChange={(e) => {
                  const colors = e.target.value
                    .split(",")
                    .map((c) => c.trim())
                    .filter((c) => c.startsWith("#"));
                  if (colors.length > 0) {
                    handleUpdate({ colors });
                  }
                }}
                placeholder="#ff0000, #00ff00, #0000ff"
              />
            </div>

            <div className="space-y-2">
              <Label>Shapes</Label>
              <div className="grid grid-cols-2 gap-2">
                {["square", "circle", "triangle", "star"].map((shape) => (
                  <label key={shape} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={finalData.shapes.includes(shape)}
                      onChange={(e) => {
                        const shapes = e.target.checked ? [...finalData.shapes, shape] : finalData.shapes.filter((s) => s !== shape);
                        if (shapes.length > 0) {
                          handleUpdate({ shapes });
                        }
                      }}
                    />
                    <span className="capitalize">{shape}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render small floating indicator
  return (
    <div className="fixed top-4 right-52 z-40 pointer-events-auto">
      <div
        className={`
          flex items-center gap-2 px-3 py-2 rounded-full shadow-lg border backdrop-blur-sm transition-all duration-200 hover:scale-105 cursor-pointer
          ${
            finalData.enabled
              ? "bg-gradient-to-r from-purple-500/90 to-indigo-500/90 border-purple-400/50 text-white"
              : "bg-background/90 border-border text-muted-foreground hover:border-primary/50"
          }
        `}
        title={finalData.enabled ? "Confetti Effect Active" : "Confetti Effect Disabled"}
      >
        <PartyPopper className={`h-4 w-4 ${finalData.enabled ? "animate-spin" : ""}`} />
        <span className="text-xs font-medium">Confetti</span>
        {finalData.enabled && <div className="w-2 h-2 bg-white rounded-full animate-ping" />}
      </div>
    </div>
  );
}
