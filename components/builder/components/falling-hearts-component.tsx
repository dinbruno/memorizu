"use client";

import { Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface FallingHeartsData {
  count: number;
  speed: number;
  size: number;
  color: string;
  shape: "heart" | "star" | "circle" | "flower";
  direction: "down" | "up" | "diagonal";
  opacity: number;
  duration: number;
  enabled: boolean;
}

interface FallingHeartsComponentProps {
  data: FallingHeartsData;
  onUpdate?: (data: Partial<FallingHeartsData>) => void;
  isEditable?: boolean;
  isInlineEdit?: boolean;
  isPreview?: boolean;
}

export function FallingHeartsComponent({ data, onUpdate, isEditable, isInlineEdit, isPreview }: FallingHeartsComponentProps) {
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
  };

  const finalData = { ...defaultData, ...data };

  const handleUpdate = (updates: Partial<FallingHeartsData>) => {
    const newData = { ...finalData, ...updates };
    console.log("FallingHearts handleUpdate:", newData);
    if (onUpdate) {
      onUpdate(newData);
    }
  };

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
              checked={finalData.enabled}
              onCheckedChange={(enabled) => {
                console.log("Switch toggled:", enabled);
                handleUpdate({ enabled });
              }}
            />
            <Label htmlFor="enabled">Enable Effect</Label>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Shape</Label>
                <Select value={finalData.shape} onValueChange={(value: any) => handleUpdate({ shape: value })}>
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
                <Select value={finalData.direction} onValueChange={(value: any) => handleUpdate({ direction: value })}>
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
              <Label>Count: {finalData.count}</Label>
              <Slider
                value={[finalData.count]}
                onValueChange={([value]) => handleUpdate({ count: value })}
                min={5}
                max={50}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Speed: {finalData.speed}s</Label>
              <Slider
                value={[finalData.speed]}
                onValueChange={([value]) => handleUpdate({ speed: value })}
                min={1}
                max={10}
                step={0.5}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Size: {finalData.size}px</Label>
              <Slider
                value={[finalData.size]}
                onValueChange={([value]) => handleUpdate({ size: value })}
                min={16}
                max={64}
                step={4}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Opacity: {Math.round(finalData.opacity * 100)}%</Label>
              <Slider
                value={[finalData.opacity]}
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
                <div className="w-10 h-10 rounded-md border border-input" style={{ backgroundColor: finalData.color }} />
                <Input id="color" type="color" value={finalData.color} onChange={(e) => handleUpdate({ color: e.target.value })} className="flex-1" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render small floating indicator
  return (
    <div className="fixed top-4 right-36 z-40 pointer-events-auto">
      <div
        className={`
          flex items-center gap-2 px-3 py-2 rounded-full shadow-lg border backdrop-blur-sm transition-all duration-200 hover:scale-105 cursor-pointer
          ${
            finalData.enabled
              ? "bg-gradient-to-r from-pink-500/90 to-red-500/90 border-pink-400/50 text-white"
              : "bg-background/90 border-border text-muted-foreground hover:border-primary/50"
          }
        `}
        title={finalData.enabled ? "Falling Effects Active" : "Falling Effects Disabled"}
      >
        <Zap className={`h-4 w-4 ${finalData.enabled ? "animate-pulse" : ""}`} />
        <span className="text-xs font-medium">{finalData.shape === "heart" ? "Hearts" : finalData.shape}</span>
        {finalData.enabled && <div className="w-2 h-2 bg-white rounded-full animate-ping" />}
      </div>
    </div>
  );
}
