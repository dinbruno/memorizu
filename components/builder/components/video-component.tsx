"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Settings, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface VideoComponentProps {
  data: {
    url: string;
    title?: string;
    autoplay?: boolean;
    controls?: boolean;
    muted?: boolean;
    loop?: boolean;
    width?: string;
    height?: string;
    aspectRatio?: string;
    align?: string;
  };
  onUpdate?: (data: any) => void;
  isEditable?: boolean;
  isInlineEdit?: boolean;
}

export function VideoComponent({ data, onUpdate, isEditable, isInlineEdit }: VideoComponentProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getEmbedUrl = () => {
    const videoId = getYouTubeVideoId(data.url);
    if (!videoId) return null;

    const params = new URLSearchParams();
    if (data.autoplay) params.append("autoplay", "1");
    if (!data.controls) params.append("controls", "0");
    if (data.muted) params.append("mute", "1");
    if (data.loop) params.append("loop", "1");

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  };

  const embedUrl = getEmbedUrl();

  const handleUpdate = (updates: Partial<typeof data>) => {
    if (onUpdate) {
      onUpdate({ ...data, ...updates });
    }
  };

  const alignmentClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  } as any;

  if (!embedUrl && !isEditable) {
    return (
      <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Invalid YouTube URL</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`w-full flex ${alignmentClasses[data.align || "center"]}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative group" style={{ width: data.width || "100%", maxWidth: "800px" }}>
        {data.title && <h3 className="text-lg font-semibold mb-4 text-center">{data.title}</h3>}

        <div
          className="relative overflow-hidden rounded-lg shadow-lg"
          style={{
            aspectRatio: data.aspectRatio || "16/9",
            height: data.height || "auto",
          }}
        >
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={data.title || "YouTube Video"}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100 border-2 border-dashed border-gray-300">
              <div className="text-center">
                <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Add YouTube URL</p>
                {isEditable && (
                  <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {isEditable && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Video Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="video-url">YouTube URL</Label>
                    <Input
                      id="video-url"
                      value={data.url || ""}
                      onChange={(e) => handleUpdate({ url: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="video-title">Title (optional)</Label>
                    <Input
                      id="video-title"
                      value={data.title || ""}
                      onChange={(e) => handleUpdate({ title: e.target.value })}
                      placeholder="Video title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="video-align">Alignment</Label>
                    <Select value={data.align || "center"} onValueChange={(value) => handleUpdate({ align: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="video-aspect">Aspect Ratio</Label>
                    <Select value={data.aspectRatio || "16/9"} onValueChange={(value) => handleUpdate({ aspectRatio: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16/9">16:9 (Widescreen)</SelectItem>
                        <SelectItem value="4/3">4:3 (Standard)</SelectItem>
                        <SelectItem value="1/1">1:1 (Square)</SelectItem>
                        <SelectItem value="21/9">21:9 (Ultrawide)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="autoplay">Autoplay</Label>
                      <Switch id="autoplay" checked={data.autoplay || false} onCheckedChange={(checked) => handleUpdate({ autoplay: checked })} />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="controls">Show Controls</Label>
                      <Switch id="controls" checked={data.controls !== false} onCheckedChange={(checked) => handleUpdate({ controls: checked })} />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="muted">Muted</Label>
                      <Switch id="muted" checked={data.muted || false} onCheckedChange={(checked) => handleUpdate({ muted: checked })} />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="loop">Loop</Label>
                      <Switch id="loop" checked={data.loop || false} onCheckedChange={(checked) => handleUpdate({ loop: checked })} />
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {embedUrl && (
          <div className="mt-2 flex justify-center">
            <Button variant="ghost" size="sm" onClick={() => window.open(data.url, "_blank")}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Watch on YouTube
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
