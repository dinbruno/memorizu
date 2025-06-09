"use client";

import { Sparkles, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useBuilderTranslation } from "@/hooks/use-builder-translation";

interface SparkleEffectData {
  count: number;
  size: number;
  color: string;
  secondaryColor: string;
  speed: number;
  intensity: number;
  pattern: "random" | "circular" | "wave";
  enabled: boolean;
}

interface SparkleEffectComponentProps {
  data: SparkleEffectData;
  onUpdate?: (data: Partial<SparkleEffectData>) => void;
  onDelete?: () => void;
  onEdit?: () => void;
  isEditable?: boolean;
  isInlineEdit?: boolean;
  isPreview?: boolean;
}

export function SparkleEffectComponent({ data, onUpdate, onDelete, onEdit, isEditable, isInlineEdit, isPreview }: SparkleEffectComponentProps) {
  const t = useBuilderTranslation();

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
  };

  const finalData = { ...defaultData, ...data };

  const handleUpdate = (updates: Partial<SparkleEffectData>) => {
    const newData = { ...finalData, ...updates };
    console.log("SparkleEffect update:", newData);
    if (onUpdate) {
      onUpdate(newData);
    }
  };

  if (isInlineEdit) {
    return (
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">{t.sparkleEffect.settings}</h3>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="enabled" checked={finalData.enabled} onCheckedChange={(enabled) => handleUpdate({ enabled })} />
            <Label htmlFor="enabled">{t.sparkleEffect.enableEffect}</Label>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t.sparkleEffect.pattern}</Label>
              <Select value={finalData.pattern} onValueChange={(value: any) => handleUpdate({ pattern: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="random">{t.sparkleEffect.random}</SelectItem>
                  <SelectItem value="circular">{t.sparkleEffect.circular}</SelectItem>
                  <SelectItem value="wave">{t.sparkleEffect.wave}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                {t.sparkleEffect.count}: {finalData.count}
              </Label>
              <Slider
                value={[finalData.count]}
                onValueChange={([value]) => handleUpdate({ count: value })}
                min={10}
                max={50}
                step={2}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t.size}: {finalData.size}px
              </Label>
              <Slider
                value={[finalData.size]}
                onValueChange={([value]) => handleUpdate({ size: value })}
                min={4}
                max={20}
                step={2}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t.sparkleEffect.speed}: {finalData.speed}s
              </Label>
              <Slider
                value={[finalData.speed]}
                onValueChange={([value]) => handleUpdate({ speed: value })}
                min={0.5}
                max={5}
                step={0.5}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t.sparkleEffect.intensity}: {finalData.intensity}
              </Label>
              <Slider
                value={[finalData.intensity]}
                onValueChange={([value]) => handleUpdate({ intensity: value })}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">{t.sparkleEffect.primaryColor}</Label>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded border border-input" style={{ backgroundColor: finalData.color }} />
                  <Input
                    id="primaryColor"
                    type="color"
                    value={finalData.color}
                    onChange={(e) => handleUpdate({ color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryColor">{t.sparkleEffect.secondaryColor}</Label>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded border border-input" style={{ backgroundColor: finalData.secondaryColor }} />
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={finalData.secondaryColor}
                    onChange={(e) => handleUpdate({ secondaryColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render small floating indicator
  return (
    <div className="fixed top-4 right-4 z-40 pointer-events-auto group">
      <div
        className={`
          flex items-center gap-2 px-3 py-2 rounded-full shadow-lg border backdrop-blur-sm transition-all duration-200 hover:scale-105
          ${
            finalData.enabled
              ? "bg-gradient-to-r from-yellow-500/90 to-pink-500/90 border-yellow-400/50 text-white"
              : "bg-background/90 border-border text-muted-foreground hover:border-primary/50"
          }
        `}
        title={finalData.enabled ? t.sparkleEffect.active : t.sparkleEffect.disabled}
      >
        <Sparkles className={`h-4 w-4 ${finalData.enabled ? "animate-pulse" : ""}`} />
        <span className="text-xs font-medium">{t.sparkleEffect.sparkles}</span>
        {finalData.enabled && <div className="w-2 h-2 bg-white rounded-full animate-ping" />}

        {isEditable && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full hover:bg-red-500/20 text-red-400 hover:text-red-300"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
