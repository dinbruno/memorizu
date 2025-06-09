"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings2, Play, ExternalLink, Video, AlertCircle } from "lucide-react";
import { useBuilderTranslation } from "@/hooks/use-builder-translation";

interface VideoComponentProps {
  data: {
    url: string;
    title: string;
    autoplay: boolean;
    controls: boolean;
    muted: boolean;
    loop: boolean;
    width: string;
    height: string;
    aspectRatio: string;
    align: "left" | "center" | "right";
  };
  onUpdate?: (data: any) => void;
  isEditable?: boolean;
}

export function VideoComponent({ data, onUpdate, isEditable = false }: VideoComponentProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [localData, setLocalData] = useState({ ...data });
  const [videoId, setVideoId] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const t = useBuilderTranslation();

  // Update localData when data prop changes
  useEffect(() => {
    setLocalData({ ...data });
  }, [data]);

  // Use localData when editing to show immediate updates, otherwise use data
  const displayData = isEditable ? localData : data;

  useEffect(() => {
    const extractVideoId = (url: string) => {
      if (!url) return "";

      const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/, /youtube\.com\/watch\?.*v=([^&\n?#]+)/];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
      }
      return "";
    };

    const id = extractVideoId(displayData.url);
    setVideoId(id);
    setIsValidUrl(!!id);
  }, [displayData.url]);

  const handleSettingsChange = (field: string, value: any) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);

    // Apply changes immediately if onUpdate is available
    if (onUpdate) {
      onUpdate(updatedData);
    }
  };

  const getEmbedUrl = () => {
    if (!videoId) return "";

    const params = new URLSearchParams();
    if (displayData.autoplay) params.append("autoplay", "1");
    if (!displayData.controls) params.append("controls", "0");
    if (displayData.muted) params.append("mute", "1");
    if (displayData.loop) {
      params.append("loop", "1");
      params.append("playlist", videoId);
    }
    params.append("rel", "0");
    params.append("modestbranding", "1");

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  };

  const alignmentClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  const aspectRatioClasses = {
    "16/9": "aspect-video",
    "4/3": "aspect-[4/3]",
    "1/1": "aspect-square",
    "21/9": "aspect-[21/9]",
  };

  return (
    <motion.div className="relative group" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {isEditable && (
        <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 rounded-full bg-background/90 backdrop-blur-sm shadow-lg border-2 border-primary/20 hover:border-primary/40 transition-all duration-200"
            >
              <Settings2 className="h-4 w-4" />
              <span className="sr-only">{t.video.settings}</span>
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-96 p-0" align="end">
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Video className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{t.video.settings}</h3>
                  <p className="text-sm text-muted-foreground">{t.video.configure}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="video-url" className="text-sm font-medium">
                    {t.video.youtubeUrl}
                  </Label>
                  <div className="relative">
                    <Input
                      id="video-url"
                      value={localData.url}
                      onChange={(e) => handleSettingsChange("url", e.target.value)}
                      placeholder={t.video.urlPlaceholder}
                      className={cn(
                        "pr-10 transition-all duration-200",
                        isValidUrl ? "border-green-500 focus:border-green-500" : localData.url ? "border-red-500 focus:border-red-500" : ""
                      )}
                    />
                    {localData.url && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isValidUrl ? <div className="h-2 w-2 rounded-full bg-green-500" /> : <AlertCircle className="h-4 w-4 text-red-500" />}
                      </div>
                    )}
                  </div>
                  {localData.url && !isValidUrl && <p className="text-xs text-red-500">{t.video.invalidUrl}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video-title" className="text-sm font-medium">
                    {t.video.titleOptional}
                  </Label>
                  <Input
                    id="video-title"
                    value={localData.title}
                    onChange={(e) => handleSettingsChange("title", e.target.value)}
                    placeholder={t.video.titlePlaceholder}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="aspect-ratio" className="text-sm font-medium">
                      {t.video.aspectRatio}
                    </Label>
                    <Select value={localData.aspectRatio} onValueChange={(value) => handleSettingsChange("aspectRatio", value)}>
                      <SelectTrigger id="aspect-ratio">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16/9">{t.video.widescreen}</SelectItem>
                        <SelectItem value="4/3">{t.video.standard}</SelectItem>
                        <SelectItem value="1/1">{t.video.square}</SelectItem>
                        <SelectItem value="21/9">{t.video.ultrawide}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alignment" className="text-sm font-medium">
                      {t.alignment}
                    </Label>
                    <Select value={localData.align} onValueChange={(value) => handleSettingsChange("align", value)}>
                      <SelectTrigger id="alignment">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">{t.left}</SelectItem>
                        <SelectItem value="center">{t.center}</SelectItem>
                        <SelectItem value="right">{t.right}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium text-sm">{t.video.playbackOptions}</h4>
                  <div className="space-y-3">
                    {[
                      { key: "controls", label: t.video.showControls, description: t.video.showControlsDesc },
                      { key: "autoplay", label: t.video.autoplay, description: t.video.autoplayDesc },
                      { key: "muted", label: t.video.muted, description: t.video.mutedDesc },
                      { key: "loop", label: t.video.loop, description: t.video.loopDesc },
                    ].map((option) => (
                      <div key={option.key} className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">{option.label}</Label>
                          <p className="text-xs text-muted-foreground">{option.description}</p>
                        </div>
                        <Switch
                          checked={localData[option.key as keyof typeof localData] as boolean}
                          onCheckedChange={(checked) => handleSettingsChange(option.key, checked)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-4 border-t">
                <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                  {t.video.closeSettings}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}

      <div className={cn("flex w-full", alignmentClasses[displayData.align])}>
        <div className="w-full max-w-4xl">
          {displayData.title && (
            <motion.div className="mb-4 text-center" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h3 className="text-xl font-semibold text-foreground">{displayData.title}</h3>
            </motion.div>
          )}

          <Card className="overflow-hidden border-2 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-0">
              {isValidUrl ? (
                <div className={cn("relative", aspectRatioClasses[displayData.aspectRatio as keyof typeof aspectRatioClasses])}>
                  <iframe
                    src={getEmbedUrl()}
                    title={displayData.title || "YouTube video"}
                    className="absolute inset-0 w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />

                  {displayData.url && (
                    <motion.div
                      className="absolute top-4 left-4 z-10"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                        <Play className="h-3 w-3 mr-1" />
                        YouTube
                      </Badge>
                    </motion.div>
                  )}

                  <motion.a
                    href={displayData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button size="sm" variant="secondary" className="bg-background/90 backdrop-blur-sm">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      {t.video.openInYoutube}
                    </Button>
                  </motion.a>
                </div>
              ) : (
                <motion.div
                  className={cn(
                    "flex flex-col items-center justify-center bg-muted/30 border-2 border-dashed border-muted-foreground/30 rounded-lg",
                    aspectRatioClasses[displayData.aspectRatio as keyof typeof aspectRatioClasses]
                  )}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center space-y-3 p-8">
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Video className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-medium text-foreground">{t.video.addVideo}</h3>
                      <p className="text-sm text-muted-foreground max-w-sm">{isEditable ? t.video.clickToAdd : t.video.noVideoUrl}</p>
                    </div>
                    {isEditable && (
                      <Button variant="outline" onClick={() => setIsSettingsOpen(true)} className="mt-4">
                        <Settings2 className="h-4 w-4 mr-2" />
                        {t.video.configureVideo}
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
